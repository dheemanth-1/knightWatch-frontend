import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
import { combineLatest, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { NavWrapperComponent } from './nav-wrapper.component';

export interface SyncStatus {
  lastSync: string;
  lastLocalGameDate: string;
  gamesSynced: number;
  syncUpToDate: boolean;
  username: string;
}
type Platform = 'Lichess' | 'Chesscom';
@Component({
  selector: 'app-landing-page',
  template: `
    <div class="app-container">
      <app-nav-wrapper />
      <!-- <mat-toolbar>
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
      </mat-toolbar> -->

      <div class="hero-section">
        <h1 class="hero-title">Chess Insights. Instantly*</h1>
        <p class="hero-sub-p">
          *Well you do have to wait a bit... Actually it's not instant at all
        </p>

        <!-- Fixed: Moved form outside or simplified structure -->
        <div class="search-container">
          <mat-form-field appearance="fill" class="search-field">
            <mat-label>Search {{ selectedPlatform }} Username</mat-label>
            <input
              matInput
              [(ngModel)]="searchText"
              name="searchText"
              type="text"
              placeholder="Enter username"
              [disabled]="isLoading"
              (keyup.enter)="onSearch()"
            />
            <button
              matSuffix
              mat-icon-button
              aria-label="Search"
              (click)="onSearch()"
              [disabled]="isLoading || !searchText.trim()"
            >
              @if (isLoading) {
              <mat-spinner diameter="20"></mat-spinner>
              } @else {
              <mat-icon>search</mat-icon>
              }
            </button>
          </mat-form-field>
        </div>

        <!-- <form class="search-form" (ngSubmit)="onSearch()" autocomplete="off">
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
        </form> -->
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
        @if (lichessProfileData) {
        <div class="profile-section">
          <app-lichess-profile
            (analyzeGames)="getCurrentAnalysisRequest($event)"
            [profile]="lichessProfileData"
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
    NavWrapperComponent,
  ],
  standalone: true,
})
export class LandingPageComponent implements OnInit {
  private destroy$ = new Subject<void>();
  selectedPlatform: Platform = 'Lichess';
  private isInitialLoad = true;
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
  lichessProfileData: LichessProfile | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  currentAnalysisRequest:
    | GameAnalysisRequest
    | ChesscomGameAnalysisRequest
    | null = null;
  syncStatus: SyncStatus | null = null;
  isSyncStatusLoading: boolean = false;

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(
          (prev, curr) => prev['username'] === curr['username']
        )
      )
      .subscribe((params) => {
        const username = params['username'];

        // Get platform from query params
        this.route.queryParams
          .pipe(takeUntil(this.destroy$))
          .subscribe((queryParams) => {
            const platformFromQuery = queryParams['platform'] as Platform;

            // Only update platform if it's explicitly set or if it's initial load
            if (
              platformFromQuery &&
              ['Lichess', 'Chesscom'].includes(platformFromQuery)
            ) {
              this.selectedPlatform = platformFromQuery;
            } else if (this.isInitialLoad) {
              // Only set default on initial load, not on subsequent navigations
              this.selectedPlatform = 'Lichess';
            }

            console.log('Current platform:', this.selectedPlatform);

            // Perform search if username exists
            if (username && username.trim()) {
              this.searchText = username;
              this.performSearch(username);
            } else {
              // No username in route, just update UI state
              this.clearAllData();
            }

            this.isInitialLoad = false;
          });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch() {
    if (!this.searchText.trim()) return;
    const trimmedUsername = this.searchText.trim();
    console.log('Searching:', trimmedUsername, 'on', this.selectedPlatform);

    // Navigate with both username and platform
    this.router.navigate(['/profile', trimmedUsername], {
      queryParams: { platform: this.selectedPlatform },
      // Don't use queryParamsHandling to ensure clean state
    });
  }

  onPlatformChange(): void {
    console.log('Platform changed to:', this.selectedPlatform);
    const currentUsername = this.searchText.trim();

    if (currentUsername) {
      // If there's a username, navigate with new platform
      this.router.navigate(['/profile', currentUsername], {
        queryParams: { platform: this.selectedPlatform },
      });
    } else {
      // No username, just update query params
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { platform: this.selectedPlatform },
        queryParamsHandling: 'merge',
      });
      this.clearAllData();
    }
  }

  private clearAllData(): void {
    this.lichessProfileData = null;
    this.chesscomProfileData = null;
    this.errorMessage = '';
    this.syncStatus = null;
    this.currentAnalysisRequest = null;
  }

  private performSearch(username: string): void {
    if (this.isLoading) {
      console.log('Search already in progress, skipping...');
      return;
    }

    this.isLoading = true;
    this.clearAllData();

    if (this.selectedPlatform === 'Lichess') {
      this.loadLichessSyncStatus(username);

      this.lichessSearchService.searchLichess(username).subscribe({
        next: (response) => {
          console.log('Lichess profile:', response);
          this.lichessProfileData = response;
          this.isLoading = false;
          this.usernameChange.emit(username);
        },
        error: (error) => {
          console.error('Failed to get Lichess Profile: ', error);
          this.errorMessage =
            'User not found or there was an error fetching the profile. Please try again.';
          this.isLoading = false;
          this.lichessProfileData = null;
        },
      });
    } else if (this.selectedPlatform === 'Chesscom') {
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
          this.lichessProfileData = null;
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
        profile: this.lichessProfileData,
        analysisRequest: analysisRequest,
      },
    });
  }

  onChesscomAnalyzeGames(analysisRequest: ChesscomGameAnalysisRequest): void {
    console.log('Starting chesscom analysis for:', analysisRequest);

    this.router.navigate(['/analysis'], {
      state: {
        profile: this.chesscomProfileData,
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
    this.syncStatusService
      .getSyncStatus(usernameToSearch)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
