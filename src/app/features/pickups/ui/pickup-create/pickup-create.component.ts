import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PickupsApi } from '../../data/pickups.api';
import { ClientsApi } from '../../../clients/data/clients.api';
import { Client } from '../../../clients/data/clients.models';

@Component({
  selector: 'app-pickup-create',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './pickup-create.component.html',
  styleUrls: ['./pickup-create.component.css']
})
export class PickupCreateComponent {
  private fb = inject(FormBuilder);
  private api = inject(PickupsApi);
  private clientsApi = inject(ClientsApi);
  private router = inject(Router);
  private sb = inject(MatSnackBar);

  loading = signal(false);
  clientes: Client[] = [];

  // 👇 ahora clientId es select; raeeKg agregado (>= 0.01)
  form = this.fb.group({
    clientId: [null as number | null, [Validators.required]],
    location: [''],
    notes: [''],
    raeeKg: [null as number | null, [Validators.min(0), Validators.max(1_000_000)]]
  });

  constructor() {
    // Cargo hasta 100 clientes para el combo (puedes ajustar)
    this.clientsApi.list({ page: 0, size: 100 })
      .subscribe(res => this.clientes = res.content);
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.api.create(this.form.value as any).subscribe({
      next: o => {
        this.loading.set(false);
        this.sb.open(`Recolección #${o.id} creada`, 'Ok', { duration: 2000 });
        this.router.navigate(['/pickups']);
      },
      error: () => { this.loading.set(false); this.sb.open('Error al crear', 'Ok', { duration: 2000 }); }
    });
  }

  cancel(): void { this.router.navigate(['/pickups']); }
}
