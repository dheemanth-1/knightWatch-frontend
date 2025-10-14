import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChesscomSyncService } from '../services/chesscom-sync.service';
import { debounceTime, merge, Subject, takeUntil } from 'rxjs';
import { MatOption } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { LichessProfileService } from '../services/lichess-profile.service';
export interface ChesscomGameAnalysisRequest {
  username: string;
  month: string;
  year: string;
}
export interface ChesscomProfile {
  userId: string;
  name: string;
  country: string;
  accStatus: string;
  joined: number;
  last_online: number;
  totalGamesBlitz: number;
  totalGamesRapid: number;
  totalGamesBullet: number;
  totalGamesClassical: number;
  blitzRating: number;
  rapidRating: number;
  bulletRating: number;
  classicRating: number;
  puzzleRating: number;
  url: string;
  followers: number;
  puzzleRush: number;
}
@Component({
  selector: 'app-chesscom-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatOption,
    MatSelectModule,
  ],
  template: `<div class="profile-container">
    <mat-card class="profile-card">
      <!-- Header Section -->
      <mat-card-header class="profile-header">
        <div mat-card-avatar class="profile-avatar">
          <mat-icon class="avatar-icon">person</mat-icon>
        </div>
        <mat-card-title class="profile-title">
          <span>{{ profile.name }}</span>
          <mat-chip-set class="status-chips">
            <mat-chip
              *ngIf="profile.accStatus !== 'basic'"
              color="warn"
              selected
            >
              <mat-icon matChipAvatar>star</mat-icon>
              {{ profile.accStatus }}
            </mat-chip>
            <mat-chip *ngIf="isOnline()" color="accent" selected>
              <mat-icon matChipAvatar>fiber_manual_record</mat-icon>
              Online
            </mat-chip>
          </mat-chip-set>
        </mat-card-title>
        <mat-card-subtitle>
          Member since {{ getJoinDate() }}
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Basic Stats Grid -->
        <div class="basic-stats">
          <div class="stat-card total-games">
            <mat-icon>sports_esports</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ getGamesCount() | number }}</span>
              <span class="stat-label">Total Games</span>
            </div>
          </div>

          <div class="stat-card rated-games">
            <mat-icon>star_rate</mat-icon>
            <div class="stat-info">
              <span class="stat-value">
                {{ this.profile.followers }}
              </span>
              <span class="stat-label">Followers</span>
            </div>
          </div>

          <div class="stat-card play-time">
            <mat-icon>schedule</mat-icon>
            <div class="stat-info">
              <span class="stat-value">
                {{ this.profile.puzzleRush }}
              </span>
              <span class="stat-label">Puzzle Rush</span>
            </div>
          </div>
        </div>

        <mat-divider class="section-divider"></mat-divider>

        <!-- Active Ratings -->
        <div class="ratings-section">
          <h3>Current Ratings</h3>
          <div class="ratings-grid">
            <div
              *ngFor="let rating of getActiveRatings()"
              class="rating-item"
              [class.provisional]="rating.provisional"
            >
              <div class="game-type">{{ rating.name }}</div>
              <div class="rating-value">{{ rating.rating }}</div>
              <div class="games-count">
                {{ rating.games }}
                {{ rating.name === 'Puzzles' ? 'puzzles' : 'games' }}
              </div>
              <mat-icon
                *ngIf="rating.provisional"
                class="provisional-icon"
                matTooltip="Provisional rating"
                >help_outline</mat-icon
              >
            </div>
          </div>
        </div>

        <mat-divider class="section-divider"></mat-divider>

        <!-- Game Analysis Section -->
        <div class="analysis-section">
          <h3>
            <mat-icon>analytics</mat-icon>
            Game Analysis
          </h3>
          <p class="analysis-description">
            Analyze your recent games to get insights into your playing
            patterns, opening preferences, and performance trends.
          </p>

          <div class="games-selection">
            <mat-form-field class="games-input">
              <mat-label>Enter Month :</mat-label>
              <mat-select
                [(ngModel)]="month"
                (selectionChange)="onMonthChange()"
              >
                <mat-option *ngFor="let m of months" [value]="m">
                  {{ getMonthName(m) }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="games-input">
              <mat-label>Enter Year:</mat-label>

              <mat-select [(ngModel)]="year" (selectionChange)="onYearChange()">
                <mat-option *ngFor="let y of years" [value]="y">
                  {{ y }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </mat-card-content>
      <div class="inline-validator">
        <!-- Status display -->
        <div *ngIf="isChecking">Checking...</div>

        <div *ngIf="!isChecking && isSynced" class="synced">
          ✓ games from month : {{ month }} and year : {{ year }} already synced
        </div>

        <div *ngIf="!isChecking && !isSynced" class="not-synced">
          Ready to sync
        </div>
      </div>
      <!-- Actions -->
      <mat-card-actions class="profile-actions">
        <button mat-stroked-button color="primary" (click)="viewOnChesscom()">
          <mat-icon>open_in_new</mat-icon>
          View on Chesscom
        </button>
        <button mat-raised-button color="warn" (click)="onDeleteButtonClick()">
          <mat-icon>delete</mat-icon>
          Delete Synced Games
        </button>
        <button mat-raised-button color="accent" (click)="startAnalysis()">
          <mat-icon>analytics</mat-icon>
          Sync Games
        </button>
      </mat-card-actions>
    </mat-card>

    <!-- Loading state -->
    <div *ngIf="isAnalyzing" class="loading-section">
      <mat-card class="loading-card">
        <mat-card-content>
          <div class="loading-content">
            <mat-spinner diameter="40"></mat-spinner>
            <h4>Syncing Games...</h4>
            <p>Please wait while we sync games from Chesscom.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  </div>`,
  styleUrl: '/src/app/styles/chesscom-profile.component.css',
})
export class ChesscomProfileComponent {
  isChecking: boolean = false;
  isSynced: boolean = false;
  @Input() profile!: ChesscomProfile;
  @Output() analyzeGames = new EventEmitter<ChesscomGameAnalysisRequest>();
  isAnalyzing: boolean = false;
  syncResponse: any | null;
  month: number = new Date().getMonth() > 1 ? new Date().getMonth() - 1 : 12;
  year: number = new Date().getFullYear();
  private _snackBar = inject(MatSnackBar);
  private monthChange$ = new Subject<number>();
  private yearChange$ = new Subject<number>();
  private destroy$ = new Subject<void>();
  months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  years: number[] | undefined;

  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('default', {
      month: 'long',
    });
  }

  constructor(
    private syncStatusService: ChesscomSyncService,
    private profileService: LichessProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentYear: number = new Date().getFullYear();
    const startYear: number = new Date(
      this.profile?.joined * 1000
    ).getFullYear();
    this.years = Array.from(
      { length: currentYear - startYear + 1 },
      (_, i) => currentYear - i
    );

    this.setupReactiveValidation();
    this.checkSync();
  }

  onMonthChange(): void {
    this.monthChange$.next(this.month);
  }

  onYearChange(): void {
    this.yearChange$.next(this.year);
  }

  private setupReactiveValidation(): void {
    merge(this.monthChange$, this.yearChange$)
      .pipe(debounceTime(1000), takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkSync();
      });
  }

  checkSync() {
    this.isChecking = true;

    this.syncStatusService
      .isSynced(this.profile.userId, this.year, this.month)
      .subscribe({
        next: (status) => {
          if (status === null) {
            this.isSynced = false;
          } else {
            this.isSynced = true;
          }
          this.isChecking = false;
        },
        error: () => {
          this.isChecking = false;
          this.isSynced = false;
        },
      });
  }

  getJoinDate() {
    if (!this.profile.joined) return 'Unknown';
    return new Date(this.profile.joined * 1000).getFullYear().toString();
  }

  getGamesCount() {
    return (
      this.profile.totalGamesBlitz +
      this.profile.totalGamesBullet +
      this.profile.totalGamesClassical +
      this.profile.totalGamesRapid
    );
  }

  isOnline(): boolean {
    if (!this.profile.last_online) return false;
    const lastSeen = new Date(this.profile.last_online);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  }

  getActiveRatings(): any[] {
    const gameTypes = [
      {
        name: 'Bullet',
        ratingKey: 'bulletRating',
        gamesKey: 'totalGamesBullet',
      },
      { name: 'Blitz', ratingKey: 'blitzRating', gamesKey: 'totalGamesBlitz' },
      { name: 'Rapid', ratingKey: 'rapidRating', gamesKey: 'totalGamesRapid' },
      {
        name: 'Classical',
        ratingKey: 'classicRating',
        gamesKey: 'totalGamesClassical',
      },
      { name: 'Puzzles', ratingKey: 'puzzleRating', gamesKey: null }, // puzzles might not have a totalGames field
    ];

    return gameTypes
      .map((g) => ({
        name: g.name,
        rating: this.profile[g.ratingKey as keyof ChesscomProfile] as number,
        games: g.gamesKey
          ? (this.profile[g.gamesKey as keyof ChesscomProfile] as number)
          : 0,
      }))
      .filter((entry) => entry.rating > 0 && entry.games >= 0)
      .sort((a, b) => b.games - a.games);
  }

  viewOnChesscom() {
    window.open(this.profile.url, '_blank');
  }
  deleteUserData(username: string) {
    this.profileService.deleteUserAndSyncedGames(username).subscribe({
      next: (response) => {
        console.log('Delete Response: ', response);
        const dialogRef = this._snackBar.open(
          `All previous ${response.deletedItems.games} synced games have been deleted successfully!`,
          'Close',
          {
            duration: 3600,
            panelClass: ['success-snackbar'],
          }
        );
        dialogRef.afterDismissed().subscribe(() => {
          location.reload();
        });
      },
      error: (error) => {
        this._snackBar.open(
          'Failed to delete data. Please try again.',
          'Close',
          {
            duration: 3000,
            panelClass: ['error-snackbar'],
          }
        );
        console.error('Delete error:', error);
      },
    });
  }

  onDeleteButtonClick() {
    const dialogRef = this._snackBar.open(
      'Are you sure you wanna delete all saved games?',
      'Yes'
    );

    dialogRef.onAction().subscribe(() => {
      this.deleteUserData(this.profile.userId);
    });
  }

  startAnalysis() {
    this.isAnalyzing = true;
    this.syncResponse = null;

    this.syncStatusService
      .syncGamesOfMonth(this.profile.userId, this.year, this.month)
      .subscribe({
        next: (response) => {
          console.log('Sync successful:', response);
          this.syncResponse = response;
          this.isAnalyzing = false;

          this.analyzeGames.emit({
            username: this.profile.userId,
            year: this.year.toString(),
            month: this.month.toString(),
          });
          this.onNavigateToAnalyisPage();
        },
        error: (error) => {
          console.error('Sync failed:', error);
          this.isAnalyzing = false;
        },
      });
  }

  onNavigateToAnalyisPage() {
    this.router.navigate(['/analysis', this.profile.userId], {
      state: {
        profile: this.profile,
        analysisRequest: {
          username: this.profile.userId,
          gamesCount: this.getGamesCount(),
        },
      },
    });
  }
}
