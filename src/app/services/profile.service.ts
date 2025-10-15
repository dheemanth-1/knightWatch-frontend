import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../shared/constants/api-endpoints';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService extends BaseApiService {
  deleteUserAndSyncedGames(username: string): Observable<any> {
    const url = this.buildUrl(API_ENDPOINTS.LOCAL_PROFILE + '/{username}', {
      username,
    });
    return this.http.delete(url).pipe(catchError(this.handleError));
  }
}
