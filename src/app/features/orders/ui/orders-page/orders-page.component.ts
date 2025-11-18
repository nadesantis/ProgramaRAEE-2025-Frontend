// src/app/features/orders/ui/orders-page/orders-page.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';

import { OrdersApi } from '../../data/orders.api';
import { SalesOrderSummary } from '../../data/orders.models';
import { TableComponent, TableColumn, TableAction, TableActionKey } from '../../../../shared/components/table/table.component';
import { HasRoleDirective } from '../../../../core/auth/hash-core.directive';
import { AuthService } from '../../../../core/auth/auth.service';
import { OrderDetailsDialogComponent } from '../order-details-dialog/order-details-dialog.component';


type Row = SalesOrderSummary & {
  clientDisplay: string;
  itemsDisplay: string;
  totalDisplay: string;
  createdDisplay: string;
  statusDisplay: string;
};

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableComponent, MatCardModule, MatDialogModule,
    MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, HasRoleDirective
  ],
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.css']
})
export class OrdersPageComponent implements OnInit {
  private api = inject(OrdersApi);
  private router = inject(Router);
  private sb = inject(MatSnackBar);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);

  loading = signal(false);
  data: Row[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;

  q = new FormControl<string>('', { nonNullable: true });
  status = new FormControl<string>('', { nonNullable: true });

  private dtf = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  private money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

  private statusMap: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    CLOSED: 'Cerrada',
    CREATED: 'Pendiente' // por si llegara desde el back
  };

  columns: TableColumn<Row>[] = [
    { key: 'createdDisplay', header: 'Fecha', width: '160px' },
    { key: 'clientDisplay',  header: 'Cliente / CUIT' },
    //{ key: 'itemsDisplay',   header: 'Ítems' },
    { key: 'statusDisplay',  header: 'Estado', width: '120px' },
    //{ key: 'totalDisplay',   header: 'Total',  width: '140px' }
  ];

  // Debe coincidir con el union type que expone tu <app-table>
  tableActions: TableActionKey[] = ['view', 'approve'];

  ngOnInit(): void {
    this.load();
  }

  /** Mapea el DTO de listado del back (OrderSummaryDTO) a las columnas de la tabla */
  private mapRow(o: SalesOrderSummary): Row {
    // El listado trae productNames (no trae items)
    const namesFromSummary = (o as any).productNames as string[] | undefined;

    const itemNames =
      (namesFromSummary && namesFromSummary.length)
        ? namesFromSummary.join(', ')
        : '—';

    const rawTotal =
      (o as any).totalAmount ??
      o.total ??
      0;

    const created = o.createdAt ? this.dtf.format(new Date(o.createdAt)) : '—';
    const statusDisplay = this.statusMap[(o as any).status] ?? (o as any).status ?? '—';
    const clientDisplay = `${o.clientName ?? '—'}${o.clientTaxId ? ' — CUIT ' + o.clientTaxId : ''}`;

    return {
      ...o,
      clientDisplay,
      itemsDisplay: itemNames,
      totalDisplay: rawTotal ? this.money.format(rawTotal) : '—',
      createdDisplay: created,
      statusDisplay
    };
  }

  load(): void {
    this.loading.set(true);
    this.api.list({
      page: this.pageIndex,
      size: this.pageSize,
      q: this.q.value || undefined,
      status: this.status.value || undefined
    }).subscribe({
      next: res => {
        this.data  = (res.content ?? []).map(o => this.mapRow(o));
        this.total = res.totalElements ?? this.data.length;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPaginate(ev: PageEvent) {
    this.pageIndex = ev.pageIndex;
    this.pageSize  = ev.pageSize;
    this.load();
  }

  search() { this.pageIndex = 0; this.load(); }

  clearFilters() {
    this.q.setValue(''); this.status.setValue('');
    this.search();
  }

  newOrder() { this.router.navigate(['/orders/new']); }

// src/app/features/orders/ui/orders-page/orders-page.component.ts
onAction(ev: { type: TableActionKey; row: Row }) {
  if (ev.type === 'view') {
    this.loading.set(true);
    this.api.getById(ev.row.id).subscribe({
      next: (full) => {
        this.loading.set(false);
        this.dialog.open(OrderDetailsDialogComponent, {
          data: full,
          width: '640px'
        });
      },
      error: () => {
        this.loading.set(false);
        this.sb.open('No se pudo cargar el detalle de la orden', 'OK', { duration: 2500 });
      }
    });
    return;
  }
  

  if (ev.type === 'approve') {
    if (!this.auth.hasRole('ADMIN') && !this.auth.hasRole('ADMIN_VENTAS')) {
      this.sb.open('Solo ADMIN / ADMIN_VENTAS puede aprobar', 'Ok', { duration: 2000 });
      return;
    }
    this.loading.set(true);
    this.api.approve(ev.row.id).subscribe({
      next: () => { this.sb.open(`Orden #${ev.row.id} aprobada`, 'Ok', { duration: 2000 }); this.load(); },
      error: (e) => { this.loading.set(false); console.error(e); this.sb.open('Error al aprobar', 'Ok', { duration: 2000 }); }
    });
  }
}

}
