import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FavoritosService, favorito } from '../services/favoritos.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage {
  logoSrc = 'assets/Images/logo/waybee-logo.png';

  loading = false;
  favoritos: favorito[] = [];

  // ✅ ESTA ES LA QUE TE FALTA (tu HTML la usa)
  error = '';

  profileImgUrl: string | null = null;

  constructor(
    private router: Router,
    private auth: AuthService,
    private favService: FavoritosService
  ) {}

  ionViewWillEnter(): void {
    this.loadProfileImage();
    this.loadFavoritos();
  }

  private loadProfileImage(): void {
    const u: any = (this.auth as any).getUser?.() || null;
    const img = u?.img_profile || u?.imgProfile || null;

    if (img) {
      const cleaned = String(img).replace(/^\/+/, '');
      const path = cleaned.startsWith('images/') ? cleaned : `images/${cleaned}`;
      this.profileImgUrl = `http://localhost:8080/${path}`;
    } else {
      this.profileImgUrl = null;
    }
  }

  loadFavoritos(): void {
    this.loading = true;
    this.error = '';

    this.favService.list().subscribe({
      next: (list) => {
        this.favoritos = Array.isArray(list) ? list : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error cargando favoritos:', err);
        this.favoritos = [];
        this.error = 'No se pudieron cargar los favoritos.';
        this.loading = false;
      },
    });
  }

  deleteFavorito(f: favorito, ev: Event): void {
    ev.stopPropagation();

    this.favService.remove(f.id).subscribe({
      next: () => {
        this.favoritos = this.favoritos.filter(x => x.id !== f.id);
      },
      error: (err) => {
        console.error('❌ Error eliminando favorito:', err);
      },
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/home');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
