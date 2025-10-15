import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { LichessSearchService } from '../services/lichess-search.service';
import {
  GameAnalysisRequest,
  LichessProfile,
  LichessProfileComponent,
} from './lichess-profile.component';
import { ChesscomProfile } from './chesscom-profile.component';
import { MatRadioModule } from '@angular/material/radio';
import { Router } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LichessSyncService } from '../services/lichess-sync.service';
import { ActivatedRoute } from '@angular/router';
import { ChesscomSearchService } from '../services/chesscom-search.service';
import {
  ChesscomGameAnalysisRequest,
  ChesscomProfileComponent,
} from './chesscom-profile.component';

export interface SyncStatus {
  lastSync: string;
  lastLocalGameDate: string;
  gamesSynced: number;
  syncUpToDate: boolean;
  username: string;
}

@Component({
  selector: 'app-landing-page',
  template: `
    <div class="app-container">
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

      <div class="hero-section">
        <h1 class="hero-title">Chess Insights. Instantly*</h1>
        <p class="hero-sub-p">
          *Well you do have to wait a bit... Actually it's not instant at all
        </p>

        <form class="search-form" (ngSubmit)="onSearch()" autocomplete="off">
          <mat-form-field appearance="fill" class="search-field">
            <mat-label>Search {{ selectedPlatform }} Username</mat-label>
            <input
              matInput
              [(ngModel)]="searchText"
              name="searchText"
              type="search"
              placeholder=""
              [disabled]="isLoading"
            />
            <button
              matSuffix
              mat-icon-button
              aria-label="Search"
              type="submit"
              [disabled]="isLoading"
            >
              @if (isLoading) {
              <mat-spinner diameter="20"></mat-spinner>
              } @else {
              <mat-icon>search</mat-icon>
              }
            </button>
          </mat-form-field>
        </form>
        <label id="example-radio-group-label"
          >Pick the platform you want to search in.</label
        >
        <mat-radio-group
          aria-labelledby="example-radio-group-label"
          class="example-radio-group"
          [(ngModel)]="selectedPlatform"
          (change)="onPlatformChange()"
        >
          <mat-radio-button value="Lichess">Lichess</mat-radio-button>
          <mat-radio-button value="Chesscom">Chess.com</mat-radio-button>
        </mat-radio-group>

        <!-- Error message -->
        @if (errorMessage) {
        <div class="error-message">
          <mat-icon class="error-icon">error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
        }

        <!-- Profile Display -->
        @if (profileData) {
        <div class="profile-section">
          <app-lichess-profile
            (analyzeGames)="getCurrentAnalysisRequest($event)"
            [profile]="profileData"
            [syncStatus]="syncStatus"
          ></app-lichess-profile>
        </div>
        }

        <!-- Chesscom Profile Display -->
        @if(chesscomProfileData) {
        <div class="profile-section">
          <app-chesscom-profile
            (analyzeGames)="getCurrentChesscomAnalysisRequest($event)"
            [profile]="chesscomProfileData"
          ></app-chesscom-profile>
        </div>
        }
      </div>
    </div>
  `,
  styleUrl: '/src/app/styles/landing-page.component.css',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    LichessProfileComponent,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    ChesscomProfileComponent,
  ],
  standalone: true,
})
export class LandingPageComponent {
  selectedPlatform: string = 'Lichess';
  constructor(
    private lichessSearchService: LichessSearchService,
    private router: Router,
    private syncStatusService: LichessSyncService,
    private route: ActivatedRoute,
    private chesscomSearchService: ChesscomSearchService
  ) {}
  @Output() usernameChange = new EventEmitter<string>();
  searchText: string = '';
  chesscomProfileData: ChesscomProfile | null = null;
  profileData: LichessProfile | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  currentAnalysisRequest:
    | GameAnalysisRequest
    | ChesscomGameAnalysisRequest
    | null = null;
  syncStatus: SyncStatus | null = null;
  isSyncStatusLoading: boolean = false;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const username = params['username'];
      if (username) {
        this.searchText = username;
        this.route.queryParams.subscribe((queryParams) => {
          this.selectedPlatform = queryParams['platform'] || 'Lichess';
          this.performSearch(username);
        });
      }
    });

    this.route.paramMap.subscribe((params) => {
      const platform = params.get('platform');
      if (platform) {
        this.selectedPlatform = platform;
      } else {
        this.selectedPlatform = 'Lichess';
      }
    });
  }

  onSearch() {
    if (!this.searchText.trim()) return;

    this.router.navigate(
      ['/profile', this.searchText.trim(), this.selectedPlatform],
      {
        queryParams: { platform: this.selectedPlatform },
      }
    );
  }

  onPlatformChange(): void {
    if (this.router.url !== '/') {
      this.router.navigate(['/', this.selectedPlatform]);
    }
    this.clearAllData();
  }

  private clearAllData(): void {
    this.profileData = null;
    this.chesscomProfileData = null;
    this.errorMessage = '';
    this.syncStatus = null;
    this.currentAnalysisRequest = null;
  }

  private performSearch(username: string): void {
    this.isLoading = true;
    this.clearAllData();
    console.log('platform ', this.selectedPlatform);
    if (this.selectedPlatform === 'Lichess') {
      console.log('Searching lichess for:', username);
      this.loadLichessSyncStatus(username);

      this.lichessSearchService.searchLichess(username).subscribe({
        next: (response) => {
          console.log('Lichess profile:', response);
          this.profileData = response;
          this.isLoading = false;
          this.usernameChange.emit(username);
        },
        error: (error) => {
          console.error('Failed to get Lichess Profile: ', error);
          this.errorMessage =
            'User not found or there was an error fetching the profile. Please try again.';
          this.isLoading = false;
          this.profileData = null;
        },
      });
    } else if (this.selectedPlatform === 'Chesscom') {
      console.log('Searching chesscom for:', username);
      this.chesscomSearchService.searchChesscom(username).subscribe({
        next: (response) => {
          console.log('Chesscom Profile :', response);
          this.chesscomProfileData = response;
          this.isLoading = false;
          this.usernameChange.emit(username);
        },
        error: (error) => {
          console.error('Failed to get Chesscom profile: ', error);
          this.errorMessage =
            'User not found or there was an error fetching the profile. Please try again.';
          this.isLoading = false;
          this.profileData = null;
        },
      });
    }
  }

  goBackToProfile(): void {
    this.currentAnalysisRequest = null;
    this.router.navigate(['/']);
  }

  onAnalyzeGames(analysisRequest: GameAnalysisRequest): void {
    console.log('Starting analysis for:', analysisRequest);

    this.router.navigate(['/analysis'], {
      state: {
        profile: this.profileData,
        analysisRequest: analysisRequest,
      },
    });
  }

  onChesscomAnalyzeGames(analysisRequest: ChesscomGameAnalysisRequest): void {
    console.log('Starting chesscom analysis for:', analysisRequest);

    this.router.navigate(['/analysis'], {
      state: {
        profile: this.profileData,
        analysisRequest: analysisRequest,
      },
    });
  }

  getCurrentChesscomAnalysisRequest(
    analyseGameMonth: ChesscomGameAnalysisRequest
  ) {
    this.currentAnalysisRequest = analyseGameMonth;
  }

  getCurrentAnalysisRequest(analyseGames: GameAnalysisRequest) {
    this.currentAnalysisRequest = analyseGames;
    this.onAnalyzeGames(this.currentAnalysisRequest);
  }

  loadLichessSyncStatus(username?: string): void {
    const usernameToSearch = username || this.searchText.trim();
    if (!usernameToSearch) return;

    this.isSyncStatusLoading = true;
    this.syncStatusService.getSyncStatus(usernameToSearch).subscribe({
      next: (status) => {
        this.syncStatus = status;
        this.isSyncStatusLoading = false;
      },
      error: (error) => {
        console.error('Failed to load sync status:', error);
        this.syncStatus = null;
        this.isSyncStatusLoading = false;
      },
    });
  }

  refreshSyncStatus(): void {
    this.loadLichessSyncStatus();
  }

  getFormattedLastSync(): string {
    if (!this.syncStatus?.lastSync) return 'Never';

    const syncDate = new Date(this.syncStatus.lastSync);
    const now = new Date();
    const diffMs = now.getTime() - syncDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  getFormattedGameDate(): string {
    if (!this.syncStatus?.lastLocalGameDate) return 'Unknown';

    const gameDate = new Date(this.syncStatus.lastLocalGameDate);
    return gameDate.toLocaleDateString();
  }
}
