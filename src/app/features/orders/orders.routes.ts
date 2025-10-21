import { Routes } from '@angular/router';
import { OrdersPageComponent } from './ui/orders-page/orders-page.component';
import { OrderCreateComponent } from './ui/order-create/order-create.component';
import { AuthGuard } from '../../core/auth/auth.guard';
import { RoleGuard } from '../../core/auth/role.guard';

export const ORDERS_ROUTES: Routes = [
  { path: '', component: OrdersPageComponent, canActivate: [AuthGuard] }, 
  { path: 'new', component: OrderCreateComponent, canActivate: [AuthGuard] }, 
];
