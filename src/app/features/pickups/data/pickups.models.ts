import { Page } from '../../../shared/models/pagination.model';

export type PickupStatus = 'CREATED'|'APPROVED'|'ASSIGNED'|'IN_PROGRESS'|'CLOSED';

export interface PickupOrder {
  id: number;
  clientId: number;
  technicianId?: number | null;
  status: PickupStatus;
  location?: string | null;
  notes?: string | null;
  requestedAt?: string | null;
  approvedAt?: string | null;
  assignedAt?: string | null;
  startedAt?: string | null;
  closedAt?: string | null;
}

export interface CreatePickupRequest {
  clientId: number;
  location?: string | null;
  notes?: string | null;
}

export interface AssignPickupRequest {
  technicianId: number;
}

export interface ClosePickupRequest {
  notes?: string | null;
}

export type PickupOrderPage = Page<PickupOrder>;
