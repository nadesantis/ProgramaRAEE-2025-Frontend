import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BackupApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/backup`;

  // ✅ EXPORT EXCEL (ya lo tenías bien)
  exportExcel() {
    return this.http.get(`${this.base}/excel`, { responseType: 'blob' });
  }

  // ✅ IMPORT EXCEL (ARREGLADO endpoint)
  importExcel(file: File, dryRun = true) {
    const form = new FormData();
    form.append('file', file);
    form.append('dryRun', String(dryRun));
    return this.http.post(`${this.base}/excel/import`, form); 
  }

  exportPdf(opts: {
    products?: boolean;
    clients?: boolean;
    orders?: boolean;
    users?: boolean;       
    auditIncluded?: boolean;
    auditFrom?: string;      
    auditTo?: string;        
  }) {
    let params = new HttpParams()
      .set('products', String(opts.products ?? true))
      .set('clients', String(opts.clients ?? true))
      .set('orders', String(opts.orders ?? true))
      .set('users', String(opts.users ?? false))        
      .set('auditIncluded', String(opts.auditIncluded ?? false));

    if (opts.auditFrom) params = params.set('auditFrom', opts.auditFrom);
    if (opts.auditTo)   params = params.set('auditTo', opts.auditTo);

    return this.http.get(`${this.base}/pdf`, {
      params,
      responseType: 'blob'
    });
  }
}
