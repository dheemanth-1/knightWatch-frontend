import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../shared/constants/api-endpoints';
import { SyncStatus } from '../components/landing-page.component';

export interface SyncResponse {
  lastSync: string;
  isSyncInProgress: boolean;
  lastLocalGameDate: string;
  gamesSynced: number;
}

export interface GamesCountResponse {
  username: string;
  totalRatedGames: number;
}

@Injectable({
  providedIn: 'root',
})
export class LichessSyncService extends BaseApiService {
  /**
   * Sync games from Lichess API to backend database
   */
  syncGames(
    username: string,
    numberOfGames?: number
  ): Observable<SyncResponse> {
    const url = this.buildUrl(API_ENDPOINTS.LICHESS_SYNC + '/{username}', {
      username,
    });

    const params = numberOfGames
      ? this.createHttpParams({ games: numberOfGames })
      : undefined;

    return this.http
      .post<SyncResponse>(
        url,
        {
          withCredentials: true,
        },
        { params }
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Get total games count for a user
   */
  getGamesCount(username: string): Observable<GamesCountResponse> {
    const url = this.buildUrl(
      API_ENDPOINTS.LICHESS_SYNC_GAMES_COUNT + '/{username}',
      { username }
    );

    return this.http
      .get<GamesCountResponse>(url, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get sync status for a user
   */
  getSyncStatus(username: string): Observable<SyncStatus> {
    const url = this.buildUrl(API_ENDPOINTS.SYNC_STATUS + '/{username}', {
      username,
    });

    return this.http.get<SyncStatus>(url).pipe(catchError(this.handleError));
  }
}
