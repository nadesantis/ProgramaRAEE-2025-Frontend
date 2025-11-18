export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // page index (0-based)
  }
  
  export type AuditAction =
    | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE'
    | 'PRODUCT_CREATE' | 'PRODUCT_UPDATE' | 'PRODUCT_DELETE' | 'PRODUCT_READ' | 'PRODUCT_LIST'
    | 'CLIENT_CREATE' | 'CLIENT_UPDATE' | 'CLIENT_DELETE' | 'CLIENT_READ' | 'CLIENT_LIST'
    | 'ORDER_CREATE' | 'ORDER_APPROVE' | 'ORDER_READ' | 'ORDER_LIST'
    | 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'USER_UNLOCK' | 'USER_RESET_PASSWORD' | 'USER_LIST'
    | 'GENERIC';
  
  export interface AuditLog {
    id: number;
    whenAt: string;        // ISO
    userEmail?: string;
    roles?: string;
    ip?: string;
    method?: string;
    path?: string;
    action: AuditAction;
    entityName?: string;
    entityId?: number;
    success: boolean;
    message?: string;
    metadata?: string;
    durationMs?: number;
  }
  