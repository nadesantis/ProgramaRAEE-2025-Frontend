// ¡Ajusta la ruta si usas un barrel distinto!
import { Page } from '../../../shared/models/pagination.model';

/** Status que realmente entiende el backend hoy */
export type OrderStatus = 'PENDING' | 'APPROVED'; // si luego agregás CLOSED en el back, lo sumás acá

export interface SalesOrderSummary  {
  id: number;
  clientId: number;
  clientName?: string;
  clientTaxId?: string;
  status: OrderStatus | string;
  /** el back manda totalAmount; total queda por compat */
  total?: number;
  totalAmount?: number;
  createdAt?: string;
  /** listado trae nombres ya aplanados */
  productNames?: string[];
}

/** Estructura estable que devuelve el back (PageResponse<T>) */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type SalesOrderPage = PageResponse<SalesOrderSummary>;
