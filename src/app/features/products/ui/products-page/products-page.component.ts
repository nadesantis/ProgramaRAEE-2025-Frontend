import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsApi } from '../../data/products.api';
import { Product } from '../../data/products.models';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { HasRoleDirective } from '../../../../core/auth/hash-core.directive';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableComponent, MoneyPipe,MatCard,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, HasRoleDirective 
  ],
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.css']
})
export class ProductsPageComponent implements OnInit {
  private api = inject(ProductsApi);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  loading = signal(false);
  data: Product[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  sort?: string;

  q = new FormControl<string>('', { nonNullable: true });

  columns: TableColumn<Product>[] = [
    // { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Nombre' },
    { key: 'unitPrice', header: 'Precio', cell: r => r.unitPrice },
    { key: 'active', header: 'Activo', cell: r => (r.active ? 'Sí' : 'No'), width: '90px' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list({
      page: this.pageIndex,
      size: this.pageSize,
      name: (this.q.value ?? '').trim() || undefined   // <-- aplica filtro
    }).subscribe({
      next: (res) => { this.data = res.content; this.total = res.totalElements; this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }


  onPaginate(ev: PageEvent) {
    this.pageIndex = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.load();
  }

  onSort(ev: Sort) {
    this.sort = ev.direction ? `${ev.active},${ev.direction}` : undefined;
    this.load();
  }

  onSearch() {
    this.pageIndex = 0;
    this.load();
  }

  onAction(ev: { type: string; row: Product }) {
    if (ev.type === 'edit') {
      this.router.navigate(['/products', ev.row.id, 'edit']);
    } else if (ev.type === 'delete') {
      const ref = this.dialog.open(ConfirmDialogComponent, {
        data: { message: `¿Eliminar producto "${ev.row.name}"?` }
      });
      ref.afterClosed().subscribe(ok => {
        if (ok) {
          this.loading.set(true);
          this.api.delete(ev.row.id).subscribe({
            next: () => this.load(),
            error: () => this.loading.set(false)
          });
        }
      });
    }
  }

  newProduct() {
    this.router.navigate(['/products/new']);
  }
}
