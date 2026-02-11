import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {

  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ionViewWillEnter() {
    // Si ya está logado, redirigimos por rol
    if (this.auth.isLogged()) {
      const role = this.auth.getRole();
      this.redirectByRole(role);
    }
  }

  doLogin() {
    this.error = '';
    this.loading = true;

    this.auth.login(this.email.trim(), this.password)
      .subscribe({
        next: (res) => {
          const role = res?.user?.rol; // 'user' | 'driver' | 'admin'
          this.loading = false;
          this.redirectByRole(role);
        },
        error: (e) => {
          this.loading = false;
          this.error = e?.error?.message || 'No se pudo iniciar sesión.';
        }
      });
  }

  goRegister() {
    this.router.navigateByUrl('/register');
  }

  private redirectByRole(role: string | null | undefined) {
    // Roles reales en BD/backend: user | driver | admin
    if (role === 'user') this.router.navigateByUrl('/home');
    else if (role === 'driver') this.router.navigateByUrl('/driver');
    else if (role === 'admin') this.router.navigateByUrl('/home'); // admin pendiente
    else this.router.navigateByUrl('/login');
  }
}
