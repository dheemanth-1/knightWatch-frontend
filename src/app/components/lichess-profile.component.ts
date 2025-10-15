import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
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
import {
  LichessSyncService,
  SyncResponse,
} from '../services/lichess-sync.service';
import { ProfileService } from '../services/profile.service';
import { SyncStatus } from './landing-page.component';
import { Router } from '@angular/router';

export interface LichessProfile {
  common: {
    id: string;
    title: {
      present: boolean;
    };
    name: string;
    patron: boolean;
    flair: {
      present: boolean;
    };
  };
  profile: {
    properties: any;
  };
  stats: {
    ratings: {
      [key: string]: {
        games: number;
        rating: number;
        rd: number;
        prog: number;
        prov: boolean;
      };
    };
    counts: {
      all: number;
      rated: number;
      ai: number;
      draw: number;
      drawH: number;
      loss: number;
      lossH: number;
      win: number;
      winH: number;
      bookmark: number;
      playing: number;
      imported: number;
      me: number;
    };
  };
  times: {
    created: string;
    seen: string;
    played: string;
    featured: string;
  };
  flags: {
    tosViolation: boolean;
    disabled: boolean;
    verified: boolean;
    streaming: boolean;
  };
  url: string;
}

export interface GameAnalysisRequest {
  username: string;
  gamesCount: number;
}

@Component({
  selector: 'app-lichess-profile',
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
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <!-- Header Section -->
        <mat-card-header class="profile-header">
          <div mat-card-avatar class="profile-avatar">
            <mat-icon class="avatar-icon">person</mat-icon>
          </div>
          <mat-card-title class="profile-title">
            <span>{{ profile.common.name }}</span>
            <mat-chip-set class="status-chips">
              @if(isOnline()) {
              <mat-chip color="accent" selected>
                <mat-icon matChipAvatar>fiber_manual_record</mat-icon>
                Online
              </mat-chip>
              } @if(profile.common.patron) {
              <mat-chip color="warn" selected>
                <mat-icon matChipAvatar>star</mat-icon>
                Patron
              </mat-chip>
              } @if(profile.flags.verified) {
              <mat-chip color="primary" selected>
                <mat-icon matChipAvatar>verified</mat-icon>
                Verified
              </mat-chip>
              }
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
                <span class="stat-value">{{
                  profile.stats.counts.all | number
                }}</span>
                <span class="stat-label">Total Games</span>
              </div>
            </div>

            <div class="stat-card rated-games">
              <mat-icon>star_rate</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{
                  profile.stats.counts.rated | number
                }}</span>
                <span class="stat-label">Rated Games</span>
              </div>
            </div>

            <div class="stat-card play-time">
              <mat-icon>schedule</mat-icon>
              <div class="stat-info">
                <span class="stat-value">{{ getPlayTimeFormatted() }}</span>
                <span class="stat-label">Play Time</span>
              </div>
            </div>
          </div>

          <mat-divider class="section-divider"></mat-divider>

          <!-- Active Ratings -->
          <div class="ratings-section">
            <h3>Current Ratings</h3>
            <div class="ratings-grid">
              @for (rating of getActiveRatings(); track rating.name) {
              <div class="rating-item" [class.provisional]="rating.provisional">
                <div class="game-type">{{ rating.name }}</div>
                <div class="rating-value">{{ rating.rating }}</div>
                <div class="games-count">
                  {{ rating.games }}
                  {{ rating.name === 'Puzzles' ? 'puzzles' : 'games' }}
                </div>
                @if(rating.provisional) {
                <mat-icon
                  class="provisional-icon"
                  matTooltip="Provisional rating"
                  >help_outline</mat-icon
                >
                }
              </div>
              }
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
              <mat-form-field appearance="outline" class="games-input">
                <mat-label>Number of games to analyze</mat-label>
                <input
                  matInput
                  type="number"
                  [(ngModel)]="selectedGamesCount"
                  [min]="1"
                  [max]="profile.stats.counts.rated"
                  placeholder="Enter number of games"
                />
                <mat-hint
                  >Maximum: {{ profile.stats.counts.rated }} rated
                  games</mat-hint
                >
              </mat-form-field>
            </div>
          </div>
          @if(!syncStatus?.lastSync && syncStatus?.gamesSynced === 0) {
          <p class="sync-update">No privous sync found.</p>
          } @if((syncStatus?.lastSync ?? false) && (syncStatus?.gamesSynced ??
          0) > 0) {
          <p class="sync-update">
            {{ syncStatus?.gamesSynced ?? 0 }} games already synced.
          </p>
          }
        </mat-card-content>

        <!-- Actions -->
        <mat-card-actions class="profile-actions">
          <button mat-stroked-button color="primary" (click)="viewOnLichess()">
            <mat-icon>open_in_new</mat-icon>
            View on Lichess
          </button>
          <button
            mat-raised-button
            color="warn"
            (click)="onDeleteButtonClick()"
          >
            <mat-icon>delete</mat-icon>
            Delete Synced Games
          </button>
          <button
            mat-raised-button
            color="accent"
            (click)="startAnalysis()"
            [disabled]="
              !selectedGamesCount ||
              selectedGamesCount < 1 ||
              selectedGamesCount > profile.stats.counts.rated
            "
          >
            <mat-icon>analytics</mat-icon>
            {{
              isAnalyzing
                ? 'Syncing...'
                : (syncStatus?.gamesSynced ?? 0) >= (selectedGamesCount || 0)
                ? 'Show ' + (syncStatus?.gamesSynced ?? 0) + ' Games'
                : 'Sync ' +
                  ((selectedGamesCount || 0) - (syncStatus?.gamesSynced ?? 0)) +
                  ' Games'
            }}
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Loading state -->
      @if(isAnalyzing) {
      <div class="loading-section">
        <mat-card class="loading-card">
          <mat-card-content>
            <div class="loading-content">
              <mat-spinner diameter="40"></mat-spinner>
              <h4>Syncing Games...</h4>
              <p>
                Please wait while we sync {{ selectedGamesCount }} games from
                Lichess.
              </p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      }
    </div>
  `,
  styleUrl: '/src/app/styles/profile.component.css',
})
export class LichessProfileComponent {
  private _snackBar = inject(MatSnackBar);
  @Input() profile!: LichessProfile;
  @Input() syncStatus!: SyncStatus | null;
  @Output() analyzeGames = new EventEmitter<GameAnalysisRequest>();
  constructor(
    private lichessSyncService: LichessSyncService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  selectedGamesCount: number = 10;
  Math = Math;
  isAnalyzing: boolean = false;
  syncResponse: SyncResponse | null = null;

  getJoinDate(): string {
    if (!this.profile.times.created) return 'Unknown';
    return new Date(this.profile.times.created).getFullYear().toString();
  }

  isOnline(): boolean {
    if (!this.profile.times.seen) return false;
    const lastSeen = new Date(this.profile.times.seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  }

  getPlayTimeFormatted(): string {
    if (!this.profile.times.played) return '0h';

    // Parse ISO 8601 duration (PT72H59M57S)
    const duration = this.profile.times.played;
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!matches) return '0h';

    const hours = parseInt(matches[1] || '0');
    const minutes = parseInt(matches[2] || '0');

    if (hours === 0) {
      return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
  }

  getActiveRatings(): any[] {
    const gameTypeNames: { [key: string]: string } = {
      bullet: 'Bullet',
      blitz: 'Blitz',
      rapid: 'Rapid',
      classical: 'Classical',
      correspondence: 'Correspondence',
      puzzle: 'Puzzles',
    };

    return Object.entries(this.profile.stats.ratings)
      .filter(([_, rating]) => rating.games > 0)
      .map(([key, rating]) => ({
        name: gameTypeNames[key] || key.charAt(0).toUpperCase() + key.slice(1),
        rating: rating.rating,
        games: rating.games,
        provisional: rating.prov,
      }))
      .sort((a, b) => b.games - a.games);
  }

  getQuickSelectOptions(): number[] {
    const maxGames = this.profile.stats.counts.rated;
    const options = [5, 10, 25, 50];

    return options.filter((option) => option <= maxGames);
  }

  viewOnLichess(): void {
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
          console.log('does this even run');
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
      this.deleteUserData(this.profile.common.name);
    });
  }

  startAnalysis(): void {
    if (
      this.selectedGamesCount > 0 &&
      this.selectedGamesCount <= this.profile.stats.counts.rated
    ) {
      this.isAnalyzing = true;
      this.syncResponse = null;

      this.lichessSyncService
        .syncGames(this.profile.common.name, this.selectedGamesCount)
        .subscribe({
          next: (response) => {
            console.log('Sync successful:', response);
            this.syncResponse = response;
            this.isAnalyzing = false;

            this.analyzeGames.emit({
              username: this.profile.common.name,
              gamesCount: this.selectedGamesCount,
            });
            this.onNavigateToAnalyisPage();
          },
          error: (error) => {
            console.error('Sync failed:', error);
            this.isAnalyzing = false;
          },
        });
    }
  }

  onNavigateToAnalyisPage(): void {
    this.router.navigate(['/analysis', this.profile.common.name], {
      state: {
        profile: this.profile,
        analysisRequest: {
          username: this.profile.common.name,
          gamesCount: this.selectedGamesCount,
        },
      },
    });
  }
}
