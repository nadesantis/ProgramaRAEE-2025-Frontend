import { Page } from '../../../shared/models/pagination.model';

export interface Address {
  id?: number | null;
  street: string;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  notes?: string | null;
}

export interface Client {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  taxId?: string | null;
  addresses: Address[];
}

export interface ClientRequest {
  name: string;
  email?: string | null;
  phone?: string | null;
  taxId?: string | null;
  addresses: Address[];
}

export type ClientPage = Page<Client>;
