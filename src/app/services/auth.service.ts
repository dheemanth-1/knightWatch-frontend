import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../shared/constants/api-endpoints';
import { isPlatformBrowser } from '@angular/common';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface NewUser {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    username: string;
    email?: string;
    roles?: string[];
  };
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  roles?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = API_ENDPOINTS.BASE_URL + API_ENDPOINTS.AUTH; // Adjust to your API endpoint
  private tokenKey = 'jwt_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getUserFromStorage()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Register with user credentials
   */
  register(registeringUser: NewUser): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, registeringUser);
  }

  /**
   * Login with username and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.setSession(response);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  /**
   * Logout and clear all stored data
   */
  logout(): void {
    this.http
      .post(
        `${this.apiUrl}/logout`,
        {},
        {
          withCredentials: true,
        }
      )
      .subscribe({
        next: () => {
          console.log('Logout successful on backend');
          this.clearSession(); // Clear AFTER logout completes
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('❌ Logout error:', err);
          // Clear session anyway even if logout fails
          this.clearSession();
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        },
      });

    // this.clearSession();
    // this.currentUserSubject.next(null);
    // this.router.navigate(['/login']);
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    const token = this.getToken();
    if (!token) {
      return false;
    }

    return !this.isTokenExpired(token);
  }

  /**
   * Get the current JWT token
   */
  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  storeToken(token: string): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Get current user from BehaviorSubject
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Refresh the JWT token
   */
  refreshToken(): Observable<RefreshResponse> {
    console.log('trying to get a refresh token');
    const refreshToken = this.getRefreshToken();

    return this.http
      .post<RefreshResponse>(
        `${this.apiUrl}/refresh`,
        {
          refreshToken,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((response) => {
          this.setSession(response);
          //this.currentUserSubject.next(response.user);
        })
      );
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  /**
   * Private helper methods
   */

  private setSession(authResult: LoginResponse | RefreshResponse): void {
    if (!this.isBrowser()) {
      return;
    }
    if ('accessToken' in authResult && 'refreshToken' in authResult) {
      localStorage.setItem(this.tokenKey, authResult.accessToken);

      if (authResult.refreshToken) {
        localStorage.setItem(this.refreshTokenKey, authResult.refreshToken);
      }

      localStorage.setItem(this.userKey, JSON.stringify(authResult.user));
    } else if ('accessToken' in authResult) {
      localStorage.setItem(this.tokenKey, authResult.accessToken);
    }
  }

  private clearSession(): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  private getUserFromStorage(): User | null {
    if (!this.isBrowser()) {
      return null;
    }
    const userJson = localStorage.getItem(this.userKey);
    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);

      if (!payload.exp) {
        return false;
      }

      // exp is in seconds, Date.now() is in milliseconds
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }
}
