import { Page } from '../../../shared/models/pagination.model';

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  unitPrice: number;
  active: boolean;
  createdAt?: string; 
}

export interface ProductRequest {
  name: string;
  description?: string | null;
  unitPrice: number;
  active: boolean;
}


export type ProductPage = Page<Product>;
