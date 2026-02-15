import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LichessSyncService } from './services/lichess-sync.service';
import { GameStatsService } from './services/game-stats.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(
    private lichessSyncService: LichessSyncService,
    private gameStatsService: GameStatsService
  ) {}
  currentUsername: string = '';
  updateUsername(username: string): void {
    this.currentUsername = username;
  }
  getGamesCount(): void {
    this.lichessSyncService.getGamesCount(this.currentUsername).subscribe({
      next: (response) => {
        console.log('Games count:', response);
      },
      error: (error) => {
        console.error('Failed to get games count:', error);
      },
    });
  }

  getGamesStatsOverall(): void {
    this.gameStatsService
      .getOverallStats(this.currentUsername, 'lichess')
      .subscribe({
        next: (response) => {
          console.log('Overall Stats:', response);
        },
        error: (error) => {
          console.error('Failed to get overall stats:', error);
        },
      });
  }

  getStatsBreakdownByOpening(): void {
    this.gameStatsService
      .getOpeningStats(this.currentUsername, 'lichess')
      .subscribe({
        next: (response) => {
          console.log('Opening Stats:', response);
        },
        error: (error) => {
          console.error('Failed to get Opening Stats:', error);
        },
      });
  }
}
