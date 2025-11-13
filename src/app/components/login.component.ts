import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>lock</mat-icon>
            Login
          </mat-card-title>
          <mat-card-subtitle
            >Enter your credentials to continue</mat-card-subtitle
          >
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input
                matInput
                formControlName="username"
                placeholder="Enter username"
                autocomplete="username"
              />
              <mat-icon matPrefix>person</mat-icon>
              @if(loginForm.get("username")?.hasError('required')) {
              <mat-error> Username is required </mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                placeholder="Enter password"
                autocomplete="current-password"
              />
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword"
              >
                <mat-icon>{{
                  hidePassword ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
              @if(loginForm.get('password')?.hasError('required')) {
              <mat-error> Password is required </mat-error>
              } @if(loginForm.get('password')?.hasError('minlength')) {
              <mat-error> Password must be at least 6 characters </mat-error>
              }
            </mat-form-field>
            @if(errorMessage) {
            <div class="error-message">
              <mat-icon>error</mat-icon>
              <span>{{ errorMessage }}</span>
            </div>
            }

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width login-button"
              [disabled]="loginForm.invalid || isLoading"
            >
              @if(isLoading) {
              <mat-spinner diameter="20"></mat-spinner>
              } @if(!isLoading) {
              <span>Login</span>
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <a mat-button color="accent" routerLink="/forgot-password">
            Forgot Password?
          </a>
          <a mat-button color="primary" routerLink="/register">
            Create Account
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #a8b5edff 0%, #e2d5f0ff 100%);
        padding: 20px;
      }

      .login-card {
        width: 100%;
        max-width: 450px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }

      mat-card-header {
        margin-bottom: 20px;
      }

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 28px;
        font-weight: 60;
      }

      mat-card-subtitle {
        margin-top: 8px;
        color: rgba(0, 0, 0, 0.6);
      }

      .full-width {
        width: 100%;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .login-button {
        margin-top: 16px;
        height: 48px;
        font-size: 16px;
        font-weight: 500;
      }

      .login-button mat-spinner {
        display: inline-block;
        margin-right: 8px;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background-color: #ffebee;
        border: 1px solid #f44336;
        border-radius: 4px;
        color: #c62828;
        font-size: 14px;
      }

      .error-message mat-icon {
        color: #f44336;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      mat-card-actions {
        display: flex;
        justify-content: space-between;
        padding: 16px;
      }

      @media (max-width: 600px) {
        .login-container {
          padding: 12px;
        }

        mat-card-actions {
          flex-direction: column;
          gap: 8px;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  errorMessage = '';
  returnUrl = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;

        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });

        // Navigate to return URL or home
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage = 'Invalid username or password';
        } else if (error.status === 0) {
          this.errorMessage = 'Network error. Please check your connection.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }

        this.snackBar.open(this.errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
