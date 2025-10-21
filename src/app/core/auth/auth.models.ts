export interface LoginRequest {
  email: string;              
  password: string;
}
export interface AuthResponse {
  accessToken: string;       
}

  export interface JwtPayload {
    sub: string;            
    roles?: string[];       
    exp?: number;           
    iat?: number;           
    [k: string]: unknown;
  }
  