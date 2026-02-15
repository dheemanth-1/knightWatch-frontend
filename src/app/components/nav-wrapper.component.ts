import { Component } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-wrapper',
  standalone: true,
  imports: [MatIconModule, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar>
      <button
        mat-icon-button
        class="example-icon"
        aria-label="Example icon-button with menu icon"
      >
        <mat-icon>menu</mat-icon>
      </button>
      <span>Knight Watch</span>
      <span class="example-spacer"></span>
      <button mat-button (click)="onLogout()">Log Out</button>
      <button
        mat-icon-button
        class="example-icon favorite-icon"
        aria-label="Example icon-button with heart icon"
      >
        <mat-icon>favorite</mat-icon>
      </button>
      <button
        mat-icon-button
        class="example-icon"
        aria-label="Example icon-button with share icon"
      >
        <mat-icon>share</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: `.example-spacer {
  flex: 1 1 auto;
  }
`,
})
export class NavWrapperComponent {
  constructor(private router: Router) {}

  onLogout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
