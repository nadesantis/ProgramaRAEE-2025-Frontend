import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ClosePickupRequest } from '../../data/pickups.models';

import { ClosePickupDialogComponent } from '../close-pickup-dialog/close-pickup-dialog.component';

import { Router } from '@angular/router';

import { PickupsApi } from '../../data/pickups.api';
import { PickupOrder, PickupOrderPage, PickupStatus } from '../../data/pickups.models';
import { AuthService } from '../../../../core/auth/auth.service';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TechSelectDialogComponent } from '../shared/tech-select-dialog/tech-select-dialog.component';


type Row = PickupOrder & {
  clientName?: string | null;
  technicianName?: string | null;
  requestedAtDisplay: string;
  statusDisplay: string;
};

@Component({
  selector: 'app-pickups-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // material
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './pickups-page.component.html',
})
export class PickupsPageComponent implements OnInit {
  // inyecciones
  private api = inject(PickupsApi);
  private router = inject(Router);
  private sb = inject(MatSnackBar);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);

  private readonly deletableStatuses: PickupStatus[] = ['CREATED', 'PENDING'];

  // estado UI
  loading = signal(false);
  data: Row[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;

  // filtro solo por estado
  status = new FormControl<PickupStatus | ''>('');

  // helpers de formato
  private dtf = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  private statusMap: Record<string, string> = {
    CREATED: 'Creada',
    APPROVED: 'Aprobada',
    ASSIGNED: 'Asignada',
    IN_PROGRESS: 'En progreso',
    CLOSED: 'Cerrada'
  };
  

  displayedColumns: string[] = [
    'clientName',
    'technicianName',
    'status',
    'requestedAt',
    'location',
    'raeeKg',
    'actions',
  ];

  ngOnInit(): void {
    this.load();
  }

  // ====== CARGA ======
  private mapRow(o: PickupOrder): Row {
    const anyo = o as any;
    return {
      ...o,
      clientName: anyo.clientName ?? `ID ${o.clientId}`,
      technicianName: anyo.technicianName ?? (o.technicianId ? `ID ${o.technicianId}` : '—'),
      requestedAtDisplay: o.requestedAt ? this.dtf.format(new Date(o.requestedAt)) : '—',
      statusDisplay: this.statusMap[o.status] ?? o.status,
    };
  }

  load(): void {
    this.loading.set(true);
    this.api
      .list({
        page: this.pageIndex,
        size: this.pageSize,
        status: (this.status.value as PickupStatus) || undefined,
      })
      .subscribe({
        next: (res: PickupOrderPage) => {
          this.data = (res.content ?? []).map((o) => this.mapRow(o));
          this.total = res.totalElements ?? 0;
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onPaginate(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  search() {
    this.pageIndex = 0;
    this.load();
  }

  clearFilters() {
    this.status.setValue('');
    this.search();
  }

  newPickup() {
    this.router.navigate(['/pickups/new']);
  }

  // ====== ROLES ======
  private canApproveAssign(): boolean {
    return this.auth.hasRole('ADMIN') || this.auth.hasRole('OPERADOR_LOGISTICO');
  }
  private canStartClose(): boolean {
    return this.auth.hasRole('TECNICO') || this.auth.hasRole('ADMIN');
  }

  // ====== VISIBILIDAD DE ACCIONES ======
  showApprove(row: PickupOrder) {
    return this.canApproveAssign() && row.status === 'CREATED';
  }
  showAssign(row: PickupOrder) {
    return this.canApproveAssign() && row.status === 'APPROVED';
  }
  showStart(row: PickupOrder) {
    return this.canStartClose() && row.status === 'ASSIGNED';
  }
  showClose(row: PickupOrder) {
    return this.canStartClose() && (row.status === 'ASSIGNED' || row.status === 'IN_PROGRESS');
  }

  // ====== HANDLERS DE ACCIONES ======
  approve(row: PickupOrder) {
    if (!this.showApprove(row)) return;
    this.loading.set(true);
    this.api.approve(row.id).subscribe({
      next: () => {
        this.sb.open(`Recolección #${row.id} aprobada`, 'Ok', { duration: 2000 });
        this.load();
      },
      error: () => {
        this.loading.set(false);
        this.sb.open('Error al aprobar', 'Ok', { duration: 2000 });
      },
    });
  }

  assign(row: PickupOrder) {
    if (!this.showAssign(row)) return;
  
    const ref = this.dialog.open(TechSelectDialogComponent, { width: '520px' });
    ref.afterClosed().subscribe((techId: number | null | undefined) => {
      if (!techId) return;
      this.loading.set(true);
      this.api.assign(row.id, { technicianId: techId }).subscribe({
        next: () => { this.sb.open(`Asignada a técnico #${techId}`, 'Ok', { duration: 2000 }); this.load(); },
        error: () => { this.loading.set(false); this.sb.open('Error al asignar', 'Ok', { duration: 2000 }); }
      });
    });
  }
  
  start(row: PickupOrder) {
    if (!this.showStart(row)) return;
    this.loading.set(true);
    this.api.start(row.id).subscribe({
      next: () => {
        this.sb.open(`Recolección #${row.id} iniciada`, 'Ok', { duration: 2000 });
        this.load();
      },
      error: () => {
        this.loading.set(false);
        this.sb.open('No se pudo iniciar', 'Ok', { duration: 2000 });
      },
    });
  }

  close(row: PickupOrder) {
    if (!this.showClose(row)) return;
  
    const ref = this.dialog.open(ClosePickupDialogComponent, { width: '520px' });
  
    ref.afterClosed().subscribe((body: ClosePickupRequest | null | undefined) => {
      if (!body) return;                     // cancelado
  
      this.loading.set(true);
      this.api.close(row.id, body).subscribe({
        next: () => {
          this.sb.open(`Recolección #${row.id} cerrada`, 'Ok', { duration: 2000 });
          this.load();
        },
        error: () => {
          this.loading.set(false);
          this.sb.open('No se pudo cerrar', 'Ok', { duration: 2000 });
        }
      });
    });
  }


  showDelete(row: PickupOrder) {
    return this.deletableStatuses.includes(row.status);
  }
  
  remove(row: PickupOrder) {
   // if (!confirm(`¿Eliminar recolección #${row.id}?`)) return;
    this.loading.set(true);
    this.api.delete(row.id).subscribe({
      next: () => { this.sb.open('Recolección eliminada', 'Ok', { duration: 2000 }); this.load(); },
      error: () => { this.loading.set(false); this.sb.open('Error al eliminar', 'Ok', { duration: 2500 }); }
    });
  }

  // badge de estado
  statusClass(s: PickupStatus): string {
    switch (s) {
      case 'CREATED':
        return 'badge created';
      case 'APPROVED':
        return 'badge approved';
      case 'ASSIGNED':
        return 'badge assigned';
      case 'IN_PROGRESS':
        return 'badge inprogress';
      case 'CLOSED':
        return 'badge closed';
      default:
        return 'badge';
    }
  }
}
