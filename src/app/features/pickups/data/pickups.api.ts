import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { PickupOrder, PickupOrderPage, CreatePickupRequest, AssignPickupRequest, ClosePickupRequest, PickupStatus } from './pickups.models';
export interface IdName { id: number; name: string; }
@Injectable({ providedIn: 'root' })


export class PickupsApi {
  private readonly base = `${environment.apiUrl}/api/pickups`;

  constructor(private http: HttpClient) {}

  list(opts: { page?: number; size?: number; status?: PickupStatus } = {}): Observable<PickupOrderPage> {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 10));
    if (opts.status) params = params.set('status', opts.status);
    return this.http.get<PickupOrderPage>(this.base, { params });
  }



listTechnicians() {
  return this.http.get<IdName[]>(`${this.base}/technicians`);
}

  get(id: number)               { return this.http.get<PickupOrder>(`${this.base}/${id}`); }
  create(body: CreatePickupRequest) { return this.http.post<PickupOrder>(this.base, body); }
  approve(id: number)           { return this.http.post<PickupOrder>(`${this.base}/${id}/approve`, {}); }
  assign(id: number, body: AssignPickupRequest) { return this.http.post<PickupOrder>(`${this.base}/${id}/assign`, body); }
  start(id: number)             { return this.http.post<PickupOrder>(`${this.base}/${id}/start`, {}); }
  close(id: number, body: ClosePickupRequest) {
    return this.http.post<PickupOrder>(`${this.base}/${id}/close`, body);
  }

  delete(id: number) { 
    return this.http.delete<void>(`${this.base}/${id}`); 
  }
 
}
