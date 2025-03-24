// src/app/auth/store/auth.effects.ts
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
  ) {
    // Debug logs (optional but helpful)
    console.log('AuthEffects constructor: authService =', this.authService);
    console.log('AuthEffects constructor: authService.login =', this.authService?.login);
  }

  // =========== LOGIN ===========
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(action => {
        // Call our authService.login → returns Observable
        const loginObservable = this.authService.login(action.email, action.password);
        console.log('login effect: got loginObservable =', loginObservable);

        return loginObservable.pipe(
          map(userCredential => AuthActions.loginSuccess({ userCredential })),
          catchError(error => of(AuthActions.loginFailure({ error })))
        );
      })
    )
  );

  // =========== SIGN UP ===========
  signUp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signUp),
      mergeMap(action => {
        const signUpObservable = this.authService.signUp(action.email, action.password, action.role);
        return signUpObservable.pipe(
          map(userCredential => AuthActions.signUpSuccess({ userCredential })),
          catchError(error => of(AuthActions.signUpFailure({ error })))
        );
      })
    )
  );

  // =========== LOGOUT ===========
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      mergeMap(() => {
        return this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(error => of(AuthActions.logoutFailure({ error })))
        );
      })
    )
  );
}
