import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PickupsApi } from '../../data/pickups.api';
import { PickupOrder, PickupStatus } from '../../data/pickups.models';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { HasRoleDirective } from '../../../../core/auth/hash-core.directive';
import { AuthService } from '../../../../core/auth/auth.service';

import { AssignDialogComponent } from '../shared/assign-dialog/assign-dialog.component';
import { CloseDialogComponent } from '../shared/close-dialog/close-dialog.component';



type Row = PickupOrder & {
  requestedAtDisplay: string;
  statusDisplay: string;
};

@Component({
  selector: 'app-pickups-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatDialogModule,
    TableComponent,
    HasRoleDirective
  ],
  templateUrl: './pickups-page.component.html',
  styleUrls: ['./pickups-page.component.css']
})
export class PickupsPageComponent implements OnInit {
  private api = inject(PickupsApi);
  private router = inject(Router);
  private sb = inject(MatSnackBar);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);

  loading = signal(false);
  data: Row[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;

  clientId = new FormControl<number | null>(null);
  status = new FormControl<PickupStatus | ''>('');

  private dtf = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  private statusMap: Record<PickupStatus, string> = {
    CREATED: 'Creada',
    APPROVED: 'Aprobada',
    ASSIGNED: 'Asignada',
    IN_PROGRESS: 'En progreso',
    CLOSED: 'Cerrada'
  };

  columns: TableColumn<Row>[] = [
    // { key: 'id', header: 'ID', width: '80px' },
    { key: 'clientId', header: 'Cliente' },
    { key: 'technicianId', header: 'Técnico' },
    { key: 'statusDisplay', header: 'Estado' },
    { key: 'requestedAtDisplay', header: 'Solicitada' }
  ];

  displayedColumns: string[] = this.columns.map(c => c.key).concat('actions');

  ngOnInit(): void { this.load(); }

  private mapRow(o: PickupOrder): Row {
    return {
      ...o,
      requestedAtDisplay: o.requestedAt ? this.dtf.format(new Date(o.requestedAt)) : '—',
      statusDisplay: this.statusMap[o.status] ?? o.status
    };
  }

  load(): void {
    this.loading.set(true);
    this.api.list({
      page: this.pageIndex,
      size: this.pageSize,
      clientId: this.clientId.value ?? undefined,
      status: (this.status.value as PickupStatus) || undefined
    }).subscribe({
      next: res => {
        this.data = res.content.map(this.mapRow.bind(this));
        this.total = res.totalElements;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPaginate(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  search() { this.pageIndex = 0; this.load(); }

  clearFilters() {
    this.clientId.setValue(null);
    this.status.setValue('');
    this.search();
  }

  canApproveAssign(): boolean {
    return this.auth.hasRole('ADMIN') || this.auth.hasRole('OPERADOR_LOGISTICO');
  }

  canStartClose(): boolean {
    return this.auth.hasRole('TECNICO') || this.auth.hasRole('ADMIN');
  }

  newPickup() { this.router.navigate(['/pickups/new']); }

  approve(row: PickupOrder) {
    if (!this.canApproveAssign()) return;
    this.loading.set(true);
    this.api.approve(row.id).subscribe({
      next: () => { this.sb.open(`Recolección #${row.id} aprobada`, 'Ok', { duration: 2000 }); this.load(); },
      error: () => { this.loading.set(false); this.sb.open('Error al aprobar', 'Ok', { duration: 2000 }); }
    });
  }

  assign(row: PickupOrder) {
    if (!this.canApproveAssign()) return;
    const ref = this.dialog.open(AssignDialogComponent, { data: { technicianId: row.technicianId ?? null }});
    ref.afterClosed().subscribe((techId: number | null | undefined) => {
      if (techId == null) return;
      this.loading.set(true);
      this.api.assign(row.id, { technicianId: techId }).subscribe({
        next: () => { this.sb.open(`Asignada a técnico ${techId}`, 'Ok', { duration: 2000 }); this.load(); },
        error: () => { this.loading.set(false); this.sb.open('Error al asignar', 'Ok', { duration: 2000 }); }
      });
    });
  }

  start(row: PickupOrder) {
    if (!this.canStartClose()) return;
    this.loading.set(true);
    this.api.start(row.id).subscribe({
      next: () => { this.sb.open(`Recolección #${row.id} iniciada`, 'Ok', { duration: 2000 }); this.load(); },
      error: () => { this.loading.set(false); this.sb.open('No se pudo iniciar', 'Ok', { duration: 2000 }); }
    });
  }

  close(row: PickupOrder) {
    if (!this.canStartClose()) return;
    const ref = this.dialog.open(CloseDialogComponent, { data: { notes: '' }});
    ref.afterClosed().subscribe((notes: string | null | undefined) => {
      if (notes === undefined) return;
      this.loading.set(true);
      this.api.close(row.id, { notes: notes || undefined }).subscribe({
        next: () => { this.sb.open(`Recolección #${row.id} cerrada`, 'Ok', { duration: 2000 }); this.load(); },
        error: () => { this.loading.set(false); this.sb.open('No se pudo cerrar', 'Ok', { duration: 2000 }); }
      });
    });
  }

  // visibilidad por estado
  showApprove(row: PickupOrder) { return this.canApproveAssign() && row.status === 'CREATED'; }
  showAssign(row: PickupOrder)  { return this.canApproveAssign() && row.status === 'APPROVED'; }
  showStart(row: PickupOrder)   { return this.canStartClose() && row.status === 'ASSIGNED'; }
  showClose(row: PickupOrder)   { return this.canStartClose() && (row.status === 'ASSIGNED' || row.status === 'IN_PROGRESS'); }
}
