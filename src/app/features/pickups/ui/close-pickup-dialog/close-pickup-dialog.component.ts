import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ClosePickupRequest } from '../../data/pickups.models';

@Component({
  selector: 'app-close-pickup-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule
  ],
  templateUrl: './close-pickup-dialog.component.html'
})
export class ClosePickupDialogComponent {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<ClosePickupDialogComponent, ClosePickupRequest | null>);

  form = this.fb.group({
    closedAt: [''],                         // input datetime-local → string ISO al enviar
    durationMinutes: [null as number | null, [Validators.min(0)]],
    devicesCount: [null as number | null, [Validators.min(0)]],
    notes: ['']
  });

  cancel()  { this.ref.close(null); }

  save() {
    const v = this.form.value;
    const body: ClosePickupRequest = {
      notes: v.notes || undefined,
      durationMinutes: v.durationMinutes ?? undefined,
      devicesCount: v.devicesCount ?? undefined,
      closedAt: v.closedAt ? new Date(v.closedAt as string).toISOString() : undefined
    };
    this.ref.close(body);
  }
}
