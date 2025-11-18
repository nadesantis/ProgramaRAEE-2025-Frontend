
export interface OrderSummary {
    id: number;
    createdAt: string;
    status: 'CREATED' | 'APPROVED' | 'CLOSED' | string;
    totalAmount: number;
    clientName: string;
    clientTaxId: string;
    productNames: string[]; // lo mostramos como joined
  }
  