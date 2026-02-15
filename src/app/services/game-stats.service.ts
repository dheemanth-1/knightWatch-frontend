import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../shared/constants/api-endpoints';

export interface OverallStats {
  winRate: number;
  lossRate: number;
  drawRate: number;
  numberOfGames: number;
}

export interface OpeningStats {
  openingName: string;
  numWins: number;
  numLosses: number;
  numDraws: number;
  winRate: number;
  lossRate: number;
  drawRate: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameStatsService extends BaseApiService {
  /**
   * Get overall statistics for a user
   */
  getOverallStats(userId: string, source: string): Observable<OverallStats> {
    const url = this.buildUrl(
      API_ENDPOINTS.STATS_OVERALL + '/{userId}/{source}',
      {
        userId,
        source,
      }
    );

    return this.http
      .get<OverallStats>(url, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get opening statistics for a user
   */
  getOpeningStats(userId: string, source: string): Observable<OpeningStats[]> {
    const url = this.buildUrl(
      API_ENDPOINTS.STATS_OPENINGS + '/{userId}/{source}',
      {
        userId,
        source,
      }
    );

    return this.http
      .get<OpeningStats[]>(url, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }
}
