import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { RoleGuard } from '../../core/auth/role.guard';
import { PickupsPageComponent } from './ui/pickups-page/pickups-page.component';
import { PickupCreateComponent } from './ui/pickup-create/pickup-create.component';

export const PICKUPS_ROUTES: Routes = [
  { path: '', component: PickupsPageComponent, canActivate: [AuthGuard] },
  {
    path: 'new',
    component: PickupCreateComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN','OPERADOR_VENTAS','OPERADOR_LOGISTICO'] }
  }
];
