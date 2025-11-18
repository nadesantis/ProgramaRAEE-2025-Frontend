import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface UserLite {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly base = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getTechnicians(): Observable<UserLite[]> {
    return this.http.get<UserLite[]>(`${this.base}/technicians`);
  }
}
