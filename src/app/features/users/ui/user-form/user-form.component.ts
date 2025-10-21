import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersApi } from '../../data/users.api';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateUserRequest, UpdateUserRequest, User } from '../../data/users.models';

const ALL_ROLES = ['ADMIN','ADMIN_VENTAS','OPERADOR_VENTAS','OPERADOR_LOGISTICO','TECNICO','CLIENTE','USER'] as const;

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(UsersApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sb = inject(MatSnackBar);

  loading = signal(false);
  isEdit = signal(false);
  id?: number;
  roles = [...ALL_ROLES];

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    roles: [[] as string[]],
    password: ['']
  });

  newPassword = this.fb.control('');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.id = Number(idParam);
      this.api.get(this.id).subscribe({
        next: (u: User) => {
          this.form.patchValue({
            name: u.name,
            email: u.email,
            roles: u.roles ?? [],
            password: ''
          });
        }
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    if (this.isEdit() && this.id) {
      const body: UpdateUserRequest = {
        name: this.form.value.name!,
        email: this.form.value.email!,
        roles: this.form.value.roles ?? []
      };
      this.api.update(this.id, body).subscribe({
        next: () => this.done('Usuario actualizado'),
        error: () => this.fail('Error al actualizar')
      });
    } else {
      const body: CreateUserRequest = {
        name: this.form.value.name!,
        email: this.form.value.email!,
        roles: this.form.value.roles ?? [],
        password: this.form.value.password || ''
      };
      this.api.create(body).subscribe({
        next: () => this.done('Usuario creado'),
        error: () => this.fail('Error al crear')
      });
    }
  }

  changePassword(): void {
    if (!this.id) return;
    const pwd = (this.newPassword.value || '').trim();
    if (pwd.length < 6) return;
    this.loading.set(true);
    this.api.changePassword(this.id, { password: pwd }).subscribe({
      next: () => this.done('Contraseña actualizada'),
      error: () => this.fail('Error al cambiar contraseña')
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  private done(msg: string) {
    this.loading.set(false);
    this.sb.open(msg, 'Ok', { duration: 2000 });
    this.router.navigate(['/users']);
  }

  private fail(msg: string) {
    this.loading.set(false);
    this.sb.open(msg, 'Ok', { duration: 2000 });
  }
}
