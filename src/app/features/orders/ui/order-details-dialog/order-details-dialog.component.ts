// src/app/features/orders/ui/order-details-dialog/order-details-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { OrdersApi } from '../../data/orders.api';

type OrderItemVM = {
  productId?: number;
  productName?: string;
  unitPrice?: number | string | null;
  quantity?: number | string | null;
  lineTotal?: number | string | null;
};

type OrderVM = {
  id: number;
  clientName?: string;
  clientTaxId?: string;
  status?: string;
  createdAt?: string;
  totalAmount?: number | string | null;
  total?: number | string | null;
  items?: OrderItemVM[];
};

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.css'],
})
export class OrderDetailsDialogComponent {


  loadingMp = false;  
 

  private dtf = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

  // 👇 mapa de estados correcto
  private static readonly statusMap: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    CLOSED: 'Cerrada',
    CREATED: 'Pendiente',
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: OrderVM,
    private ref: MatDialogRef<OrderDetailsDialogComponent>,
    private ordersApi: OrdersApi,
  ) {}

  // === Helpers públicos que usa el template ===


  payWithMp(): void {
    if (!this.data?.id || this.loadingMp) return;

    this.loadingMp = true;

    this.ordersApi.createPaymentPreference(this.data.id).subscribe({
      next: resp => {
        this.loadingMp = false;

        if (resp && resp.mpInitPoint) {
          // Redirigimos al checkout de Mercado Pago
          window.location.href = resp.mpInitPoint;
        } else {
          console.error('Respuesta MP inválida', resp);
          // acá podrías mostrar un snackbar si querés
        }
      },
      error: err => {
        this.loadingMp = false;
        console.error('Error creando preferencia MP', err);
        // snackbar opcional
      }
    });
  }

  /** Parseo seguro a number (tolera string/number/null/undefined) */
  public num(v: unknown): number {
    if (v == null) return 0;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  /** Subtotal de una fila (lineTotal si viene, si no unitPrice * quantity) */
  public rowSubtotal(it: OrderItemVM): number {
    const lt = this.num(it?.lineTotal);
    if (lt) return lt;
    return this.num(it?.unitPrice) * this.num(it?.quantity);
  }

  /** Total de la orden (prefiere totalAmount/total, si no suma ítems) */
  public get total(): number {
    const t = this.num((this.data as any)?.totalAmount ?? (this.data as any)?.total);
    if (t) return t;
    const items = this.data?.items ?? [];
    return items.reduce((acc, it) => acc + this.rowSubtotal(it), 0);
  }

  /** Estado legible en español */
  public statusDisplay(): string {
    const s = (this.data?.status ?? '') as string;
    return OrderDetailsDialogComponent.statusMap[s] ?? (s || '—');
  }

  /** Fecha formateada */
  public createdDisplay(): string {
    const c = this.data?.createdAt;
    return c ? this.dtf.format(new Date(c)) : '—';
  }

  public close(): void { this.ref.close(); }


  downloadPdf(): void {
    if (!this.data?.id) return;

    this.ordersApi.downloadOrderPdf(this.data.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orden-${this.data.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }
}
