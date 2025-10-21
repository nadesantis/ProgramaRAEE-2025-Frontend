import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsApi } from '../../data/products.api';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ProductsApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  isEdit = signal(false);
  id?: number;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    active: [true]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.id = Number(idParam);
      this.loading.set(true);
      this.api.get(this.id).subscribe({
        next: (p) => {
          this.form.patchValue({
            name: p.name,
            description: p.description ?? '',
            unitPrice: p.unitPrice,
            active: p.active
          });
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;

    const body = this.form.value as any;
    this.loading.set(true);

    const req$ = this.isEdit() && this.id
      ? this.api.update(this.id, body)
      : this.api.create(body);

    req$.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/products']);
      },
      error: () => this.loading.set(false)
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}
