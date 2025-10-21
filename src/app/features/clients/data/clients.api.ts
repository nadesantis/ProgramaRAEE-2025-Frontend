import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Client, ClientPage, ClientRequest } from './clients.models';

@Injectable({ providedIn: 'root' })
export class ClientsApi {
  private readonly base = `${environment.apiUrl}/api/clients`;

  constructor(private readonly http: HttpClient) {}

  list(opts: { page?: number; size?: number; name?: string } = {}) {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 10));
    if (opts.name) params = params.set('name', opts.name); 
    return this.http.get<ClientPage>(this.base, { params });
  }
  

  get(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.base}/${id}`);
  }

  create(body: ClientRequest): Observable<Client> {
    return this.http.post<Client>(this.base, body);
  }

  update(id: number, body: ClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
