import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product, ProductPage, ProductRequest } from './products.models';

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly base = `${environment.apiUrl}/api/products`;

  constructor(private readonly http: HttpClient) {}

  list(opts: { page?: number; size?: number; name?: string } = {}) {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 10));
    if (opts.name) params = params.set('name', opts.name); 
    return this.http.get<ProductPage>(this.base, { params });
  }


  get(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(body: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.base, body);
  }

  update(id: number, body: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
