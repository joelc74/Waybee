import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowed: string[] = route.data?.['roles'] || [];
    const role = this.auth.getRole(); // 'user' | 'driver' | 'admin'

    if (!role) {
      this.router.navigateByUrl('/login');
      return false;
    }

    if (!allowed.length || allowed.includes(role)) return true;

    // si está logado pero no permitido, redirige a su zona
    if (role === 'user') this.router.navigateByUrl('/home');
    else if (role === 'driver') this.router.navigateByUrl('/driver');
    else this.router.navigateByUrl('/home');

    return false;
  }
}
