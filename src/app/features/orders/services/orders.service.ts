// src/app/orders/services/orders.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderSummary } from '../models/order-summary.model';

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private baseUrl = '/api/orders';

  list(opts: { q?: string; status?: string; page?: number; size?: number }): Observable<Page<OrderSummary>> {
    let params = new HttpParams();
    if (opts.q) params = params.set('q', opts.q);
    if (opts.status) params = params.set('status', opts.status);
    params = params.set('page', String(opts.page ?? 0));
    params = params.set('size', String(opts.size ?? 10));
    return this.http.get<Page<OrderSummary>>(this.baseUrl, { params });
  }
}
