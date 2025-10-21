import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsApi } from '../../data/clients.api';
import { Client } from '../../data/clients.models';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatCard } from '@angular/material/card';
import { HasRoleDirective } from '../../../../core/auth/hash-core.directive';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableComponent,MatCard,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, HasRoleDirective
  ],
  templateUrl: './clients-page.component.html',
  styleUrls: ['./clients-page.component.css']
})
export class ClientsPageComponent implements OnInit {
  private api = inject(ClientsApi);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  q = new FormControl('');

  loading = signal(false);
  data: Client[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;

  name = new FormControl<string>('', { nonNullable: true });


columns: TableColumn<Client>[] = [
  // { key: 'id', header: 'ID', width: '80px' },
  { key: 'name', header: 'Nombre' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Teléfono' },
  { key: 'taxId', header: 'CUIT', width: '140px' },
  {
    key: 'addresses',
    header: 'Direcciones',
    width: '420px',
    cell: (r) => {
      const list = (r.addresses ?? []).map(a => {
        const parts = [a.street, a.city, a.state, a.zip].filter(Boolean);
        return parts.join(', ');
      });
      return list.length ? list.join(' • ') : '—';
    }
  }
];



  ngOnInit(): void { this.load(); }

  onSearch() {
    this.pageIndex = 0;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list({
      page: this.pageIndex,
      size: this.pageSize,
      name: (this.q.value || '').trim() || undefined
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

  onAction(ev: { type: string; row: Client }) {
    if (ev.type === 'edit') {
      this.router.navigate(['/clients', ev.row.id, 'edit']);
    } else if (ev.type === 'delete') {
      const ref = this.dialog.open(ConfirmDialogComponent, {
        data: { message: `¿Eliminar cliente "${ev.row.name}"?` }
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

  newClient() {
    this.router.navigate(['/clients/new']);
  }
}
