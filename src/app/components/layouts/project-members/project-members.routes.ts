import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { MemberListComponent } from './components/member-list/member-list.component';
import { memberReducer } from './store/member.reducer';
import { MemberEffects } from './store/member.effects';
import { RoleGuard } from '../../../core/guards/role.guard';

export const PROJECT_MEMBERS_ROUTES: Routes = [
  {
    path: '',
    component: MemberListComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'supervisor', 'vendor'] },
    providers: [
      provideState('members', memberReducer),
      provideEffects(MemberEffects),
    ],
  },
];
