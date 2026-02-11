import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

import * as L from 'leaflet';
import 'leaflet-routing-machine';

type ServiceMode = 'viaje' | 'envio';

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  importance?: number;
  address?: {
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    postcode?: string;
  };
  uiLabel?: string;
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements AfterViewInit {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  /* =========================
     LOGOUT
     ========================= */
  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  /* =========================
     TARIFA (VIAJE)
     ========================= */
  private readonly baseFare = 5.70;
  private readonly perKm = 0.97;
  private readonly feePct = 0.12;

  /* =========================
     UI
     ========================= */
  logoSrc = 'assets/Images/logo/waybee-logo.png';
  selectedService: ServiceMode = 'viaje';

  // ✅ AÑADIDO: URL de foto perfil
  profileImgUrl: string | null = null;

  // ✅ AÑADIDO: si falla la carga, volvemos al icono
  onProfileImgError(): void {
    this.profileImgUrl = null;
  }

  /* =========================
     ORIGEN
     ========================= */
  locationQuery = '';
  suggestions: NominatimResult[] = [];
  showSuggestions = false;
  loading = false;

  suggestTop = 0;
  suggestLeft = 0;
  suggestWidth = 0;

  @ViewChild('locationPill', { read: ElementRef }) locationPill?: ElementRef<HTMLElement>;

  /* =========================
     DESTINO
     ========================= */
  destMode = false;
  destQuery = '';
  destSuggestions: NominatimResult[] = [];
  showDestSuggestions = false;
  destLoading = false;

  /* =========================
     PANEL RESULTADO
     ========================= */
  distanceLabel = '';
  priceLabel = '';

  // ✅ valores numéricos para habilitar el CTA
  lastKm = 0;
  lastPrice = 0;

  // ✅ habilita el botón solo cuando hay ruta calculada (y estamos en viaje)
  get canPay(): boolean {
    return this.selectedService === 'viaje' && this.lastKm > 0 && this.lastPrice > 0;
  }

  /* =========================
     MAPA / MARKERS / ROUTE
     ========================= */
  private map!: L.Map;

  private originLatLng?: L.LatLng;
  private destLatLng?: L.LatLng;

  private originMarker?: L.Marker;
  private destMarker?: L.Marker;

  private routeControl: any;

  private originTimer: any = null;
  private destTimer: any = null;

  ngAfterViewInit(): void {
    // ✅ AÑADIDO: cargar URL de foto perfil desde AuthService
    this.profileImgUrl = this.auth.getProfileImageUrl();

    this.initMap();
    setTimeout(() => this.map.invalidateSize(), 250);
  }

  private initMap(): void {
    const start: L.LatLngExpression = [28.1235, -15.4363];
    this.map = L.map('map', { center: start, zoom: 13, zoomControl: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Si NO quieres marcador inicial, deja originLatLng undefined y no lo pintes aquí.
  }

  /* =========================
     ICONO PIN (inline)
     ========================= */
  private createPinIcon(type: 'origin' | 'dest'): L.DivIcon {
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

  private ensureMarker(kind: 'origin' | 'dest', pos: L.LatLng): void {
    if (kind === 'origin') {
      if (!this.originMarker) {
        this.originMarker = L.marker(pos, { icon: this.createPinIcon('origin') }).addTo(this.map);
      } else {
        this.originMarker.setLatLng(pos);
      }
      this.originMarker.bindTooltip('Origen', { direction: 'top', offset: [0, -10] });
    } else {
      if (!this.destMarker) {
        this.destMarker = L.marker(pos, { icon: this.createPinIcon('dest') }).addTo(this.map);
      } else {
        this.destMarker.setLatLng(pos);
      }
      this.destMarker.bindTooltip('Destino', { direction: 'top', offset: [0, -10] });
    }
  }

  /* =========================
     LOGO
     ========================= */
  onLogoError(e: any): void {
    console.error('❌ No se pudo cargar el logo:', this.logoSrc, e);
  }

  /* =========================
     ORIGEN EVENTS
     ========================= */
  onLocationFocus(): void {
    this.showSuggestions = true;
    this.computeOriginSuggestBox();
  }

  onLocationInput(ev: any): void {
    const value = (ev?.detail?.value ?? '').toString();
    this.locationQuery = value;

    this.showSuggestions = true;
    this.computeOriginSuggestBox();

    if (this.originTimer) {
      clearTimeout(this.originTimer);
      this.originTimer = null;
    }

    const q = value.trim();
    if (q.length < 2) {
      this.suggestions = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    this.originTimer = setTimeout(() => this.fetchSuggestions(q, 'origin'), 250);
  }

  onEnterSearch(): void {
    const q = this.locationQuery.trim();
    if (q.length < 2) return;

    if (this.originTimer) {
      clearTimeout(this.originTimer);
      this.originTimer = null;
    }

    this.loading = true;
    this.fetchSuggestions(q, 'origin', true);
  }

  clearLocation(): void {
    this.locationQuery = '';
    this.suggestions = [];
    this.loading = false;
    this.showSuggestions = false;

    this.originLatLng = undefined;
    if (this.originMarker) {
      this.map.removeLayer(this.originMarker);
      this.originMarker = undefined;
    }

    this.clearRouteOnly();
    this.clearFarePanel();
  }

  selectSuggestion(s: NominatimResult): void {
    const pos = L.latLng(Number(s.lat), Number(s.lon));
    this.originLatLng = pos;

    this.locationQuery = s.display_name || this.locationQuery;

    this.suggestions = [];
    this.loading = false;
    this.showSuggestions = false;

    this.ensureMarker('origin', pos);
    this.map.setView(pos, 17, { animate: true });

    if (this.destLatLng) this.buildRoute();
  }

  /* =========================
     DESTINO EVENTS
     ========================= */
  openDestination(): void {
    this.destMode = true;
    this.showDestSuggestions = true;
  }

  onDestFocus(): void {
    this.showDestSuggestions = true;
  }

  onDestInput(ev: any): void {
    const value = (ev?.detail?.value ?? '').toString();
    this.destQuery = value;

    this.showDestSuggestions = true;

    if (this.destTimer) {
      clearTimeout(this.destTimer);
      this.destTimer = null;
    }

    const q = value.trim();
    if (q.length < 2) {
      this.destSuggestions = [];
      this.destLoading = false;
      return;
    }

    this.destLoading = true;
    this.destTimer = setTimeout(() => this.fetchSuggestions(q, 'dest'), 250);
  }

  onDestEnter(): void {
    const q = this.destQuery.trim();
    if (q.length < 2) return;

    if (this.destTimer) {
      clearTimeout(this.destTimer);
      this.destTimer = null;
    }

    this.destLoading = true;
    this.fetchSuggestions(q, 'dest', true);
  }

  clearDestination(): void {
    this.destQuery = '';
    this.destSuggestions = [];
    this.destLoading = false;
    this.showDestSuggestions = false;

    this.destLatLng = undefined;
    if (this.destMarker) {
      this.map.removeLayer(this.destMarker);
      this.destMarker = undefined;
    }

    this.clearRouteOnly();
    this.clearFarePanel();
  }

  selectDestSuggestion(s: NominatimResult): void {
    const pos = L.latLng(Number(s.lat), Number(s.lon));
    this.destLatLng = pos;

    this.destQuery = s.display_name || this.destQuery;

    this.destSuggestions = [];
    this.destLoading = false;
    this.showDestSuggestions = false;

    this.ensureMarker('dest', pos);

    this.buildRoute();
  }

  /* =========================
     NOMINATIM
     ========================= */
  private async fetchSuggestions(query: string, kind: 'origin' | 'dest', autoPick = false): Promise<void> {
    try {
      const url =
        'https://nominatim.openstreetmap.org/search?' +
        new URLSearchParams({
          q: query,
          format: 'jsonv2',
          limit: '5',
          addressdetails: '1',
          'accept-language': 'es',
          countrycodes: 'es',
        }).toString();

      const res = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!res.ok) {
        this.setLoading(kind, false);
        this.setSuggestions(kind, []);
        return;
      }

      const data = (await res.json()) as NominatimResult[];
      const list = (Array.isArray(data) ? data : []).map(x => ({
        ...x,
        uiLabel: this.formatSuggestionLabel(x),
      }));

      this.setSuggestions(kind, list);
      this.setLoading(kind, false);

      if (autoPick && list.length) {
        const best = this.pickBestResult(query, list);
        if (kind === 'origin') this.selectSuggestion(best);
        else this.selectDestSuggestion(best);
      }
    } catch (e) {
      console.error('Nominatim error', e);
      this.setLoading(kind, false);
      this.setSuggestions(kind, []);
    }
  }

  private setSuggestions(kind: 'origin' | 'dest', list: NominatimResult[]): void {
    if (kind === 'origin') this.suggestions = list;
    else this.destSuggestions = list;
  }

  private setLoading(kind: 'origin' | 'dest', v: boolean): void {
    if (kind === 'origin') this.loading = v;
    else this.destLoading = v;
  }

  private pickBestResult(query: string, results: NominatimResult[]): NominatimResult {
    const hasNumber = /\d+/.test(query);
    if (hasNumber) {
      const withHouse = results.find(r => r.address?.house_number);
      if (withHouse) return withHouse;
    }

    let best = results[0];
    for (const r of results) {
      if ((r.importance ?? 0) > (best.importance ?? 0)) best = r;
    }
    return best;
  }

  private formatSuggestionLabel(s: NominatimResult): string {
    const a = s.address;

    const road = a?.road || '';
    const num = a?.house_number ? ` ${a.house_number}` : '';
    const street = (road ? `${road}${num}` : '').trim();

    const locality =
      a?.city ||
      a?.town ||
      a?.village ||
      a?.municipality ||
      a?.county ||
      a?.suburb ||
      a?.neighbourhood ||
      '';

    if (street && locality) return `${street} · ${locality}`;
    if (street) return street;

    if (s.display_name) {
      const parts = s.display_name.split(',').map(p => p.trim()).filter(Boolean);
      const p1 = parts[0] ?? '';
      const p2 = parts[1] ?? '';
      return p2 ? `${p1} · ${p2}` : p1;
    }

    return '';
  }

  private computeOriginSuggestBox(): void {
    const el = this.locationPill?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    this.suggestLeft = Math.round(rect.left);
    this.suggestTop = Math.round(rect.bottom + 8);
    this.suggestWidth = Math.round(rect.width);
  }

  /* =========================
     ROUTE + DISTANCIA / PRECIO
     ========================= */
  private buildRoute(): void {
    if (!this.originLatLng || !this.destLatLng) return;

    // limpiar ruta anterior
    this.clearRouteOnly();

    const lineOptions = {
      styles: [{ color: '#6c54f3', weight: 6, opacity: 0.9 }],
      extendToWaypoints: true,
      missingRouteTolerance: 0,
    };

    const opts: any = {
      waypoints: [this.originLatLng, this.destLatLng],
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,

      show: false,
      collapsible: false,
      showAlternatives: false,
      fitSelectedRoutes: true,

      createMarker: () => null,
      lineOptions,

      router: (L as any).Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
      }),
    };

    this.routeControl = (L as any).Routing.control(opts).addTo(this.map);

    // oculta panel instrucciones (por si Leaflet lo mete igual)
    setTimeout(() => {
      const c1 = document.querySelector('.leaflet-routing-container') as HTMLElement | null;
      if (c1) c1.style.display = 'none';
      const c2 = document.querySelector('.leaflet-routing-alt') as HTMLElement | null;
      if (c2) c2.style.display = 'none';
    }, 0);

    this.routeControl.on('routesfound', (e: any) => {
      const route = e?.routes?.[0];
      const meters = route?.summary?.totalDistance;

      if (typeof meters === 'number') {
        const km = meters / 1000;
        this.updateFarePanel(km);
      }
    });
  }

  private clearRouteOnly(): void {
    if (this.routeControl) {
      try { this.map.removeControl(this.routeControl); } catch {}
      this.routeControl = undefined;
    }
  }

  private clearFarePanel(): void {
    this.distanceLabel = '';
    this.priceLabel = '';
    this.lastKm = 0;
    this.lastPrice = 0;
  }

  private updateFarePanel(km: number): void {
    const subtotal = this.baseFare + (km * this.perKm);
    const total = subtotal * (1 + this.feePct);

    this.lastKm = km;
    this.lastPrice = total;

    this.distanceLabel = `Distancia: ${km.toFixed(2)} km`;
    this.priceLabel = `Precio final: ${total.toFixed(2)} €`;
  }

  /* =========================
     CTA ACEPTAR/PAGAR
     ========================= */
  payTrip(): void {
    if (!this.canPay) return;

    // Por ahora mock. Luego lo conectas con backend/pasarela.
    console.log('✅ Aceptar trayecto', {
      origen: this.locationQuery,
      destino: this.destQuery,
      km: Number(this.lastKm.toFixed(2)),
      precio: Number(this.lastPrice.toFixed(2)),
      modo: this.selectedService,
    });
  }

  /* =========================
     BOTONES
     ========================= */
  setService(mode: ServiceMode): void {
    this.selectedService = mode;
  }

  goFavorites(): void { console.log('Favoritos'); }
  goHistory(): void { console.log('Historial'); }
  goAccount(): void { console.log('Mi cuenta'); }
}
