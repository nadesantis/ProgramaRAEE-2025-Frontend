import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UsersApi, UserLite } from '../../../data/users.api';

@Component({
  selector: 'app-tech-select-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './tech-select-dialog.component.html',
  styleUrls: ['./tech-select-dialog.component.css']
})
export class TechSelectDialogComponent implements OnInit {
  // estado
  loading = true;
  techs: UserLite[] = [];
  view: UserLite[] = [];

  // buscador
  search = new FormControl<string>('', { nonNullable: true });

  constructor(
    private ref: MatDialogRef<TechSelectDialogComponent, number | null>,
    private api: UsersApi,
    @Inject(MAT_DIALOG_DATA) public data: unknown
  ) {}

  ngOnInit(): void {
    this.api.getTechnicians().subscribe({
      next: list => {
        this.techs = list ?? [];
        this.view = this.techs.slice();   // mostrar todos de entrada
        this.loading = false;
      },
      error: () => {
        this.techs = [];
        this.view = [];
        this.loading = false;
      }
    });

    this.search.valueChanges.subscribe(term => {
      const q = (term ?? '').trim().toLowerCase();
      this.view = !q
        ? this.techs.slice()
        : this.techs.filter(t =>
            (t.name ?? '').toLowerCase().includes(q) ||
            (t.email ?? '').toLowerCase().includes(q)
          );
    });
  }

  pick(id: number) { this.ref.close(id); }
  close() { this.ref.close(null); }
}
