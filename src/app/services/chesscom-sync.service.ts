import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../shared/constants/api-endpoints';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChesscomSyncService extends BaseApiService {
  isSynced(username: string, year: number, month: number) {
    const url = this.buildUrl(
      API_ENDPOINTS.CHESSCOM_SYNC_STATUS + 'isSynced/{username}/{year}/{month}',
      {
        username,
        year: String(year),
        month: month.toString(),
      }
    );

    return this.http.get(url).pipe(catchError(this.handleError));
  }

  syncGamesOfMonth(username: string, year: number, month: number) {
    const url = this.buildUrl(
      API_ENDPOINTS.CHESSCOM_SYNC_STATUS +
        'syncUserAndGames/{username}/{year}/{month}',
      {
        username,
        year: String(year),
        month: month.toString(),
      }
    );
    return this.http.get(url).pipe(catchError(this.handleError));
  }
}
