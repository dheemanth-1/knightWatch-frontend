import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  GameAnalysisRequest,
  LichessProfile,
} from './lichess-profile.component';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GameStatsService,
  OpeningStats,
  OverallStats,
} from '../services/game-stats.service';
import { Location } from '@angular/common';
import { ChesscomProfile } from './chesscom-profile.component';
import { NavWrapperComponent } from './nav-wrapper.component';

@Component({
  selector: 'app-game-analysis',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    NavWrapperComponent,
  ],
  template: `
    <div class="analysis-section">
      <app-nav-wrapper />
      <div class="back-button-container">
        <button
          mat-raised-button
          class="back-button"
          (click)="goBackToProfile()"
        >
          <mat-icon>arrow_back</mat-icon>
          Back to Profile
        </button>
      </div>
      <div class="analysis-container">
        <mat-card class="analysis-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>analytics</mat-icon>
              Analysis for {{ analysisRequest?.username || 'User' }}
            </mat-card-title>
            <mat-card-subtitle class="subtitle">
              {{ analysisRequest?.gamesCount || 0 }} games
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <!-- Navigation Tabs -->
            <div class="analysis-nav">
              <button
                mat-button
                [color]="selectedView === 'overview' ? 'primary' : ''"
                [class.active]="selectedView === 'overview'"
                (click)="showOverview()"
              >
                <mat-icon>dashboard</mat-icon>
                Overview
              </button>
              <button
                mat-button
                [color]="selectedView === 'overall' ? 'primary' : ''"
                [class.active]="selectedView === 'overall'"
                (click)="loadOverallStats()"
              >
                <mat-icon>bar_chart</mat-icon>
                Overall Stats
              </button>
              <button
                mat-button
                [color]="selectedView === 'openings' ? 'primary' : ''"
                [class.active]="selectedView === 'openings'"
                (click)="loadOpeningStats()"
              >
                <mat-icon>auto_stories</mat-icon>
                Opening Stats
              </button>
            </div>

            <mat-divider></mat-divider>

            <!-- Overview Section (Original Content) -->
            @if(selectedView === 'overview') {
            <div class="overview-section">
              <!-- Performance Overview -->
              <div class="performance-section">
                <h3>Game Performance Overview</h3>
                <div class="performance-grid">
                  <div class="performance-card win">
                    <mat-icon>thumb_up</mat-icon>
                    <div class="performance-info">
                      <span class="performance-value">{{
                        getNumOfWins() | number
                      }}</span>
                      <span class="performance-label">Wins</span>
                      <span class="performance-percentage"
                        >{{ overallStats?.winRate }}%</span
                      >
                    </div>
                  </div>

                  <div class="performance-card draw">
                    <mat-icon>remove</mat-icon>
                    <div class="performance-info">
                      <span class="performance-value">{{
                        getNumOfDraws() | number
                      }}</span>
                      <span class="performance-label">Draws</span>
                      <span class="performance-percentage"
                        >{{ overallStats?.drawRate }}%</span
                      >
                    </div>
                  </div>

                  <div class="performance-card loss">
                    <mat-icon>thumb_down</mat-icon>
                    <div class="performance-info">
                      <span class="performance-value">{{
                        getNumOfLosses() | number
                      }}</span>
                      <span class="performance-label">Losses</span>
                      <span class="performance-percentage"
                        >{{ overallStats?.lossRate }}%</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Win Rate Progress Bar -->
                <div class="win-rate-section">
                  <div class="win-rate-header">
                    <span>Overall Win Rate</span>
                    <span class="win-rate-value"
                      >{{ overallStats?.winRate }}%</span
                    >
                  </div>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="overallStats?.winRate"
                    color="primary"
                  >
                  </mat-progress-bar>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Detailed Ratings -->
              <div class="detailed-ratings">
                <h3>Rating Breakdown</h3>
                <div class="ratings-detailed-grid">
                  @for(rating of getDetailedRatings(); track rating.name) {
                  <div class="detailed-rating-card">
                    <div class="rating-header">
                      <span class="rating-name">{{ rating.name }}</span>
                      <mat-chip
                        [color]="rating.games > 0 ? 'primary' : 'basic'"
                        selected
                      >
                        {{ rating.games }} games
                      </mat-chip>
                    </div>
                    <div class="rating-value">{{ rating.rating }}</div>
                    <div class="rating-details">
                      <span>RD: {{ rating.rd }}</span>
                      @if(rating.provisional) {
                      <span class="provisional-text">Provisional</span>
                      }
                    </div>
                  </div>
                  }
                </div>
              </div>
            </div>
            }
            <!-- Overall Stats Section -->
            @if(selectedView === 'overall') {
            <div class="overall-stats-section">
              @if(isLoadingOverall) {
              <div class="loading-section">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Loading overall statistics...</p>
              </div>
              } @if(!isLoadingOverall && overallStats) {
              <div class="stats-content">
                <h3>Detailed Overall Statistics</h3>

                <!-- Enhanced Performance Cards -->
                <div class="enhanced-performance-grid">
                  <div class="enhanced-performance-card games-count">
                    <div class="card-icon">
                      <mat-icon>sports_esports</mat-icon>
                    </div>
                    <div class="card-content">
                      <span class="card-value">{{
                        overallStats.numberOfGames | number
                      }}</span>
                      <span class="card-label">Total Games</span>
                    </div>
                  </div>

                  <div class="enhanced-performance-card win-rate">
                    <div class="card-icon">
                      <mat-icon>trending_up</mat-icon>
                    </div>
                    <div class="card-content">
                      <span class="card-value"
                        >{{ overallStats.winRate | number : '1.1-1' }}%</span
                      >
                      <span class="card-label">Win Rate</span>
                    </div>
                  </div>

                  <div class="enhanced-performance-card loss-rate">
                    <div class="card-icon">
                      <mat-icon>trending_down</mat-icon>
                    </div>
                    <div class="card-content">
                      <span class="card-value"
                        >{{ overallStats.lossRate | number : '1.1-1' }}%</span
                      >
                      <span class="card-label">Loss Rate</span>
                    </div>
                  </div>

                  <div class="enhanced-performance-card draw-rate">
                    <div class="card-icon">
                      <mat-icon>timeline</mat-icon>
                    </div>
                    <div class="card-content">
                      <span class="card-value"
                        >{{ overallStats.drawRate | number : '1.1-1' }}%</span
                      >
                      <span class="card-label">Draw Rate</span>
                    </div>
                  </div>
                </div>

                <!-- Performance Comparison Chart -->
                <div class="performance-comparison">
                  <h4>Performance Breakdown</h4>
                  <div class="comparison-bars">
                    <div class="comparison-item">
                      <span class="comparison-label">Wins</span>
                      <div class="comparison-bar-container">
                        <mat-progress-bar
                          mode="determinate"
                          [value]="overallStats.winRate"
                          color="primary"
                        >
                        </mat-progress-bar>
                      </div>
                      <span class="comparison-value"
                        >{{ overallStats.winRate | number : '1.1-1' }}%</span
                      >
                    </div>

                    <div class="comparison-item">
                      <span class="comparison-label">Draws</span>
                      <div class="comparison-bar-container">
                        <mat-progress-bar
                          mode="determinate"
                          [value]="overallStats.drawRate"
                          color="accent"
                        >
                        </mat-progress-bar>
                      </div>
                      <span class="comparison-value"
                        >{{ overallStats.drawRate | number : '1.1-1' }}%</span
                      >
                    </div>

                    <div class="comparison-item">
                      <span class="comparison-label">Losses</span>
                      <div class="comparison-bar-container">
                        <mat-progress-bar
                          mode="determinate"
                          [value]="overallStats.lossRate"
                          color="warn"
                        >
                        </mat-progress-bar>
                      </div>
                      <span class="comparison-value"
                        >{{ overallStats.lossRate | number : '1.1-1' }}%</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              }
            </div>
            }
            <!-- Opening Stats Section -->
            @if(selectedView === 'openings') {
            <div class="opening-stats-section">
              @if(isLoadingOpenings) {
              <div class="loading-section">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Loading opening statistics...</p>
              </div>
              } @if(!isLoadingOpenings && openingStats.length > 0) {
              <div class="openings-content">
                <h3>Opening Performance Analysis</h3>

                <div class="openings-grid">
                  @for(opening of openingStats; track opening.openingName) {
                  <div class="opening-card">
                    <div class="opening-header">
                      <h4 class="opening-name">{{ opening.openingName }}</h4>
                      <mat-chip color="primary" selected>
                        {{
                          opening.numWins + opening.numLosses + opening.numDraws
                        }}
                        games
                      </mat-chip>
                    </div>

                    <div class="opening-stats">
                      <div class="opening-stat win">
                        <mat-icon>thumb_up</mat-icon>
                        <div class="stat-info">
                          <span class="stat-count">{{ opening.numWins }}</span>
                          <span class="stat-percentage"
                            >{{ opening.winRate | number : '1.1-1' }}%</span
                          >
                          <span class="stat-label">Wins</span>
                        </div>
                      </div>

                      <div class="opening-stat draw">
                        <mat-icon>remove</mat-icon>
                        <div class="stat-info">
                          <span class="stat-count">{{ opening.numDraws }}</span>
                          <span class="stat-percentage"
                            >{{ opening.drawRate | number : '1.1-1' }}%</span
                          >
                          <span class="stat-label">Draws</span>
                        </div>
                      </div>

                      <div class="opening-stat loss">
                        <mat-icon>thumb_down</mat-icon>
                        <div class="stat-info">
                          <span class="stat-count">{{
                            opening.numLosses
                          }}</span>
                          <span class="stat-percentage"
                            >{{ opening.lossRate | number : '1.1-1' }}%</span
                          >
                          <span class="stat-label">Losses</span>
                        </div>
                      </div>
                    </div>

                    <!-- Opening Win Rate Bar -->
                    <div class="opening-win-rate">
                      <div class="win-rate-header">
                        <span>Success Rate</span>
                        <span class="win-rate-value"
                          >{{ opening.winRate | number : '1.1-1' }}%</span
                        >
                      </div>
                      <mat-progress-bar
                        mode="determinate"
                        [value]="opening.winRate"
                        [color]="
                          opening.winRate > 50
                            ? 'primary'
                            : opening.winRate > 30
                            ? 'accent'
                            : 'warn'
                        "
                      >
                      </mat-progress-bar>
                    </div>
                  </div>
                  }
                </div>
              </div>
              } @if(!isLoadingOpenings && openingStats.length === 0) {
              <div class="no-data">
                <mat-icon>info</mat-icon>
                <p>No opening statistics available.</p>
              </div>
              }
            </div>
            }
          </mat-card-content>

          <mat-card-actions class="action-button-container">
            <button mat-raised-button color="primary">
              <mat-icon>get_app</mat-icon>
              Download Report
            </button>
            <button mat-raised-button color="primary">
              <mat-icon>share</mat-icon>
              Share Analysis
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styleUrl: '/src/app/styles/game-analysis.component.css',
})
export class GameAnalysisComponent implements OnInit {
  @Input() profile!: LichessProfile | ChesscomProfile;
  @Input() analysisRequest!: GameAnalysisRequest | null;
  isLoadingOverall: boolean = false;
  isLoadingOpenings: boolean = false;
  overallStats: OverallStats | null = null;
  openingStats: OpeningStats[] = [];
  selectedView: 'overview' | 'overall' | 'openings' = 'overview';
  constructor(
    private router: Router,
    private gameStatsService: GameStatsService,
    private location: Location,
    private route: ActivatedRoute
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.profile = navigation.extras.state['profile'];
      this.analysisRequest = navigation.extras.state['analysisRequest'];
    }
  }

  loadOverallStats(): void {
    let source;
    if ('common' in this.profile) {
      source = 'lichess';
    } else {
      source = 'chesscom';
    }
    this.isLoadingOverall = true;
    this.selectedView = 'overall';
    let username;
    if ('common' in this.profile) {
      username = this.profile.common.id;
    } else {
      username = (this.profile as ChesscomProfile).userId;
    }
    this.gameStatsService.getOverallStats(username, source).subscribe({
      next: (stats) => {
        this.overallStats = {
          ...stats,
          winRate: stats.winRate * 100,
          lossRate: stats.lossRate * 100,
          drawRate: stats.drawRate * 100,
        };
        this.isLoadingOverall = false;
      },
      error: (error) => {
        console.error('Failed to load overall stats:', error);
        this.isLoadingOverall = false;
      },
    });
  }

  loadOpeningStats(): void {
    let source;
    if ('common' in this.profile) {
      source = 'lichess';
    } else {
      source = 'chesscom';
    }
    this.isLoadingOpenings = true;
    this.selectedView = 'openings';
    let username;
    if ('common' in this.profile) {
      username = this.profile.common.id;
    } else {
      username = (this.profile as ChesscomProfile).userId;
    }
    this.gameStatsService.getOpeningStats(username, source).subscribe({
      next: (stats) => {
        this.openingStats = stats
          .map((stat) => ({
            ...stat,
            winRate: stat.winRate * 100,
            lossRate: stat.lossRate * 100,
            drawRate: stat.drawRate * 100,
          }))
          .sort((a, b) => {
            const totalA = a.numWins + a.numLosses + a.numDraws;
            const totalB = b.numWins + b.numLosses + b.numDraws;
            return totalB - totalA; // descending order
          });
        this.isLoadingOpenings = false;
      },
      error: (error) => {
        console.error('Failed to load opening stats:', error);
        this.isLoadingOpenings = false;
      },
    });
  }

  showOverview(): void {
    this.selectedView = 'overview';
  }

  ngOnInit(): void {
    this.loadOverallStats();
    if (!this.profile || !this.analysisRequest) {
      this.router.navigate(['/']);
    }
  }

  goBackToProfile(): void {
    this.location.back();
  }

  getNumOfWins(): number {
    const total = this.overallStats?.numberOfGames;
    const winsPercent = this.overallStats?.winRate;

    if (!total || !winsPercent) return 0;

    return Math.round((winsPercent / 100) * total);
  }

  getNumOfDraws(): number {
    const total = this.overallStats?.numberOfGames;
    const drawsPercent = this.overallStats?.drawRate;

    if (!total || !drawsPercent) return 0;

    return Math.round((drawsPercent / 100) * total);
  }

  getNumOfLosses(): number {
    const total = this.overallStats?.numberOfGames;
    const lossesPercent = this.overallStats?.lossRate;

    if (!total || !lossesPercent) return 0;

    return Math.round((lossesPercent / 100) * total);
  }

  getDetailedRatings(): any[] {
    if (!this.profile) {
      this.router.navigate(['/']);
    }
    if ('common' in this.profile) {
      const gameTypeNames: { [key: string]: string } = {
        bullet: 'Bullet',
        blitz: 'Blitz',
        rapid: 'Rapid',
        classical: 'Classical',
        correspondence: 'Correspondence',
        puzzle: 'Puzzles',
      };

      return Object.entries(this.profile.stats.ratings)
        .map(([key, rating]) => ({
          name:
            gameTypeNames[key] || key.charAt(0).toUpperCase() + key.slice(1),
          rating: rating.rating,
          games: rating.games,
          rd: rating.rd,
          provisional: rating.prov,
        }))
        .sort((a, b) => b.games - a.games);
    }
    const ratings = [
      [
        'bullet',
        {
          rating: this.profile.bulletRating,
          games: this.profile.totalGamesBullet,
        },
      ],
      [
        'blitz',
        {
          rating: this.profile.blitzRating,
          games: this.profile.totalGamesBlitz,
        },
      ],
      [
        'rapid',
        {
          rating: this.profile.rapidRating,
          games: this.profile.totalGamesRapid,
        },
      ],
      [
        'classical',
        {
          rating: this.profile.classicRating,
          games: this.profile.totalGamesClassical,
        },
      ],
      ['puzzle', { rating: this.profile.puzzleRating, games: 0 }],
    ] as [string, { rating: number; games: number }][];

    return ratings.filter(
      ([_, data]) => data.rating !== undefined && data.rating >= 0
    );
  }
}
