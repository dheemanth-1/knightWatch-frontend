import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-register',
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
  template: `<div class="login-container">
    <mat-card class="login-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>lock</mat-icon>
          Register
        </mat-card-title>
        <mat-card-subtitle
          >Enter your credentials to register as a new user</mat-card-subtitle
        >
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="registerForm!" (ngSubmit)="onSubmit()">
          <mat-form-field>
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Password</mat-label>
            <input
              matInput
              [type]="hidePassword ? 'password' : 'text'"
              formControlName="password"
            />
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
          </mat-form-field>
          <mat-form-field>
            <mat-label>Confirm Password</mat-label>
            <input matInput type="password" formControlName="password" />
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
            [disabled]="registerForm.invalid || isLoading"
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
        <a mat-button color="primary" routerLink="/login">
          Go back to Login Page
        </a>
      </mat-card-actions>
    </mat-card>
  </div>`,
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
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
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
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required]],
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      },
      { validators: passwordMatchValidator('password', 'confirmPassword') }
    );

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    console.log(this.registerForm);
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = this.registerForm.value;

    this.authService.register(credentials).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.isLoading = false;

        this.snackBar.open(
          'Registration successful! Log in with registered credentials',
          'Close',
          {
            duration: 3000,
            panelClass: ['success-snackbar'],
          }
        );

        // Navigate to return URL or home
        this.router.navigateByUrl('/login');
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.isLoading = false;

        if (error.status === 409) {
          console.log(error);
          this.errorMessage = 'username or email alredy exists';
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

export function passwordMatchValidator(
  password: string,
  confirmPassword: string
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const passwordControl = formGroup.get(password);
    const confirmPasswordControl = formGroup.get(confirmPassword);

    if (!passwordControl || !confirmPasswordControl) return null;

    const passwordValue = passwordControl.value;
    const confirmValue = confirmPasswordControl.value;

    if (confirmValue === '') return null;

    if (passwordValue !== confirmValue) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // clear error if they match
      if (confirmPasswordControl.hasError('passwordMismatch')) {
        confirmPasswordControl.setErrors(null);
      }
      return null;
    }
  };
}
