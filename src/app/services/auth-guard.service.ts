import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Guard to protect routes - redirects to login if not authenticated
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // const isAuth = this.authService.isAuthenticated();
    // console.log('isAuthenticated?', isAuth);
    if (this.authService.isAuthenticated()) {
      return true;
    }
    // const token = this.authService.getToken();
    // console.log('Token exists?', !!token);

    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });

    return false;
  }
}

/**
 * Guard to prevent authenticated users from accessing login page
 */
@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      // Already logged in, redirect to home
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}

/**
 * Role-based guard - checks if user has required role
 * Usage: { path: 'admin', component: AdminComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } }
 */
@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = this.authService.getCurrentUser();

    if (!user || !requiredRoles) {
      return true;
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) =>
      this.authService.hasRole(role)
    );

    if (!hasRole) {
      // User doesn't have required role
      this.router.navigate(['/forbidden']);
      return false;
    }

    return true;
  }
}
