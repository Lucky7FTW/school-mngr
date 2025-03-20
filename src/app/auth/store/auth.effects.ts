// auth.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../services/auth.service';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService
  ) {}

  // Effect for login
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap((action) =>
        this.authService.login(action.email, action.password).pipe(
          map(userCredential => AuthActions.loginSuccess({ userCredential })),
          catchError(error => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );

  // Effect for sign-up
  signUp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signUp),
      mergeMap((action) =>
        this.authService.signUp(action.email, action.password, action.role).pipe(
          map(userCredential => AuthActions.signUpSuccess({ userCredential })),
          catchError(error => of(AuthActions.signUpFailure({ error })))
        )
      )
    )
  );

  // Effect for logout
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      mergeMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(error => of(AuthActions.logoutFailure({ error })))
        )
      )
    )
  );
}
