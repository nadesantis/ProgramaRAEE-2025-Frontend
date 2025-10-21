import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    TranslateModule
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  hide = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit() {
    const token = localStorage.getItem('access_token');
    if (token) this.router.navigate(['/']);
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const payload = {
      email: this.form.value.email!.toLowerCase().trim(),
      password: this.form.value.password!
    };

    this.auth.login(payload as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);

        const status: number | undefined = err?.status;
        const beMsg: string | undefined =
          err?.error?.message || err?.error?.error || err?.error?.detail;

        let msg = 'No se pudo iniciar sesión.';

        if (status === 401) {
          msg = beMsg || 'Usuario o contraseña inválidos.';
        } else if (status === 413) {
          const left = err?.error?.remainingAttempts;
          msg = beMsg || (left != null
            ? `Demasiados intentos fallidos. Intentos restantes: ${left}.`
            : 'Demasiados intentos fallidos. Intentá más tarde.');
        } else if (status === 423) {
          msg = beMsg || 'Tu cuenta está bloqueada. Contactá al administrador.';
        } else if (status && status >= 500) {
          msg = 'Error interno del servidor. Intentá nuevamente.';
        } else if (beMsg) {
          msg = beMsg;
        }

        this.error.set(msg);
      }
    });
  }
}
