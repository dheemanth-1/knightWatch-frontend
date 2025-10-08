import { environment } from '../../../../environment';
export const API_ENDPOINTS = {
  BASE_URL: environment.apiUrl,

  // Lichess Sync endpoints
  LICHESS_SYNC: '/api/lichess/sync',
  LICHESS_SYNC_GAMES_COUNT: '/api/lichess/sync/games-count',
  SYNC_STATUS: '/api/lichess/sync/lastSynced',

  // Game Stats endpoints
  STATS_OVERALL: '/api/stats/overall',
  STATS_OPENINGS: '/api/stats/openings',

  // Lichess Game endpoints
  LICHESS_GAMES: '/api/db/local/games',
  LICHESS_GAMES_RECENT: '/api/db/local/games/recent',

  // Lichess Search endpoints
  LICHESS_SEARCH: '/api/lichess/',

  LICHESS_PROFILE: '/api/db/local/profile',
} as const;
