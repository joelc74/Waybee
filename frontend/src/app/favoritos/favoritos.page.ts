// frontend/src/app/favoritos/favoritos.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FavoritosService, Favorito } from '../services/favoritos.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage {

  constructor(
    private auth: AuthService,
    private router: Router,
    private favService: FavoritosService
  ) {}

  logoSrc = 'assets/Images/logo/waybee-logo.png';

  profileImgUrl: string | null = null;
  loading = false;
  error = '';
  favoritos: Favorito[] = [];

  ionViewDidEnter(): void {
    this.profileImgUrl = this.auth.getProfileImageUrl();
    this.load();
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

  load(): void {
    this.loading = true;
    this.error = '';

    this.favService.list().subscribe({
      next: (rows) => {
        this.favoritos = Array.isArray(rows) ? rows : [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Error cargando favoritos', err);
        this.error = err?.error?.message || err?.message || 'No se pudieron cargar los favoritos.';
        this.loading = false;
      }
    });
  }

  deleteFavorito(f: Favorito, ev?: any): void {
    if (ev?.stopPropagation) ev.stopPropagation();

    const id = Number(f?.id);
    if (!id) return;

    this.favService.remove(id).subscribe({
      next: () => {
        this.favoritos = this.favoritos.filter(x => x.id !== id);
      },
      error: (err: any) => {
        console.error('❌ Error borrando favorito', err);
        this.error = err?.error?.message || err?.message || 'No se pudo borrar el favorito.';
      }
    });
  }

  useFavorito(f: Favorito): void {
    // Volver a Home y pasar la ruta seleccionada
    this.router.navigateByUrl('/home', { state: { fav: f } });
  }
}
