import { JwtPayload } from '../auth/auth.models';


export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}
