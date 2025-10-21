import { Routes } from '@angular/router';
import { UsersPageComponent } from './ui/users-page/users-page.component';
import { UserFormComponent } from './ui/user-form/user-form.component';

export const USERS_ROUTES: Routes = [
  { path: '', component: UsersPageComponent },
  { path: 'new', component: UserFormComponent },
  { path: ':id/edit', component: UserFormComponent }
];
