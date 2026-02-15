import { inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
  HttpInterceptorFn,
  HttpHandlerFn,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor to:
 * 1. Add JWT token to all outgoing requests
 * 2. Handle 401 errors and attempt token refresh
 * 3. Logout user on authentication failure
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  console.log(' JWT Interceptor:', req.method, req.url);
  console.log('  withCredentials:', req.withCredentials);
  console.log('  Headers:', {
    Authorization: req.headers.get('Authorization'),
    Cookie: req.headers.get('Cookie'),
  });
  console.log('  Browser cookies:', document.cookie);
  const nonAuthEndpoints = ['/login', '/register', '/refresh'];
  if (nonAuthEndpoints.some((url) => req.url.includes(url))) {
    console.log(' Skipping auth header for:', req.url);
    return next(req);
  }

  const token = authService.getToken();
  console.log('Token exists?', !!token);

  if (token) {
    console.log(' Adding Authorization header');
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
  } else {
    console.log(' No token - skipping Authorization header');
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        console.log(' 401 Unauthorized');
        return handle401Error(req, next, authService);
      }
      if (error.status === 403) {
        console.warn(' 403 Forbidden — session may be invalid');

        //authService.logout();
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(req: HttpRequest<any>, token: string) {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      console.log('No refresh token found — logging out');
      authService.logout();
      return throwError(() => new Error('No refresh token'));
    }

    console.log('Refreshing access token...');
    return authService.refreshToken().pipe(
      switchMap((newToken) => {
        isRefreshing = false;
        if (!newToken) {
          console.error('Refresh failed — logging out');
          authService.logout();
          return throwError(() => new Error('Refresh failed'));
        }

        console.log('Token refreshed successfully');
        authService.storeToken(newToken.accessToken);
        refreshTokenSubject.next(newToken.accessToken);

        // Retry original request with new token
        return next(addTokenHeader(request, newToken.accessToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        console.error('Refresh token invalid or expired — logging out');
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Wait until token refresh is done, then retry
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        console.log('Retrying request with new token');
        return next(addTokenHeader(request, token!));
      })
    );
  }
}
