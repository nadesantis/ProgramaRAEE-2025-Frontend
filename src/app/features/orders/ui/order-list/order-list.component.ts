// src/app/orders/pages/order-list/order-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OrdersService } from '../../services/orders.service';
import { OrderSummary } from '../../models/order-summary.model';
import { debounceTime, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ordersSvc = inject(OrdersService);

  displayedColumns = ['createdAt', 'clientName', 'clientTaxId', 'productNames', 'status', 'totalAmount', 'actions'];
  data: OrderSummary[] = [];
  total = 0;
  page = 0;
  size = 10;

  form = this.fb.group({
    q: [''],          // Razón social o CUIT
    status: ['']      // CREATED | APPROVED | CLOSED
  });

  ngOnInit(): void {
    // carga inicial
    this.fetch();

    // reactiva: al cambiar filtros, recarga
    this.form.valueChanges
      .pipe(
        debounceTime(250),
        switchMap(v => this.ordersSvc.list({
          q: v.q ?? undefined,
          status: v.status ?? undefined,
          page: 0, size: this.size
        }))
      )
      .subscribe(res => {
        this.page = 0;
        this.total = res.totalElements;
        this.data = res.content;
      });
  }

  fetch() {
    const { q, status } = this.form.value;
    this.ordersSvc.list({ q: q ?? undefined, status: status ?? undefined, page: this.page, size: this.size })
      .subscribe(res => {
        this.total = res.totalElements;
        this.data = res.content;
      });
  }

  onPageChange(p: number) {
    this.page = p;
    this.fetch();
  }

  clearFilters() {
    this.form.reset({ q: '', status: '' });
  }
}
