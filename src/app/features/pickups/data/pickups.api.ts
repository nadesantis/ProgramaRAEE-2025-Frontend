import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  PickupOrder, PickupOrderPage, CreatePickupRequest,
  AssignPickupRequest, ClosePickupRequest, PickupStatus
} from './pickups.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PickupsApi {
  private readonly base = `${environment.apiUrl}/api/pickups`;

  constructor(private http: HttpClient) {}

  list(opts: { page?: number; size?: number; clientId?: number; status?: PickupStatus } = {})
  : Observable<PickupOrderPage> {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 10));
    if (opts.clientId != null) params = params.set('clientId', String(opts.clientId));
    if (opts.status) params = params.set('status', opts.status);
    return this.http.get<PickupOrderPage>(this.base, { params });
  }

  get(id: number): Observable<PickupOrder> {
    return this.http.get<PickupOrder>(`${this.base}/${id}`);
  }

  create(body: CreatePickupRequest): Observable<PickupOrder> {
    return this.http.post<PickupOrder>(this.base, body);
  }

  approve(id: number): Observable<PickupOrder> {
    return this.http.post<PickupOrder>(`${this.base}/${id}/approve`, {});
  }

  assign(id: number, body: AssignPickupRequest): Observable<PickupOrder> {
    return this.http.post<PickupOrder>(`${this.base}/${id}/assign`, body);
  }

  start(id: number): Observable<PickupOrder> {
    return this.http.post<PickupOrder>(`${this.base}/${id}/start`, {});
  }

  close(id: number, body: ClosePickupRequest): Observable<PickupOrder> {
    return this.http.post<PickupOrder>(`${this.base}/${id}/close`, body);
  }
}
