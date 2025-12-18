import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { MemberListComponent } from './components/member-list/member-list.component';
import { memberReducer } from './store/member.reducer';
import { MemberEffects } from './store/member.effects';

export const PROJECT_MEMBERS_ROUTES: Routes = [
  {
    path: '',
    component: MemberListComponent,
    providers: [
      provideState('members', memberReducer),
      provideEffects(MemberEffects),
    ],
  },
];
