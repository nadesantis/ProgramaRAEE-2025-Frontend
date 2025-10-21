import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersApi } from '../../data/users.api';
import { User } from '../../data/users.models';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent, MatCardModule,
    MatButtonModule, MatIconModule
  ],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.css']
})
export class UsersPageComponent implements OnInit {
  private api = inject(UsersApi);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  loading = signal(false);
  data: User[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;

  columns: TableColumn<User>[] = [
    // { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'roles', header: 'Roles', cell: (u) => (u.roles || []).join(', ') }
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list({ page: this.pageIndex, size: this.pageSize }).subscribe({
      next: (res) => {
        this.data = res.content;
        this.total = res.totalElements;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPaginate(ev: PageEvent) {
    this.pageIndex = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.load();
  }

  newUser() {
    this.router.navigate(['/users/new']);
  }

  onAction(ev: { type: 'edit' | 'delete' | 'approve'; row: User }) {
    if (ev.type === 'edit') this.router.navigate(['/users', ev.row.id, 'edit']);
    if (ev.type === 'delete') {
      const ref = this.dialog.open(ConfirmDialogComponent, {
        data: { message: `¿Eliminar usuario "${ev.row.email}"?` }
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
  
}
