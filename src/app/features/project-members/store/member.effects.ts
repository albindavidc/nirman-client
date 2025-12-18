import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as MemberActions from './member.actions';
import { MemberService } from '../services/member.service';

@Injectable()
export class MemberEffects {
  private actions$ = inject(Actions);
  private memberService = inject(MemberService);
  private snackBar = inject(MatSnackBar);

  loadMembers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MemberActions.loadMembers),
      switchMap(({ page, limit, role, search }) =>
        this.memberService.getMembers(page, limit, role, search).pipe(
          map((response) => MemberActions.loadMembersSuccess(response)),
          catchError((error) => of(MemberActions.loadMembersFailure({ error })))
        )
      )
    )
  );

  addMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MemberActions.addMember),
      mergeMap(({ member }) =>
        this.memberService.addMember(member).pipe(
          map((newMember) => {
            this.snackBar.open('Member added successfully', 'Close', {
              duration: 3000,
            });
            return MemberActions.addMemberSuccess({ member: newMember });
          }),
          catchError((error) => {
            this.snackBar.open('Failed to add member', 'Close', {
              duration: 3000,
            });
            return of(MemberActions.addMemberFailure({ error }));
          })
        )
      )
    )
  );

  editMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MemberActions.editMember),
      mergeMap(({ id, member }) =>
        this.memberService.editMember(id, member).pipe(
          map((updatedMember) => {
            this.snackBar.open('Member updated successfully', 'Close', {
              duration: 3000,
            });
            return MemberActions.editMemberSuccess({ member: updatedMember });
          }),
          catchError((error) => {
            this.snackBar.open('Failed to update member', 'Close', {
              duration: 3000,
            });
            return of(MemberActions.editMemberFailure({ error }));
          })
        )
      )
    )
  );

  blockMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MemberActions.blockMember),
      mergeMap(({ id }) =>
        this.memberService.blockMember(id).pipe(
          map((member) => {
            this.snackBar.open('Member blocked', 'Close', { duration: 3000 });
            return MemberActions.updateMemberStatusSuccess({ member });
          }),
          catchError((error) =>
            of(MemberActions.updateMemberStatusFailure({ error }))
          )
        )
      )
    )
  );

  unblockMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MemberActions.unblockMember),
      mergeMap(({ id }) =>
        this.memberService.unblockMember(id).pipe(
          map((member) => {
            this.snackBar.open('Member unblocked', 'Close', { duration: 3000 });
            return MemberActions.updateMemberStatusSuccess({ member });
          }),
          catchError((error) =>
            of(MemberActions.updateMemberStatusFailure({ error }))
          )
        )
      )
    )
  );
}
