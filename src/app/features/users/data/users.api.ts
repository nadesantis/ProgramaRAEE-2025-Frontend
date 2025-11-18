// src/app/features/users/data/users.api.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  User, UserPage,
  CreateUserRequest, UpdateUserRequest, ChangePasswordRequest
} from './users.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly base = `${environment.apiUrl}/api/admin/users`;

  constructor(private http: HttpClient) {}

  list(opts: { page?: number; size?: number; q?: string } = {}): Observable<UserPage> {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 10));
    if (opts.q) params = params.set('q', opts.q);
    return this.http.get<UserPage>(this.base, { params });
  }

  get(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  create(body: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.base, body);
  }

  update(id: number, body: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  changePassword(id: number, body: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/reset-password`, body);
  }

  // NUEVO: match con POST /{id}/unlock del backend
  unlock(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/unlock`, {});
  }
}
