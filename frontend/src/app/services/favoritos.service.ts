// frontend/src/app/services/favoritos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export type Favorito = {
  id: number;
  id_usuario: number;
  titulo: string;
  origen_direccion: string;
  origen_lat: number | null;
  origen_lng: number | null;
  destino_direccion: string;
  destino_lat: number | null;
  destino_lng: number | null;
  created_at?: string;
  updated_at?: string;
};

export type FavoritoCreatePayload = {
  titulo: string;
  origen_direccion: string;
  origen_lat: number | null;
  origen_lng: number | null;
  destino_direccion: string;
  destino_lat: number | null;
  destino_lng: number | null;
};

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly baseUrl = `${environment.apiUrl}/favoritos`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  list(): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(this.baseUrl, { headers: this.authHeaders() });
  }

  create(payload: FavoritoCreatePayload): Observable<Favorito> {
    return this.http.post<Favorito>(this.baseUrl, payload, { headers: this.authHeaders() });
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }
}
