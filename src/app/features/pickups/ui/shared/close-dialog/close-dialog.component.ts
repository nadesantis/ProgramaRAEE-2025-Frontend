import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-close-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Cerrar recolección</h2>
    <form [formGroup]="form" (ngSubmit)="ok()">
      <mat-dialog-content>
        <mat-form-field class="w-full" appearance="outline">
          <mat-label>Notas (opcional)</mat-label>
          <textarea matInput rows="3" formControlName="notes"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="close()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit">Cerrar</button>
      </mat-dialog-actions>
    </form>
  `,
})
export class CloseDialogComponent {  // ←← nombre exportado
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<CloseDialogComponent, string | null>,
    @Inject(MAT_DIALOG_DATA) public data: { notes: string }
  ) {
    this.form = this.fb.group({
      notes: [data?.notes ?? '', [Validators.maxLength(500)]],
    });
  }

  close() { this.ref.close(null); }
  ok()    { this.ref.close(this.form.value.notes ?? ''); }
}
