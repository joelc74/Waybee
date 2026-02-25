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

  // 🛑 Confirmación borrado
  showDeleteCard = false;
  deleteText = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ionViewDidEnter(): void {
    // 1) Carga rápida desde storage
    this.loadFromStorage();
    this.reloadProfileImg();

    // 2) Refresco desde API para tener teléfono/email reales (si storage viene recortado)
    const id = this.getUserId();
    if (id) this.fetchUserFromApi(id);
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

  private getHeadersJson(): HttpHeaders {
    const token = (this.auth as any).getToken?.() || null;
    return new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
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

  private fetchUserFromApi(id: number): void {
    this.http.get<UserShape>(`${this.apiUrl()}/api/usuario/${id}`, { headers: this.getHeadersJson() })
      .subscribe({
        next: (fresh) => {
          this.user = fresh || {};
          this.form.email = (fresh?.email ?? '').toString();
          this.form.telefono = (fresh?.telefono ?? '').toString();

          const current = (this.auth as any).getUser?.() || {};
          const merged = { ...current, ...fresh };
          (this.auth as any).setUser?.(merged);

          this.reloadProfileImg();
        },
        error: (err) => {
          console.error('❌ Error trayendo usuario desde API:', err);
        }
      });
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
      const url = fn.call(this.auth);
      // Solo si devuelve algo válido; si no, fallback a img_profile
      if (url) {
        this.profileImgUrl = url;
        return;
      }
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
  // GUARDAR TODO
  // =========================
  saveAll(): void {
  if (this.busy) return;
  const id = this.getUserId();
  if (!id) return;

  const fd = new FormData();
  fd.append('email', this.form.email.trim());
  fd.append('telefono', this.form.telefono.trim());

  if (this.selectedFile) {
    fd.append('file', this.selectedFile); 
  }

  this.busy = true;

  const token = (this.auth as any).getToken?.();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http.put<any>(`${this.apiUrl()}/api/usuario/${id}`, fd, { headers })
    .subscribe({
      next: (updated) => {
        (this.auth as any).setUser?.(updated);
        this.user = updated;
        this.selectedFile = null;
        this.reloadProfileImg(); 
        this.busy = false;
        alert('¡Perfil actualizado con éxito!');
      },
      error: (err) => {
        console.error('❌ Error 400:', err);
        this.busy = false;
      }
    });
}

  // =========================
  // 🛑 CONFIRMACIÓN BORRADO (CARD)
  // =========================
  openDeleteCard(): void {
    this.deleteText = '';
    this.showDeleteCard = true;
  }

  cancelDelete(): void {
    this.deleteText = '';
    this.showDeleteCard = false;
  }

  get canConfirmDelete(): boolean {
    return (this.deleteText || '').trim().toLowerCase() === 'delete';
  }

  confirmDelete(): void {
    if (!this.canConfirmDelete) return;
    this.deleteAccount(); // borrado real
  }

  // =========================
  // 🛑 ELIMINAR CUENTA (REAL)
  // =========================
  private deleteAccount(): void {
    if (this.busy) return;

    const id = this.getUserId();
    if (!id) return;

    this.busy = true;

    const token = (this.auth as any).getToken?.() || null;
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    this.http.delete<any>(`${this.apiUrl()}/api/usuario/${id}`, { headers })
      .subscribe({
        next: () => {
          (this.auth as any).logout?.();
          this.busy = false;

          // Limpieza UI
          this.showDeleteCard = false;
          this.deleteText = '';

          this.router.navigateByUrl('/login', { replaceUrl: true });
        },
        error: (err) => {
          console.error('❌ Error eliminando cuenta:', err);
          this.busy = false;
        }
      });
  }
}
