// frontend/src/app/home/home.page.ts
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

import { AuthService } from '../services/auth.service';
import { FavoritosService, Favorito } from '../services/favoritos.service';
import { ServicioService, servicio_create_payload, servicio_create_response } from '../services/servicio.service';

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
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements AfterViewInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private favoritosService: FavoritosService,
    private servicioService: ServicioService
  ) { }

  /* =========================
     PERFIL + LOGO
     ========================= */
  logoSrc = 'assets/Images/logo/waybee-logo.png';
  profileImgUrl: string | null = null;

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

  /* =========================
     SERVICIO / TARIFA
     ========================= */
  selectedService: ServiceMode = 'viaje';

  private readonly baseFare = 5.7;
  private readonly perKm = 0.97;
  private readonly feePct = 0.12;

  // ✅ ENVÍO: parámetros de cálculo
  private readonly envioBase = 8.0;           // base mínima
  private readonly envioPerKm = 0.55;         // €/km
  private readonly envioDivisorVol = 5000;    // cm3 / 5000 = kg volumétrico
  private readonly envioPerKgEq = 0.90;       // €/kg equivalente
  private readonly envioFragilExtra = 1.50;   // extra si frágil

  distanceLabel = '';
  priceLabel = '';
  lastKm = 0;
  lastPrice = 0;

  paymentDone = false;
  private currentRequestKey: string | null = null;

  // ✅ ENVÍO: datos del paquete
  envioPesoKg: number | null = null;
  envioAnchoCm: number | null = null;
  envioLargoCm: number | null = null;
  envioAltoCm: number | null = null;
  envioFragil = false;

  private isEnvioFormValid(): boolean {
    const p = Number(this.envioPesoKg ?? 0);
    const a = Number(this.envioAnchoCm ?? 0);
    const l = Number(this.envioLargoCm ?? 0);
    const h = Number(this.envioAltoCm ?? 0);
    return p > 0 && a > 0 && l > 0 && h > 0;
  }

  // ✅ canPay ahora vale para viaje y envío (sin tocar tu flujo de botones)
  get canPay(): boolean {
    if (this.selectedService === 'viaje') {
      return this.lastKm > 0 && this.lastPrice > 0;
    }
    return this.lastKm > 0 && this.lastPrice > 0 && this.isEnvioFormValid();
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
     FAVORITOS
     ========================= */
  isFav = false;
  favBusy = false;
  lastFavId: number | null = null;

  showFavNameCard = false;
  favTitulo = '';

  onFavTituloInput(ev: any): void {
    const v = (ev?.target?.value ?? '').toString();
    this.favTitulo = v;
  }

  cancelFavName(): void {
    if (this.favBusy) return;
    this.showFavNameCard = false;
    this.favTitulo = '';
  }

  saveFavName(): void {
    if (this.favBusy) return;
    if (!this.canPay) return;
    if (this.paymentDone) return;

    const titulo = (this.favTitulo || '').trim();
    if (!titulo) return;

    const payload = {
      titulo,
      origen_direccion: this.locationQuery || '',
      origen_lat: this.originLatLng?.lat ?? null,
      origen_lng: this.originLatLng?.lng ?? null,
      destino_direccion: this.destQuery || '',
      destino_lat: this.destLatLng?.lat ?? null,
      destino_lng: this.destLatLng?.lng ?? null,
    };

    this.favBusy = true;

    this.favoritosService.create(payload).subscribe({
      next: (created: Favorito) => {
        this.isFav = true;
        this.lastFavId = Number((created as any)?.id) || null;

        this.showFavNameCard = false;
        this.favTitulo = '';
        this.favBusy = false;
      },
      error: (err: any) => {
        console.error('❌ Error al guardar favorito', err);
        this.favBusy = false;
      },
    });
  }

  onFavClick(): void {
    if (this.favBusy) return;
    if (!this.canPay) return;
    if (this.paymentDone) return;

    if (this.isFav && this.lastFavId) {
      const id = this.lastFavId;
      this.favBusy = true;

      this.favoritosService.remove(id).subscribe({
        next: () => {
          this.isFav = false;
          this.lastFavId = null;
          this.favBusy = false;
        },
        error: (err: any) => {
          console.error('❌ Error al borrar favorito', err);
          this.favBusy = false;
        },
      });

      return;
    }

    this.favTitulo = '';
    this.showFavNameCard = true;
  }

  /* =========================
     PASARELA
     ========================= */
  showPayCard = false;
  payBusy = false;

  fakePay: { number20: string; exp: string; cvv: string } | null = null;

  private randomDigit(): string {
    return Math.floor(Math.random() * 10).toString();
  }

  private generateCard20(): string {
    const raw = Array.from({ length: 20 }, () => this.randomDigit()).join('');
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  private generateCvv(): string {
    return Array.from({ length: 3 }, () => this.randomDigit()).join('');
  }

  openFakePayCard(): void {
    if (!this.canPay || this.payBusy) return;
    if (this.paymentDone) return;

    this.fakePay = {
      number20: this.generateCard20(),
      exp: '09/33',
      cvv: this.generateCvv(),
    };

    this.showPayCard = true;
  }

  cancelFakePay(): void {
    if (this.payBusy) return;
    this.showPayCard = false;
    this.fakePay = null;
  }

  confirmFakePay(): void {
    if (this.payBusy) return;
    if (!this.canPay) return;
    if (this.paymentDone) return;

    const u: any = this.auth.getUser?.() || null;
    const id_usuario = Number(u?.id ?? u?.id_usuario ?? u?.idUsuario);

    if (!id_usuario) {
      this.auth.logout();
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    const payload: servicio_create_payload = {
      tipo_servicio: (this.selectedService === 'envio' ? 'envio' : 'viaje'),
      id_usuario,
      origen_direccion: this.locationQuery || '',
      destino_direccion: this.destQuery || '',
      origen_lat: this.originLatLng?.lat ?? null,
      origen_lng: this.originLatLng?.lng ?? null,
      destino_lat: this.destLatLng?.lat ?? null,
      destino_lng: this.destLatLng?.lng ?? null,
      distancia_km: Number(this.lastKm.toFixed(2)),
      precio: Number(this.lastPrice.toFixed(2)),
    };

    // ✅ Si es ENVÍO, añadimos campos del paquete (sin romper tipado si no existen en la interfaz)
    if (this.selectedService === 'envio') {
      const dims = `${this.envioAnchoCm}x${this.envioLargoCm}x${this.envioAltoCm} cm`;
      (payload as any).peso_paquete = Number((this.envioPesoKg ?? 0).toFixed(2));
      (payload as any).dimensiones_paquete = dims;
      (payload as any).fragil = this.envioFragil ? 1 : 0;
    }

    this.payBusy = true;

    this.servicioService.create(payload).subscribe({
      next: (created: servicio_create_response) => {
        console.log('✅ Servicio creado:', created);

        this.persistRequestedForCurrentRoute();
        this.paymentDone = true;

        this.payBusy = false;
        this.showPayCard = false;
        this.fakePay = null;
      },
      error: (err: any) => {
        console.error('❌ Error creando servicio:', err);
        this.payBusy = false;
      },
    });
  }

  /* =========================
     MAPA / ROUTING + Persistencia solicitado
     ========================= */
  private map!: L.Map;

  private originLatLng?: L.LatLng;
  private destLatLng?: L.LatLng;

  private originMarker?: L.Marker;
  private destMarker?: L.Marker;

  private routeControl: any;

  private originTimer: any = null;
  private destTimer: any = null;

  private lastStateKey = '';

  ngAfterViewInit(): void {
    this.initMap();
    setTimeout(() => this.map.invalidateSize(), 250);

    this.refreshProfileImg();
    this.applyFavFromNavigationState();
    this.syncRequestedStateFromCurrentRoute();
  }

  ionViewDidEnter(): void {
    this.refreshProfileImg();
    if (this.map) setTimeout(() => this.map.invalidateSize(), 150);
    this.applyFavFromNavigationState();
    this.syncRequestedStateFromCurrentRoute();
  }

  private initMap(): void {
    const start: L.LatLngExpression = [28.1235, -15.4363];
    this.map = L.map('map', { center: start, zoom: 13, zoomControl: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

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

  private roundCoord(n: number, decimals = 5): number {
    const p = Math.pow(10, decimals);
    return Math.round(n * p) / p;
  }

  private computeCurrentRequestKey(): string | null {
    if (!this.originLatLng || !this.destLatLng) return null;

    const olat = this.roundCoord(this.originLatLng.lat, 5);
    const olng = this.roundCoord(this.originLatLng.lng, 5);
    const dlat = this.roundCoord(this.destLatLng.lat, 5);
    const dlng = this.roundCoord(this.destLatLng.lng, 5);

    return `wb_req_${olat}_${olng}__${dlat}_${dlng}`;
  }

  private syncRequestedStateFromCurrentRoute(): void {
    const key = this.computeCurrentRequestKey();
    this.currentRequestKey = key;

    if (!key) {
      this.paymentDone = false;
      return;
    }

    this.paymentDone = localStorage.getItem(key) === '1';
  }

  private persistRequestedForCurrentRoute(): void {
    const key = this.computeCurrentRequestKey();
    this.currentRequestKey = key;
    if (!key) return;
    localStorage.setItem(key, '1');
  }

  private resetRequestedState(): void {
    this.paymentDone = false;
    this.currentRequestKey = null;
  }

  private applyFavFromNavigationState(): void {
    const st: any = (history && history.state) ? (history.state as any) : null;
    if (!st?.fav) return;

    const f: any = st.fav;

    const key = JSON.stringify({
      id: f?.id,
      olat: f?.origen_lat, olng: f?.origen_lng,
      dlat: f?.destino_lat, dlng: f?.destino_lng,
      odir: f?.origen_direccion, ddir: f?.destino_direccion,
    });

    if (key === this.lastStateKey) return;
    this.lastStateKey = key;

    this.locationQuery = (f?.origen_direccion ?? '').toString();
    this.destQuery = (f?.destino_direccion ?? '').toString();
    this.destMode = true;

    const oLat = Number(f?.origen_lat);
    const oLng = Number(f?.origen_lng);
    const dLat = Number(f?.destino_lat);
    const dLng = Number(f?.destino_lng);

    const hasOrigin = Number.isFinite(oLat) && Number.isFinite(oLng);
    const hasDest = Number.isFinite(dLat) && Number.isFinite(dLng);

    if (!hasOrigin || !hasDest) {
      console.warn('⚠️ Favorito sin coords completas. No se puede dibujar la ruta.', f);
      this.clearRouteOnly();
      this.clearFarePanel();
      return;
    }

    this.originLatLng = L.latLng(oLat, oLng);
    this.destLatLng = L.latLng(dLat, dLng);

    this.ensureMarker('origin', this.originLatLng);
    this.ensureMarker('dest', this.destLatLng);
    this.map.setView(this.originLatLng, 15, { animate: true });

    this.isFav = false;
    this.lastFavId = null;
    this.showFavNameCard = false;
    this.favTitulo = '';

    this.cancelFakePay();
    this.syncRequestedStateFromCurrentRoute();

    this.buildRoute();
  }

  onLocationFocus(): void {
    this.showSuggestions = true;
    this.computeOriginSuggestBox();
  }

  onLocationInput(ev: any): void {
    const value = (ev?.detail?.value ?? '').toString();
    this.locationQuery = value;

    this.resetRequestedState();

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

    this.resetRequestedState();

    this.originLatLng = undefined;
    if (this.originMarker) {
      this.map.removeLayer(this.originMarker);
      this.originMarker = undefined;
    }

    this.clearRouteOnly();
    this.clearFarePanel();

    this.isFav = false;
    this.lastFavId = null;
    this.showFavNameCard = false;
    this.favTitulo = '';

    this.cancelFakePay();
  }

  selectSuggestion(s: NominatimResult): void {
    const pos = L.latLng(Number(s.lat), Number(s.lon));
    this.originLatLng = pos;

    this.locationQuery = s.display_name || this.locationQuery;

    this.suggestions = [];
    this.loading = false;
    this.showSuggestions = false;

    this.resetRequestedState();

    this.ensureMarker('origin', pos);
    this.map.setView(pos, 17, { animate: true });

    if (this.destLatLng) this.buildRoute();
  }

  private computeOriginSuggestBox(): void {
    const el = this.locationPill?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    this.suggestLeft = Math.round(rect.left);
    this.suggestTop = Math.round(rect.bottom + 8);
    this.suggestWidth = Math.round(rect.width);
  }

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

    this.resetRequestedState();

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

    this.resetRequestedState();

    this.destLatLng = undefined;
    if (this.destMarker) {
      this.map.removeLayer(this.destMarker);
      this.destMarker = undefined;
    }

    this.clearRouteOnly();
    this.clearFarePanel();

    this.isFav = false;
    this.lastFavId = null;
    this.showFavNameCard = false;
    this.favTitulo = '';

    this.cancelFakePay();
  }

  selectDestSuggestion(s: NominatimResult): void {
    const pos = L.latLng(Number(s.lat), Number(s.lon));
    this.destLatLng = pos;

    this.destQuery = s.display_name || this.destQuery;

    this.destSuggestions = [];
    this.destLoading = false;
    this.showDestSuggestions = false;

    this.resetRequestedState();

    this.ensureMarker('dest', pos);
    this.buildRoute();
  }

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

  private buildRoute(): void {
    if (!this.originLatLng || !this.destLatLng) return;

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

        this.showFavNameCard = false;
        this.favTitulo = '';
        this.cancelFakePay();

        this.syncRequestedStateFromCurrentRoute();
      }
    });
  }

  private clearRouteOnly(): void {
    if (this.routeControl) {
      try {
        this.map.removeControl(this.routeControl);
      } catch { }
      this.routeControl = undefined;
    }
  }

  private clearFarePanel(): void {
    this.distanceLabel = '';
    this.priceLabel = '';
    this.lastKm = 0;
    this.lastPrice = 0;
    this.resetRequestedState();
  }

  // ✅ Cálculo envío (paso a paso interno)
  private computeEnvioTotal(km: number): number {
    const peso = Number(this.envioPesoKg ?? 0);
    const ancho = Number(this.envioAnchoCm ?? 0);
    const largo = Number(this.envioLargoCm ?? 0);
    const alto = Number(this.envioAltoCm ?? 0);

    const volCm3 = ancho * largo * alto;              // cm3
    const pesoVolKg = volCm3 / this.envioDivisorVol;  // kg volumétrico
    const kgEq = Math.max(peso, pesoVolKg);           // kg equivalente

    const base = this.envioBase;
    const dist = km * this.envioPerKm;
    const carga = kgEq * this.envioPerKgEq;
    const fragil = this.envioFragil ? this.envioFragilExtra : 0;

    const total = base + dist + carga + fragil;

    // redondeo a 2 decimales
    return Math.round(total * 100) / 100;
  }

  private updateFarePanel(km: number): void {
    this.lastKm = km;

    if (this.selectedService === 'viaje') {
      const subtotal = this.baseFare + km * this.perKm;
      const total = subtotal * (1 + this.feePct);

      this.lastPrice = total;

      this.distanceLabel = `Distancia: ${km.toFixed(2)} km`;
      this.priceLabel = `Precio final: ${total.toFixed(2)} €`;
      return;
    }

    // ✅ ENVÍO
    const totalEnvio = this.computeEnvioTotal(km);
    this.lastPrice = totalEnvio;

    this.distanceLabel = `Distancia: ${km.toFixed(2)} km`;
    this.priceLabel = `Precio envío: ${totalEnvio.toFixed(2)} €`;
  }

  // ✅ ENVÍO: handlers (recalcula precio si ya hay ruta)
  private recalcIfRouteReady(): void {
    if (this.lastKm > 0) {
      this.updateFarePanel(this.lastKm);
    }
  }

  onEnvioPesoInput(ev: any): void {
    const v = (ev?.target?.value ?? '').toString();
    const n = Number(v);
    this.envioPesoKg = Number.isFinite(n) && n > 0 ? n : null;
    this.recalcIfRouteReady();
  }

  onEnvioDimInput(which: 'ancho' | 'largo' | 'alto', ev: any): void {
    const v = (ev?.target?.value ?? '').toString();
    const n = Number(v);
    const val = Number.isFinite(n) && n > 0 ? n : null;

    if (which === 'ancho') this.envioAnchoCm = val;
    if (which === 'largo') this.envioLargoCm = val;
    if (which === 'alto') this.envioAltoCm = val;

    this.recalcIfRouteReady();
  }

  onEnvioFragilChange(ev: any): void {
    const checked = !!(ev?.target?.checked);
    this.envioFragil = checked;
    this.recalcIfRouteReady();
  }

  setService(mode: ServiceMode): void {
    this.selectedService = mode;

    // ✅ si ya hay ruta calculada, recalcula el panel al cambiar de pestaña
    if (this.lastKm > 0) {
      this.updateFarePanel(this.lastKm);
    }
  }

  goFavorites(): void {
    this.router.navigateByUrl('/favoritos');
  }

  goHistory(): void {
    this.router.navigateByUrl('/historial');
  }

  goAccount(): void {
    this.router.navigateByUrl('/cuenta');
  }
}