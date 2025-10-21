import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.auth.hasValidToken()) return this.router.parseUrl('/login');

    const allowed: string[] = route.data?.['roles'] ?? [];
    if (allowed.length === 0) return true;

    const ok = allowed.some(r => this.auth.hasRole(r));
    return ok ? true : this.router.parseUrl('/'); 
  }
}
