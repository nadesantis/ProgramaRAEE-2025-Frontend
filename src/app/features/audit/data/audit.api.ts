import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuditAction, AuditLog, Page } from './audit.models';

@Injectable({ providedIn: 'root' })
export class AuditApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/audit`;
  private backup = `${environment.apiUrl}/api/backup/pdf`;

  list(opts: {
    user?: string;
    action?: AuditAction;
    page?: number;
    size?: number;
  }) {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 10));

    if (opts.user)   params = params.set('user', opts.user);
    if (opts.action) params = params.set('action', opts.action);

    return this.http.get<Page<AuditLog>>(this.base, { params });
  }

  /** Exporta un backup PDF con solo la sección de auditoría (rango opcional) */
  exportAuditPdf(from?: string, to?: string) {
    let params = new HttpParams()
      .set('products', 'false')
      .set('clients', 'false')
      .set('orders', 'false')
      .set('users', 'false')
      .set('audit', 'true');

    if (from) params = params.set('auditFrom', from);
    if (to)   params = params.set('auditTo', to);

    return this.http.get(this.backup, {
      params,
      responseType: 'blob'
    });
  }

  actions(): AuditAction[] {
    return [
      'LOGIN_SUCCESS','LOGIN_FAILURE',
      'PRODUCT_CREATE','PRODUCT_UPDATE','PRODUCT_DELETE','PRODUCT_READ','PRODUCT_LIST',
      'CLIENT_CREATE','CLIENT_UPDATE','CLIENT_DELETE','CLIENT_READ','CLIENT_LIST',
      'ORDER_CREATE','ORDER_APPROVE','ORDER_READ','ORDER_LIST',
      'USER_CREATE','USER_UPDATE','USER_DELETE','USER_UNLOCK','USER_RESET_PASSWORD','USER_LIST',
      'GENERIC'
    ];
  }
}
