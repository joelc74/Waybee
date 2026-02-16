import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

type UserShape = {
  id_usuario?: number;
  id?: number;
  nombre?: string;
  email?: string;
  telefono?: string | null;
  rol?: string;
  img_profile?: string | null;
  [k: string]: any;
};

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss'],
  standalone: false,
})
export class CuentaPage {
  logoSrc = 'assets/Images/logo/waybee-logo.png';

  busy = false;

  profileImgUrl: string | null = null;

  user: UserShape = {};
  form: { email: string; telefono: string } = { email: '', telefono: '' };

  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ionViewDidEnter(): void {
    this.loadFromStorage();
    this.reloadProfileImg();
  }

  private apiUrl(): string {
    return environment.apiUrl;
  }

  private getHeadersMultipart(): HttpHeaders {
    const token = (this.auth as any).getToken?.() || null;
    // No poner Content-Type; el navegador lo pone con boundary
    return new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  private getUserId(): number | null {
    const u: any = (this.auth as any).getUser?.() || null;
    const id = Number(u?.id_usuario ?? u?.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private loadFromStorage(): void {
    const u: any = (this.auth as any).getUser?.() || null;
    this.user = u || {};
    this.form.email = (u?.email ?? '').toString();
    this.form.telefono = (u?.telefono ?? '').toString();
  }

  onLogoError(e: any): void {
    console.error('❌ No se pudo cargar el logo:', this.logoSrc, e);
  }

  onProfileImgError(): void {
    this.profileImgUrl = null;
  }

  reloadProfileImg(): void {
    const fn = (this.auth as any).getProfileImageUrl;
    if (typeof fn === 'function') {
      this.profileImgUrl = fn.call(this.auth);
      return;
    }

    const u: any = (this.auth as any).getUser?.() || null;
    const img = u?.img_profile || null;
    if (!img) {
      this.profileImgUrl = null;
      return;
    }

    const cleaned = String(img).replace(/^\/+/, '');
    const path = cleaned.startsWith('images/') ? cleaned : `images/${cleaned}`;
    this.profileImgUrl = `${this.apiUrl()}/${path}`;
  }

  logout(): void {
    (this.auth as any).logout?.();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  goBack(): void {
    window.history.back();
  }

  // =========================
  // FOTO
  // =========================
  get selectedFileName(): string {
    return this.selectedFile?.name || '';
  }

  onPickFile(ev: any): void {
    const file: File | null = ev?.target?.files?.[0] ?? null;
    this.selectedFile = file;
  }

  // =========================
  // ✅ GUARDAR TODO EN 1 BOTÓN (email + teléfono + foto opcional)
  // =========================
  saveAll(): void {
    if (this.busy) return;

    const id = this.getUserId();
    if (!id) return;

    const email = (this.form.email || '').trim();
    const telefono = (this.form.telefono || '').trim();

    if (!email) return;

    const fd = new FormData();
    fd.append('email', email);
    fd.append('telefono', telefono);

    if (this.selectedFile) {
      // IMPORTANTE: el backend usa upload.single("file")
      fd.append('file', this.selectedFile);
    }

    this.busy = true;

    this.http.put<any>(`${this.apiUrl()}/api/usuario/${id}`, fd, { headers: this.getHeadersMultipart() })
      .subscribe({
        next: (updated) => {
          // Actualiza user en localStorage para que se refleje al instante
          const current = (this.auth as any).getUser?.() || {};
          const merged = { ...current, ...updated };
          (this.auth as any).setUser?.(merged);

          this.user = merged;

          // Limpia selección de archivo tras guardar
          this.selectedFile = null;

          // Refresca avatar visible
          this.reloadProfileImg();

          this.busy = false;
        },
        error: (err) => {
          console.error('❌ Error guardando cambios (email/teléfono/foto):', err);
          this.busy = false;
        }
      });
  }

  // =========================
  // ELIMINAR CUENTA
  // =========================
  deleteAccount(): void {
    if (this.busy) return;

    const id = this.getUserId();
    if (!id) return;

    this.busy = true;

    // Si tu backend requiere JSON headers aquí, puedes dejarlo como estaba.
    // Para mantenerlo simple: usamos fetch-like con HttpClient delete sin body.
    const token = (this.auth as any).getToken?.() || null;
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    this.http.delete<any>(`${this.apiUrl()}/api/usuario/${id}`, { headers })
      .subscribe({
        next: () => {
          (this.auth as any).logout?.();
          this.busy = false;
          this.router.navigateByUrl('/login', { replaceUrl: true });
        },
        error: (err) => {
          console.error('❌ Error eliminando cuenta:', err);
          this.busy = false;
        }
      });
  }
}
