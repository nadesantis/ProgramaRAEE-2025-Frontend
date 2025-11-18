/* global google */
declare const google: any;

import { Component, inject, signal, AfterViewInit } from '@angular/core';
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
import { environment } from '../../../../environments/environment';

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
export class LoginPageComponent implements AfterViewInit {
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

  // ============= GOOGLE =============

  ngAfterViewInit(): void {
    this.initGoogleIdentity();
  }

  private initGoogleIdentity(): void {
    try {
      if (typeof google === 'undefined') return;

      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (resp: any) => this.handleGoogleCredential(resp),
        ux_mode: 'popup'
      });

      const btn = document.getElementById('googleSignInButton');
      if (btn) {
        google.accounts.id.renderButton(btn, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular'
        });
      }
    } catch (e) {
      console.warn('No se pudo inicializar Google Identity', e);
    }
  }

  private handleGoogleCredential(resp: any): void {
    this.error.set(null);          // 👈 limpiar error anterior
    const idToken = resp?.credential as string | undefined;
    console.log('GOOGLE RESP', resp);
  
    if (!idToken) {
      this.loading.set(false);
      this.error.set('No se recibió token de Google.');
      return;
    }
  
    this.loading.set(true);
    this.auth.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => this.handleError(err, 'No se pudo iniciar sesión con Google.')
    });
  }
  

  // ============= LOGIN NORMAL =============

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
      error: (err) => this.handleError(err, 'No se pudo iniciar sesión.')
    });
  }

  // ============= ERROR GENÉRICO =============

  private handleError(err: any, defaultMsg: string) {
    this.loading.set(false);

    const status: number | undefined = err?.status;
    const beMsg: string | undefined =
      err?.error?.message || err?.error?.error || err?.error?.detail;

    let msg = defaultMsg;

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
}
