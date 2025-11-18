// src/app/features/orders/data/orders.api.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SalesOrderPage, SalesOrderSummary } from './orders.models';

export interface OrderWithItems extends SalesOrderSummary {
  clientName?: string;
  clientTaxId?: string;
  items: Array<{
    productId: number;
    productName?: string;
    unitPrice?: number;
    quantity: number;
    lineTotal?: number;
  }>;
  totalAmount?: number;
}
@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly base = `${environment.apiUrl}/api/orders`;

  constructor(private readonly http: HttpClient) {}

  list(opts: { page?: number; size?: number; q?: string; status?: string } = {}): Observable<SalesOrderPage> {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 10));

    if (opts.q) params = params.set('q', opts.q);
    if (opts.status) params = params.set('status', opts.status);

    return this.http.get<SalesOrderPage>(this.base, { params });
  }

  getById(id: number): Observable<OrderWithItems> {
    return this.http.get<OrderWithItems>(`${this.base}/${id}`);
  }

  create(body: { clientId: number; items: Array<{ productId: number; quantity: number }> }): Observable<SalesOrderSummary> {
    return this.http.post<SalesOrderSummary>(this.base, body);
  }

  approve(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/approve`, {});
  }

  downloadOrderPdf(id: number) {
    return this.http.get(`${this.base}/${id}/pdf`, {
      responseType: 'blob'
    });
  }


  createPaymentPreference(id: number) {
    return this.http.post<{
      orderId: number;
      mpPreferenceId: string;
      mpInitPoint: string;
      totalAmount: number;
    }>(`${this.base}/${id}/payment`, {});
  }
  
}
