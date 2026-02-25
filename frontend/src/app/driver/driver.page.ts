// frontend/src/app/driver/driver.page.ts
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

import * as L from 'leaflet';
import 'leaflet-routing-machine';

type Servicio = {
  id_servicio: number;
  tipo_servicio: 'viaje' | 'envio';
  estado: 'pendiente' | 'aceptado' | 'en_curso' | 'completado' | 'cancelado';
  id_usuario: number;
  id_conductor?: number | null;

  origen_direccion: string;
  destino_direccion: string;

  origen_lat?: number | string | null;
  origen_lng?: number | string | null;
  destino_lat?: number | string | null;
  destino_lng?: number | string | null;

  distancia_km?: number | string | null;
  precio?: number | string | null;

  fecha_creacion?: string;
  fecha_aceptacion?: string | null;
  fecha_completado?: string | null;

  // Enriquecidos en frontend
  solicitanteNombre?: string;
};

@Component({
  selector: 'app-driver',
  templateUrl: './driver.page.html',
  styleUrls: ['./driver.page.scss'],
  standalone: false,
})
export class DriverPage implements AfterViewInit {
  logoSrc = 'assets/Images/logo/waybee-logo-gris.png';

  busy = false;
  loadingPool = false;

  pool: Servicio[] = [];
  activeServicio: Servicio | null = null;

  // Foto perfil (header)
  profileImgUrl: string | null = null;

  // cache simple de usuarios {id_usuario: nombre}
  private userNameCache = new Map<number, string>();

  // ===== MAPA =====
  private map?: L.Map;
  private routeControl: any;
  private originMarker?: L.Marker;
  private destMarker?: L.Marker;

  constructor(
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngAfterViewInit(): void {
    // no inicializamos mapa aquí porque depende de si hay servicio activo
    // lo inicializamos cuando activeServicio exista y el DOM tenga #driverMap
  }

  ionViewDidEnter(): void {
    // Cargar foto de perfil (header)
    this.loadProfileImg();

    this.refreshAll();
  }

  // =========================
  // Helpers
  // =========================
  private apiUrl(): string {
    return environment.apiUrl;
  }

  private getHeadersJson(): HttpHeaders {
    const token = (this.auth as any).getToken?.() || null;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  private getDriverId(): number | null {
    const u: any = (this.auth as any).getUser?.() || null;
    const id = Number(u?.id_usuario ?? u?.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  // =========================
  // Foto perfil (header)
  // =========================
  private normalizeImgUrl(imgRaw: any): string | null {
    const img = (imgRaw ?? '').toString().trim();
    if (!img) return null;

    // Si ya es URL absoluta, la dejamos.
    if (/^https?:\/\//i.test(img)) {
      return `${img}${img.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }

    const base = this.apiUrl().replace(/\/$/, '');

    // Si viene como "/images/xxx.jpg" (tu caso), lo pegamos directo al base.
    if (img.startsWith('/')) {
      return `${base}${img}?t=${Date.now()}`;
    }

    // Si viene como "images/xxx.jpg", le ponemos "/"
    if (img.startsWith('images/')) {
      return `${base}/${img}?t=${Date.now()}`;
    }

    // Si viene como nombre archivo "xxx.jpg", asumimos carpeta /images/
    return `${base}/images/${img}?t=${Date.now()}`;
  }

  private async loadProfileImg(): Promise<void> {
    const u: any = (this.auth as any).getUser?.() || null;

    // 1) Intento directo desde sesión
    const fromSession = this.normalizeImgUrl(u?.img_profile);
    if (fromSession) {
      this.profileImgUrl = fromSession;
      return;
    }

    // 2) Si en sesión no viene, intentamos pedirlo al backend por id_usuario
    const id = this.getDriverId();
    if (!id) {
      this.profileImgUrl = null;
      return;
    }

    try {
      const userDb = await this.http
        .get<any>(`${this.apiUrl()}/api/usuario/${id}`, { headers: this.getHeadersJson() })
        .toPromise();

      this.profileImgUrl = this.normalizeImgUrl(userDb?.img_profile);
    } catch (e) {
      // Si falla, simplemente dejamos el icono
      this.profileImgUrl = null;
    }
  }

  onProfileImgError(): void {
    this.profileImgUrl = null;
  }

  // =========================
  // Navegación / sesión
  // =========================
  logout(): void {
    (this.auth as any).logout?.();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  goAccount(): void {
    this.router.navigateByUrl('/cuenta');
  }

  goHistory(): void {
    this.router.navigateByUrl('/historial');
  }

  // =========================
  // Carga principal
  // =========================
  refreshAll(): void {
    if (this.busy) return;
    this.busy = true;

    this.loadActiveServicio()
      .then(() => this.loadPool())
      .finally(() => (this.busy = false));
  }

  private async loadActiveServicio(): Promise<void> {
    const driverId = this.getDriverId();
    if (!driverId) {
      this.activeServicio = null;
      return;
    }

    // prioridad: en_curso -> aceptado
    const headers = this.getHeadersJson();

    try {
      const enCurso = await this.http
        .get<Servicio[]>(
          `${this.apiUrl()}/api/servicio?estado=en_curso&id_conductor=${driverId}`,
          { headers }
        )
        .toPromise();

      const s1 = (enCurso || [])[0] || null;
      if (s1) {
        this.activeServicio = await this.enrichServicio(s1);
        this.mountMapForActive();
        return;
      }

      const aceptado = await this.http
        .get<Servicio[]>(
          `${this.apiUrl()}/api/servicio?estado=aceptado&id_conductor=${driverId}`,
          { headers }
        )
        .toPromise();

      const s2 = (aceptado || [])[0] || null;
      this.activeServicio = s2 ? await this.enrichServicio(s2) : null;

      if (this.activeServicio) this.mountMapForActive();
      else this.destroyMap(); // si no hay activo, libera mapa
    } catch (err) {
      console.error('❌ Error cargando servicio activo:', err);
      this.activeServicio = null;
      this.destroyMap();
    }
  }

  private loadPool(): Promise<void> {
    this.loadingPool = true;

    return new Promise((resolve) => {
      this.http
        .get<Servicio[]>(`${this.apiUrl()}/api/servicio/pool`, {
          headers: this.getHeadersJson(),
        })
        .subscribe({
          next: async (rows) => {
            const list = rows || [];
            const enriched: Servicio[] = [];
            for (const s of list) enriched.push(await this.enrichServicio(s));

            this.pool = enriched;
            this.loadingPool = false;
            resolve();
          },
          error: (err) => {
            console.error('❌ Error cargando pool:', err);
            this.pool = [];
            this.loadingPool = false;
            resolve();
          },
        });
    });
  }

  // =========================
  // Acciones Driver
  // =========================
  accept(serv: Servicio): void {
    if (this.busy || this.activeServicio) return; // si ya hay uno activo, no dejamos aceptar otro

    const driverId = this.getDriverId();
    if (!driverId) return;

    this.busy = true;

    this.http
      .post<Servicio>(
        `${this.apiUrl()}/api/servicio/${serv.id_servicio}/accept`,
        { id_conductor: driverId },
        { headers: this.getHeadersJson() }
      )
      .subscribe({
        next: async (updated) => {
          this.activeServicio = await this.enrichServicio(updated);
          this.mountMapForActive();

          // refresca pool (para que desaparezca el aceptado)
          await this.loadPool();

          this.busy = false;
        },
        error: (err) => {
          console.error('❌ Error aceptando:', err);
          this.busy = false;
        },
      });
  }

  iniciar(serv: Servicio): void {
    if (this.busy) return;

    this.busy = true;
    this.http
      .patch<Servicio>(
        `${this.apiUrl()}/api/servicio/${serv.id_servicio}/estado`,
        { estado: 'en_curso' },
        { headers: this.getHeadersJson() }
      )
      .subscribe({
        next: async (updated) => {
          this.activeServicio = await this.enrichServicio(updated);
          this.mountMapForActive();
          this.busy = false;
        },
        error: (err) => {
          console.error('❌ Error iniciando servicio:', err);
          this.busy = false;
        },
      });
  }

  finalizar(serv: Servicio): void {
    if (this.busy) return;

    this.busy = true;
    this.http
      .patch<Servicio>(
        `${this.apiUrl()}/api/servicio/${serv.id_servicio}/estado`,
        { estado: 'completado' },
        { headers: this.getHeadersJson() }
      )
      .subscribe({
        next: async () => {
          // al completar: limpiamos activo y volvemos a pool
          this.activeServicio = null;
          this.destroyMap();
          await this.loadPool();
          this.busy = false;
        },
        error: (err) => {
          console.error('❌ Error finalizando servicio:', err);
          this.busy = false;
        },
      });
  }

  // =========================
  // Nombre Solicitante
  // =========================
  private async enrichServicio(s: Servicio): Promise<Servicio> {
    const idu = Number(s.id_usuario);
    if (!Number.isFinite(idu) || idu <= 0) return s;

    if (this.userNameCache.has(idu)) {
      return { ...s, solicitanteNombre: this.userNameCache.get(idu)! };
    }

    try {
      const u = await this.http
        .get<any>(`${this.apiUrl()}/api/usuario/${idu}`, { headers: this.getHeadersJson() })
        .toPromise();

      const nombre = (u?.nombre ?? '').toString().trim() || 'Usuario';
      this.userNameCache.set(idu, nombre);
      return { ...s, solicitanteNombre: nombre };
    } catch (err) {
      console.error('❌ Error obteniendo usuario solicitante:', err);
      return { ...s, solicitanteNombre: 'Usuario' };
    }
  }

  // =========================
  // UI helpers
  // =========================
  formatKm(km: any): string {
    const n = Number(km);
    return Number.isFinite(n) ? `${n.toFixed(2)} km` : '—';
  }

  formatPrice(p: any): string {
    const n = Number(p);
    return Number.isFinite(n) ? `${n.toFixed(2)} €` : '—';
  }

  // =========================
  // MAPA (emulación Home, simplificado)
  // =========================
  private mountMapForActive(): void {
    // esperamos al DOM (cuando *ngIf pinta el mapa)
    setTimeout(() => {
      if (!this.activeServicio) return;

      this.ensureMap();
      this.map?.invalidateSize();

      this.drawRouteFromServicio(this.activeServicio);
    }, 60);
  }

  private ensureMap(): void {
    if (this.map) return;

    const start: L.LatLngExpression = [28.1235, -15.4363];
    this.map = L.map('driverMap', { center: start, zoom: 13, zoomControl: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private destroyMap(): void {
    try {
      if (this.routeControl && this.map) {
        this.map.removeControl(this.routeControl);
      }
    } catch {}
    this.routeControl = null;

    try {
      if (this.originMarker && this.map) this.map.removeLayer(this.originMarker);
    } catch {}
    this.originMarker = undefined;

    try {
      if (this.destMarker && this.map) this.map.removeLayer(this.destMarker);
    } catch {}
    this.destMarker = undefined;

    try {
      if (this.map) {
        this.map.remove();
      }
    } catch {}
    this.map = undefined;
  }

  private createPinIcon(): L.DivIcon {
    const stroke = '#1629d6';
    const fill = '#f7c400';
    const center = '#ffffff';

    return L.divIcon({
      className: 'wb-pin',
      html: `
        <div class="wb-pin-wrap" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24">
            <path
              fill="${fill}"
              stroke="${stroke}"
              stroke-width="1.4"
              d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 14 6 14s6-9.582 6-14c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 12 5.5a2.5 2.5 0 0 1 0 5z"
            />
            <circle cx="12" cy="8" r="2.1" fill="${center}"></circle>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });
  }

  private drawRouteFromServicio(serv: Servicio): void {
    if (!this.map) return;

    const oLat = Number(serv.origen_lat);
    const oLng = Number(serv.origen_lng);
    const dLat = Number(serv.destino_lat);
    const dLng = Number(serv.destino_lng);

    const hasOrigin = Number.isFinite(oLat) && Number.isFinite(oLng);
    const hasDest = Number.isFinite(dLat) && Number.isFinite(dLng);

    // limpia ruta anterior
    try {
      if (this.routeControl) this.map.removeControl(this.routeControl);
    } catch {}
    this.routeControl = null;

    if (!hasOrigin && !hasDest) {
      // sin coords: centramos en default
      this.map.setView([28.1235, -15.4363], 13, { animate: true });
      return;
    }

    if (hasOrigin) {
      const pos = L.latLng(oLat, oLng);
      if (!this.originMarker) this.originMarker = L.marker(pos, { icon: this.createPinIcon() }).addTo(this.map);
      else this.originMarker.setLatLng(pos);
    }

    if (hasDest) {
      const pos = L.latLng(dLat, dLng);
      if (!this.destMarker) this.destMarker = L.marker(pos, { icon: this.createPinIcon() }).addTo(this.map);
      else this.destMarker.setLatLng(pos);
    }

    if (hasOrigin && hasDest) {
      // routing machine
      this.routeControl = (L as any).Routing.control({
        waypoints: [L.latLng(oLat, oLng), L.latLng(dLat, dLng)],
        addWaypoints: false,
        draggableWaypoints: false,
        routeWhileDragging: false,
        show: false,
      }).addTo(this.map);

      const bounds = L.latLngBounds([L.latLng(oLat, oLng), L.latLng(dLat, dLng)]);
      this.map.fitBounds(bounds, { padding: [30, 30] });
    } else if (hasOrigin) {
      this.map.setView([oLat, oLng], 16, { animate: true });
    } else if (hasDest) {
      this.map.setView([dLat, dLng], 16, { animate: true });
    }
  }
}