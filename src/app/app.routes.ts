import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { RoleGuard } from './core/auth/role.guard';
import { LoginPageComponent } from './features/auth/login-page/login-page.component';
import { ShellComponent } from './layout/shell/shell.component';
import { RegisterPageComponent } from './features/auth/register-page/register-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },


  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },

      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES)
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('./features/clients/clients.routes').then(m => m.CLIENTS_ROUTES)
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES)
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then(m => m.USERS_ROUTES)
      },
      {
        path: 'pickups',
        loadChildren: () =>
          import('./features/pickups/pickups.routes').then(m => m.PICKUPS_ROUTES)
      },
      {
        path: 'audit',
        loadChildren: () =>
          import('./features/audit/audit.routes').then(m => m.AUDIT_ROUTES)
      },
      {
        path: 'backup',
        loadChildren: () =>
          import('./features/backup/backup.routes').then(m => m.BACKUP_ROUTES)
      },


      
      
    ]
  },

  { path: '**', redirectTo: '' }
];
