import { Routes } from '@angular/router';
import { ClientsPageComponent } from './ui/clients-page/clients-page.component';
import { ClientFormComponent } from './ui/client-form/client-form.component';
import { AuthGuard } from '../../core/auth/auth.guard';
import { RoleGuard } from '../../core/auth/role.guard';

export const CLIENTS_ROUTES: Routes = [
  { path: '', component: ClientsPageComponent, canActivate: [AuthGuard] }, 
  { path: 'new', component: ClientFormComponent, canActivate: [AuthGuard] },
  { path: ':id/edit', component: ClientFormComponent, canActivate: [AuthGuard] },
];
