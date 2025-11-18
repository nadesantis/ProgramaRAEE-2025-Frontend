export interface LoginRequest {
  email: string;              
  password: string;
}
export interface AuthResponse {
  token: string;  
  id: number;
  name: string;
  email: string;
  role: string;     
}

  export interface JwtPayload {
    sub: string;            
    roles?: string[];       
    exp?: number;           
    iat?: number;           
    [k: string]: unknown;
  }
  