import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PickupsApi } from '../../data/pickups.api';

@Component({
  selector: 'app-pickup-create',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './pickup-create.component.html',
  styleUrls: ['./pickup-create.component.css']
})
export class PickupCreateComponent {
  private fb = inject(FormBuilder);
  private api = inject(PickupsApi);
  private router = inject(Router);
  private sb = inject(MatSnackBar);

  loading = signal(false);

  form = this.fb.group({
    clientId: [null as number | null, [Validators.required]],
    location: [''],
    notes: ['']
  });

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
