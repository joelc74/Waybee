// frontend/src/app/historial/historial.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ServicioService } from '../services/servicio.service';

type AnyRow = any;

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false,
})
export class HistorialPage {
  // Header (igual que Favoritos)
  logoSrc = 'assets/Images/logo/waybee-logo.png';
  profileImgUrl: string | null = null;

  servicios: AnyRow[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private auth: AuthService,
    private servicioService: ServicioService
  ) {}

  ionViewDidEnter(): void {
    this.refreshProfileImg();
    this.reload();
  }

  private refreshProfileImg(): void {
    this.profileImgUrl = this.auth.getProfileImageUrl();
  }

  onProfileImgError(): void {
    this.profileImgUrl = null;
  }

  onLogoError(e: any): void {
    console.error('❌ No se pudo cargar el logo:', this.logoSrc, e);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  goBack(): void {
    this.router.navigateByUrl('/home');
  }

  reload(): void {
    const u: any = this.auth.getUser?.() || null;
    const id_usuario = Number(u?.id ?? u?.id_usuario ?? u?.idUsuario);

    if (!id_usuario) {
      this.logout();
      return;
    }

    this.loading = true;
    this.error = null;

    this.servicioService.getByUser(id_usuario).subscribe({
      next: (rows: any[]) => {
        const list = Array.isArray(rows) ? rows : [];

        list.sort((a: any, b: any) => {
          const da = new Date(a?.fecha_creacion || 0).getTime();
          const db = new Date(b?.fecha_creacion || 0).getTime();
          return db - da;
        });

        this.servicios = list;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Error cargando historial', err);
        this.servicios = [];
        this.loading = false;
        this.error = 'No se pudo cargar el historial.';
      },
    });
  }

  // ---------- Helpers ----------
  asNumber(v: any): number | null {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  // Precio único (compat): precio -> precio_final -> precio_estimado
  getPrecio(s: AnyRow): number | null {
    const p =
      (s?.precio !== undefined ? s.precio : undefined) ??
      (s?.precio_final !== undefined ? s.precio_final : undefined) ??
      (s?.precio_estimado !== undefined ? s.precio_estimado : undefined) ??
      null;

    return this.asNumber(p);
  }

  formatTipo(t: any): string {
    const x = String(t || '').toLowerCase();
    if (x === 'envio') return 'Envío';
    if (x === 'viaje') return 'Viaje';
    return t ? String(t) : '—';
  }

  formatEstado(e: any): string {
    const x = String(e || '').toLowerCase();
    if (x === 'pendiente') return 'Pendiente';
    if (x === 'aceptado') return 'Aceptado';
    if (x === 'en_curso') return 'En curso';
    if (x === 'completado') return 'Completado';
    if (x === 'cancelado') return 'Cancelado';
    return e ? String(e) : '—';
  }

  formatFecha(v: any): string {
    if (!v) return '—';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '—';

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}, ${hh}:${mi}`;
  }
}
