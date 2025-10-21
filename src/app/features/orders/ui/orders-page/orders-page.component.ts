import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersApi } from '../../data/orders.api';
import { Order } from '../../data/orders.models';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { HasRoleDirective } from '../../../../core/auth/hash-core.directive';

type OrderView = Order & {
  totalDisplay: string;
  clientName: string;
  createdAt: string;
  status: string;
};

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableComponent, MatCardModule,
    MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
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

  loading = signal(false);
  data: OrderView[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;

  clientId = new FormControl<number | null>(null);

  private dtf = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  private money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
  private statusMap: Record<string, string> = { PENDING: 'Pendiente', APPROVED: 'Aprobado' };

  columns: TableColumn<OrderView>[] = [
    // { key: 'id', header: 'ID', width: '80px' },
    { key: 'clientName', header: 'Cliente' },
    { key: 'status', header: 'Estado', width: '120px' },
    { key: 'totalDisplay', header: 'Total' },
    { key: 'createdAt', header: 'Fecha' }
  ];

  ngOnInit(): void { this.load(); }

  private withComputed(o: Order): OrderView {
    const rawTotal =
      (o as any).totalAmount ??
      (o as any).total ??
      (o.items ?? []).reduce((acc, it) => acc + ((it.unitPrice ?? 0) * (it.quantity ?? 0)), 0);

    const clientName = (o as any).clientName ?? `#${o.clientId}`;
    const created = o.createdAt ? this.dtf.format(new Date(o.createdAt)) : '—';
    const statusRaw = (o as any).status;
    const status = this.statusMap[statusRaw] ?? statusRaw ?? '—';

    return {
      ...o,
      clientName,
      status,
      createdAt: created,
      totalDisplay: rawTotal > 0 ? this.money.format(rawTotal) : '—'
    } as OrderView;
  }

  load(): void {
    this.loading.set(true);
    const cid = this.clientId.value ?? undefined;

    this.api.list({ page: this.pageIndex, size: this.pageSize, clientId: cid }).subscribe({
      next: (res) => {
        this.data = res.content.map(o => this.withComputed(o));
        this.total = res.totalElements;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPaginate(ev: PageEvent) {
    this.pageIndex = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.load();
  }

  search() { this.pageIndex = 0; this.load(); }

  clearFilter() { this.clientId.setValue(null); this.search(); }

  newOrder() { this.router.navigate(['/orders/new']); }

  approve(o: Order) {
    if (!this.auth.hasRole('ADMIN')) {
      this.sb.open('Solo ADMIN puede aprobar', 'Ok', { duration: 2000 });
      return;
    }
    this.loading.set(true);
    this.api.approve(o.id).subscribe({
      next: () => { this.sb.open(`Orden #${o.id} aprobada`, 'Ok', { duration: 2000 }); this.load(); },
      error: () => { this.loading.set(false); this.sb.open('Error al aprobar', 'Ok', { duration: 2000 }); }
    });
  }

  onAction(ev: { type: string; row: Order }) {
    if (ev.type === 'edit') this.router.navigate(['/orders', ev.row.id, 'edit']);
    if (ev.type === 'approve') this.approve(ev.row);
  }
}
