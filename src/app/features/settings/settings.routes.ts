import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { settingsReducer } from './store/settings.reducer';
import { SettingsEffects } from './store/settings.effects';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/settings-page/settings-page.component').then(
        (m) => m.SettingsPageComponent
      ),
    providers: [
      provideState('settings', settingsReducer),
      provideEffects([SettingsEffects]),
    ],
  },
];
