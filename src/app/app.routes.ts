import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page.component';
import { GameAnalysisComponent } from './components/game-analysis.component';
import { AuthGuard } from './services/auth-guard.service';
import { LoginComponent } from './components/login.component';
import { LoginGuard } from './services/auth-guard.service';
import { RegisterComponent } from './components/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [LoginGuard] },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: LandingPageComponent },
      { path: 'profile/:username', component: LandingPageComponent },
      { path: 'analysis/:username', component: GameAnalysisComponent },
    ],
  },
  { path: '**', redirectTo: '' },
  // { path: '', component: LandingPageComponent },
  // { path: ':platform', component: LandingPageComponent },
  // { path: 'profile/:username/:platform', component: LandingPageComponent },
  // { path: 'analysis/:username', component: GameAnalysisComponent },
  // { path: '**', redirectTo: '' },
];
