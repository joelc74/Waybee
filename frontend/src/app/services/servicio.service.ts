import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export type servicio_estado = 'pendiente' | 'aceptado' | 'en_curso' | 'completado' | 'cancelado';

export type servicio_create_payload = {
  tipo_servicio: 'viaje' | 'envio';
  id_usuario: number;

  origen_direccion: string;
  destino_direccion: string;

  origen_lat?: number | null;
  origen_lng?: number | null;
  destino_lat?: number | null;
  destino_lng?: number | null;

  distancia_km?: number | null;

  // SOLO PRECIO
  precio?: number | null;

  // envio
  peso_paquete?: number | null;
  dimensiones_paquete?: string | null;
  fragil?: boolean | null;
};

export type servicio_create_response = {
  id_servicio?: number;
  id_usuario?: number;
  tipo_servicio?: string;
  estado?: servicio_estado;

  precio?: number | null;

  [k: string]: any;
};

@Injectable({
  providedIn: 'root',
})
export class ServicioService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  // POST /api/servicio
  create(payload: servicio_create_payload): Observable<servicio_create_response> {
    return this.http.post<servicio_create_response>(`${this.apiUrl}/api/servicio`, payload, {
      headers: this.getHeaders(),
    });
  }

  // GET /api/servicio/pool
  getPool(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/servicio/pool`, {
      headers: this.getHeaders(),
    });
  }

  // GET /api/servicio?id_usuario=123
  getByUser(id_usuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/servicio?id_usuario=${id_usuario}`, {
      headers: this.getHeaders(),
    });
  }
}
