import { Routes } from '@angular/router';
import { ProductsPageComponent } from './ui/products-page/products-page.component';
import { ProductFormComponent } from './ui/product-form/product-form.component';
import { AuthGuard } from '../../core/auth/auth.guard';
import { RoleGuard } from '../../core/auth/role.guard';

export const PRODUCTS_ROUTES: Routes = [
  { path: '', component: ProductsPageComponent, canActivate: [AuthGuard] }, 
  { path: 'new', component: ProductFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: ':id/edit', component: ProductFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
];
