// src/app/store/auth/auth.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from '../services/auth.service';
import {
  catchError,
  map,
  mergeMap,
  of,
  switchMap,
  tap
} from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  // -- LOGIN EFFECT --
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          mergeMap((userCredential) => {
            const uid = userCredential.user.uid;
            return this.authService.getUserRole(uid).pipe(
              map((role) =>
                AuthActions.loginSuccess({ userCredential, role })
              )
            );
          }),
          catchError((error) => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );

  // -- SIGN UP EFFECT --
  signUp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signUpStart),
      switchMap(({ email, password, role }) =>
        this.authService.signUp(email, password, role).pipe(
          mergeMap((userCredential) => {
            const uid = userCredential.user.uid;
            return this.authService.getUserRole(uid).pipe(
              map((fetchedRole) =>
                AuthActions.signUpSuccess({
                  userCredential,
                  role: fetchedRole 
                })
              )
            );
          }),
          catchError((error) => of(AuthActions.signUpFailure({ error })))
        )
      )
    )
  );

  // -- REDIRECT EFFECT --
  // Redirects to the appropriate dashboard after login or sign-up success.
  redirectAfterAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.signUpSuccess),
      tap(({ role }) => {
        if (role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (role === 'professor') {
          this.router.navigate(['/professor-dashboard']);
        } else {
          this.router.navigate(['/student-dashboard']);
        }
      })
    ),
    { dispatch: false }
  );
}
