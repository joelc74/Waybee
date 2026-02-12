import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export type favorito = {
  id: number;
  id_usuario: number;
  titulo: string;
  origen_direccion: string;
  origen_lat: number;
  origen_lng: number;
  destino_direccion: string;
  destino_lat: number;
  destino_lng: number;
  created_at?: string;
  updated_at?: string;
};

export type favorito_create_payload = {
  titulo: string;
  origen_direccion: string;
  origen_lat: number;
  origen_lng: number;
  destino_direccion: string;
  destino_lat: number;
  destino_lng: number;
};

export type FavoritoCreateResponse = {
  id: number;
  message?: string;
};

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  // ✅ MISMO patrón que tu AuthService: environment.apiUrl + path
  private readonly api = `${environment.apiUrl.replace(/\/$/, '')}/favorito`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken(); // ✅ REAL, existe en tu AuthService
    if (!token) {
      // Sin token -> el backend te va a dar 401 sí o sí.
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  list(): Observable<favorito[]> {
    return this.http.get<favorito[]>(this.api, { headers: this.headers() });
  }

  create(payload: favorito_create_payload): Observable<FavoritoCreateResponse> {
    return this.http.post<FavoritoCreateResponse>(this.api, payload, { headers: this.headers() });
  }

  remove(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`, { headers: this.headers() });
  }
}
