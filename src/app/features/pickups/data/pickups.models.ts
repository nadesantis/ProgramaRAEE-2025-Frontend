import { Page } from '../../../shared/models/pagination.model';


export type PickupStatus =
  | 'CREATED'
  | 'PENDING'
  | 'APPROVED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'CLOSED';

export interface PickupOrder {
  id: number;
  clientId: number;
  technicianId?: number | null;
  status: PickupStatus;
  location?: string | null;
  notes?: string | null;
  raeeKg?: number | null;        // lo dejamos, es opcional
  requestedAt?: string | null;
  approvedAt?: string | null;
  assignedAt?: string | null;
  startedAt?: string | null;
  closedAt?: string | null;
}

export interface ClosePickupRequest {
  closedAt?: string;          // ISO (se envía como string)
  durationMinutes?: number;
  devicesCount?: number;
  notes?: string;
}

// NUEVO: fila de listado enriquecida
export interface PickupListRow {
  id: number;
  clientName: string;
  technicianName: string;
  status: PickupStatus;
  requestedAt?: string | null;
  location?: string | null;
  raeeKg?: number | null;
}



export interface CreatePickupRequest {
  clientId: number;
  location?: string | null;
  notes?: string | null;
  raeeKg?: number | null;          
}
export interface AssignPickupRequest { technicianId: number; }

// Página del listado enriquecido
export type PickupListPage = Page<PickupListRow>;
export type PickupOrderPage = Page<PickupOrder>;