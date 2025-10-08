import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page.component';
import { GameAnalysisComponent } from './components/game-analysis.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'profile/:username', component: LandingPageComponent },
  { path: 'analysis/:username', component: GameAnalysisComponent },
  { path: '**', redirectTo: '' },
];
