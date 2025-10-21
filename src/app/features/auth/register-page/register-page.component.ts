import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css'],
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // 👇 usadas en el template
  hide = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);

  roles = ['CLIENTE', 'USER'];

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['CLIENTE'],
  });

  ngOnInit() {
    const token = localStorage.getItem('access_token');
    if (token) this.router.navigate(['/']);
  }

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.auth.register(this.form.value as any).subscribe({
      next: () => {
        this.loading.set(false);
        // Registro ok -> a login
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);

        const status = err?.status;
        let msg = 'register.errors.generic'; 
        if (status === 400) msg = 'register.errors.badData';        
        else if (status === 401) msg = 'register.errors.unauthorized';
        else if (status === 403) msg = 'register.errors.forbidden';
        else if (status === 413) msg = 'register.errors.tooManyAttempts';
        else if (status === 423) msg = 'register.errors.locked';
        else if (err?.error?.message) msg = err.error.message;
        else if (err?.error?.error) msg = err.error.error;

        this.error.set(msg);
      },
    });
  }
}
