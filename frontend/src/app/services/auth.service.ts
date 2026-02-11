import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';

export type WaybeeRole = 'user' | 'driver' | 'admin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'waybee_token';
  private readonly roleKey = 'waybee_role';
  private readonly userKey = 'waybee_user';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          // Guardamos sesión si viene token + user
          if (res?.token) {
            const role = (res?.user?.rol || res?.user?.role) as WaybeeRole;
            if (role) {
              this.saveSession(res.token, role, res.user);
            }
          }
        })
      );
  }

  /**
   * ✅ MISMO nombre: registerUsuario
   * ✅ Ahora acepta:
   *  - FormData (para foto + multipart)
   *  - Objeto normal (registro sin foto)
   */
  registerUsuario(formData: FormData): Observable<any>;
  registerUsuario(data: { nombre: string; email: string; telefono?: string; password: string }): Observable<any>;
  registerUsuario(payload: FormData | { nombre: string; email: string; telefono?: string; password: string }): Observable<any> {
    // ✅ Si viene FormData -> endpoint de registro multipart
    if (payload instanceof FormData) {
      return this.http.post<any>(`${environment.apiUrl}/api/auth/register`, payload);
    }

    // ✅ Si viene objeto -> endpoint antiguo (sin foto)
    // OJO: aquí dejo tu estructura habitual. Ajusta el endpoint si en tu backend el registro es otro.
    const body = {
      nombre: payload.nombre,
      email: payload.email,
      telefono: payload.telefono || null,
      password: payload.password,
      rol: 'user',
      activo: true
    };

    return this.http.post<any>(`${environment.apiUrl}/api/usuario`, body);
  }

  saveSession(token: string, role: WaybeeRole, user?: any) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);

    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  setUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser<T = any>(): T | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): WaybeeRole | null {
    return (localStorage.getItem(this.roleKey) as WaybeeRole) || null;
  }

  isLogged(): boolean {
    return !!this.getToken();
  }

  /**
   * ✅ URL lista para pintar en <img [src]>
   * img_profile esperado: "/images/xxxx.jpg" o "images/xxxx.jpg" o URL completa
   */
  getProfileImageUrl(): string | null {
    const user: any = this.getUser();
    const img = user?.img_profile;
    if (!img) return null;

    if (typeof img === 'string' && /^https?:\/\//i.test(img)) return img;

    const normalized = img.startsWith('/') ? img : `/${img}`;
    return `${environment.apiUrl.replace(/\/$/, '')}${normalized}`;
  }
}
