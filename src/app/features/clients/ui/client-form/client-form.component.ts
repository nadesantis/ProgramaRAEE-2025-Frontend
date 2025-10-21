import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientsApi } from '../../data/clients.api';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ClientsApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  isEdit = signal(false);
  id?: number;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
    email: ['', []],
    phone: [''],
    taxId: [''],
    addresses: this.fb.array<FormGroup>([])
  });

  get addresses(): FormArray<FormGroup> {
    return this.form.controls.addresses as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.id = Number(idParam);
      this.loading.set(true);
      this.api.get(this.id).subscribe({
        next: (c) => {
          this.form.patchValue({
            name: c.name,
            email: c.email ?? '',
            phone: c.phone ?? '',
            taxId: c.taxId ?? ''
          });
          (c.addresses ?? []).forEach(a => this.addAddress(a.street, a.city ?? '', a.state ?? '', a.zip ?? '', a.notes ?? ''));
          if (this.addresses.length === 0) this.addAddress();
          this.loading.set(false);
        },
        error: () => { this.addAddress(); this.loading.set(false); }
      });
    } else {
      this.addAddress(); // al menos una
    }
  }

  addAddress(street = '', city = '', state = '', zip = '', notes = '') {
    this.addresses.push(this.fb.group({
      id: [null],
      street: [street, [Validators.required]],
      city: [city],
      state: [state],
      zip: [zip],
      notes: [notes]
    }));
  }

  removeAddress(i: number) {
    this.addresses.removeAt(i);
  }

  save(): void {
    if (this.form.invalid) return;
    const body = this.form.value as any;
    this.loading.set(true);

    const req$ = this.isEdit() && this.id
      ? this.api.update(this.id, body)
      : this.api.create(body);

    req$.subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/clients']); },
      error: () => this.loading.set(false)
    });
  }

  cancel(): void {
    this.router.navigate(['/clients']);
  }
}
