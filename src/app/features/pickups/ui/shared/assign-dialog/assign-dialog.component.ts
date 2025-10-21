import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-assign-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Asignar técnico</h2>
    <form [formGroup]="form" (ngSubmit)="ok()">
      <mat-dialog-content>
        <mat-form-field class="w-full" appearance="outline">
          <mat-label>ID técnico</mat-label>
          <input matInput type="number" formControlName="technicianId" />
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="close()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Asignar</button>
      </mat-dialog-actions>
    </form>
  `,
})
export class AssignDialogComponent {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<AssignDialogComponent, number | null>,
    @Inject(MAT_DIALOG_DATA) public data: { technicianId: number | null }
  ) {
    this.form = this.fb.group({
      technicianId: [data?.technicianId ?? null, [Validators.required, Validators.min(1)]],
    });
  }

  close() { this.ref.close(null); }
  ok()    { this.ref.close(this.form.value.technicianId ?? null); }
}
