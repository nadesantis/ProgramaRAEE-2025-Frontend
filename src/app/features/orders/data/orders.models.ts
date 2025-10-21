import { Page } from '../../../shared/models/pagination.model';

export type OrderStatus = 'Pendiente' | 'Aprobado';

export interface OrderItem {
  productId: number;
  productName?: string;
  unitPrice?: number;
  quantity: number;
  lineTotal?: number;
}

export interface Order {
  id: number;
  clientId: number;
  clientName?: string;
  status: OrderStatus;
  items: OrderItem[];
  total?: number;
  createdAt?: string;
}

export interface CreateOrderRequest {
  clientId: number;
  items: Array<{ productId: number; quantity: number }>;
}

export type OrderPage = Page<Order>;
