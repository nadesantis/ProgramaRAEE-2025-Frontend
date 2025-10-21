import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateOrderRequest, Order, OrderPage } from './orders.models';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly base = `${environment.apiUrl}/api/orders`;

  constructor(private readonly http: HttpClient) {}

  list(opts: { page?: number; size?: number; clientId?: number } = {}) {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 10));
  
    if (opts.clientId != null) {
      params = params.set('clientId', String(opts.clientId));  // <-- backend: ?clientId=#
    }
  
    return this.http.get<OrderPage>(this.base, { params });
  }
  

  get(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  create(body: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.base, body);
  }

  approve(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/approve`, {});
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  
}
