import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersApi } from '../../data/users.api';
import { User } from '../../data/users.models';
import { TableComponent, TableColumn, TableAction, TableActionKey } from '../../../../shared/components/table/table.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, TableComponent, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.css'],
})
export class UsersPageComponent implements OnInit {
  private api = inject(UsersApi);
  private dialog = inject(MatDialog);
  private sb = inject(MatSnackBar);
  private router = inject(Router);

  loading = signal(false);
  data: User[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;

  columns: TableColumn<User>[] = [
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'roles', header: 'Roles', cell: (u) => (u.roles || []).join(', ') },
  ];

  /** Acciones visibles en la tabla de usuarios */
  tableActions: TableAction<User>[] = [
    { key: 'edit',   icon: 'edit',        tooltip: 'Editar' },
  //  { key: 'pwd',    icon: 'lock_reset',  tooltip: 'Resetear contraseña' },
    { key: 'unlock', icon: 'lock_open',   tooltip: 'Desbloquear' },
    { key: 'delete', icon: 'delete',      tooltip: 'Eliminar', color: 'warn' },
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.list({ page: this.pageIndex, size: this.pageSize }).subscribe({
      next: (res) => { this.data = res.content; this.total = res.totalElements; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPaginate(ev: PageEvent) {
    this.pageIndex = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.load();
  }

  /** 🔧 Acá se ejecutan las acciones reales */
  onAction(ev: { type: TableActionKey; row: User }) {
    const u = ev.row;

    switch (ev.type) {
      case 'edit': {
        this.router.navigate(['/users', u.id, 'edit']);
        break;
      }

      case 'pwd': {
        const pwd = prompt(`Nueva contraseña para ${u.email}:`);
        if (!pwd || !pwd.trim()) return;
        this.loading.set(true);
        this.api.changePassword(u.id, { password: pwd.trim() }).subscribe({
          next: () => { this.loading.set(false); this.sb.open('Contraseña actualizada', 'Ok', { duration: 2000 }); },
          error: () => { this.loading.set(false); this.sb.open('Error al actualizar contraseña', 'Ok', { duration: 2000 }); },
        });
        break;
      }

      case 'unlock': {
        this.loading.set(true);
        // Endpoint: POST /api/admin/users/{id}/unlock
        this.api.unlock(u.id).subscribe({
          next: () => { this.loading.set(false); this.sb.open('Usuario desbloqueado', 'Ok', { duration: 2000 }); },
          error: () => { this.loading.set(false); this.sb.open('Error al desbloquear', 'Ok', { duration: 2000 }); },
        });
        break;
      }

      case 'delete': {
        const ref = this.dialog.open(ConfirmDialogComponent, {
          data: { message: `¿Eliminar usuario "${u.email}"?` },
        });
        ref.afterClosed().subscribe(ok => {
          if (!ok) return;
          this.loading.set(true);
          this.api.delete(u.id).subscribe({
            next: () => { this.load(); this.sb.open('Usuario eliminado', 'Ok', { duration: 2000 }); },
            error: () => { this.loading.set(false); this.sb.open('Error al eliminar', 'Ok', { duration: 2000 }); },
          });
        });
        break;
      }

      default:
        // 'view' / 'approve' no se usan acá; se ignoran por si la tabla los emite.
        return;
    }
  }
}
