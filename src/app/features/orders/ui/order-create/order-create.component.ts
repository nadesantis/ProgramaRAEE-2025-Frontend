import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrdersApi } from '../../data/orders.api';
import { Router } from '@angular/router';
import { ClientsApi } from '../../../clients/data/clients.api';
import { ProductsApi } from '../../../products/data/products.api';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatIconModule, MatButtonModule, MatSnackBarModule
  ],
  templateUrl: './order-create.component.html',
  styleUrls: ['./order-create.component.css']
})
export class OrderCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ordersApi = inject(OrdersApi);
  private clientsApi = inject(ClientsApi);
  private productsApi = inject(ProductsApi);
  private router = inject(Router);
  private sb = inject(MatSnackBar);

  loading = signal(false);
  clients: Array<{ id: number; name: string }> = [];
  products: Array<{ id: number; name: string; unitPrice?: number }> = [];

  form = this.fb.group({
    clientId: [null as number | null, [Validators.required]],
    items: this.fb.array<FormGroup>([])
  });

  get items(): FormArray<FormGroup> { return this.form.controls.items as FormArray<FormGroup>; }

  ngOnInit(): void {
    this.loading.set(true);

    this.clientsApi.list({ page: 0, size: 50 }).subscribe({
      next: (res : any) => this.clients = res.content.map(c => ({ id: c.id, name: c.name })),
      error: () => {}
    });

    this.productsApi.list({ page: 0, size: 50 }).subscribe({
      next: (res : any) => this.products = res.content.map(p => ({ id: p.id, name: p.name, unitPrice: p.unitPrice })),
      error: () => {}
    }).add(() => {
      if (this.items.length === 0) this.addItem();
      this.loading.set(false);
    });
  }

  addItem(productId: number | null = null, quantity = 1) {
    this.items.push(this.fb.group({
      productId: [productId, [Validators.required]],
      quantity: [quantity, [Validators.required, Validators.min(1)]]
    }));
  }

  save(approveAfterCreate = false): void {
    if (this.form.invalid) return;

    const body = {
      clientId: this.form.value.clientId,
      items: (this.form.value.items || []).map((it: any) => ({
        productId: Number(it.productId),
        quantity: Number(it.quantity)
      }))
    };

    this.loading.set(true);
    this.ordersApi.create(body as any).subscribe({
      next: (o : any) => {
        if (!approveAfterCreate) {
          this.loading.set(false);
          this.sb.open(`Orden #${o.id} creada`, 'Ok', { duration: 2000 });
          this.router.navigate(['/orders']);
          return;
        }

        // Crear y aprobar
        this.ordersApi.approve(o.id).subscribe({
          next: () => {
            this.loading.set(false);
            this.sb.open(`Orden #${o.id} creada y aprobada`, 'Ok', { duration: 2000 });
            this.router.navigate(['/orders']);
          },
          error: () => {
            this.loading.set(false);
            this.sb.open(`Orden #${o.id} creada, pero no se pudo aprobar`, 'Ok', { duration: 3000 });
            this.router.navigate(['/orders']);
          }
        });
      },
      error: () => {
        this.loading.set(false);
        this.sb.open('Error al crear orden', 'Ok', { duration: 2000 });
      }
    });
  }

  cancel(): void { this.router.navigate(['/orders']); }
}
