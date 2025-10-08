import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../shared/constants/api-endpoints';

export interface LichessGame {
  username: string;
  gameId: string;
  openingName: string;
  result: string;
  playedAt: string;
  pgn: string;
  eco: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class LichessGameService extends BaseApiService {
  /**
   * Get all games for a user from database
   */
  getAllGames(
    username: string,
    page?: number,
    limit?: number
  ): Observable<LichessGame[]> {
    const url = this.buildUrl(API_ENDPOINTS.LICHESS_GAMES + '/{username}', {
      username,
    });
    const params = this.createHttpParams({ page, limit });

    return this.http
      .get<LichessGame[]>(url, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get recent games for a user from database
   */
  getRecentGames(username: string, limit?: number): Observable<LichessGame[]> {
    const url = this.buildUrl(
      API_ENDPOINTS.LICHESS_GAMES_RECENT + '/{username}',
      { username }
    );
    const params = this.createHttpParams({ limit });

    return this.http
      .get<LichessGame[]>(url, { params })
      .pipe(catchError(this.handleError));
  }
}
