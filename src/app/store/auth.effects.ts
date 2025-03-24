// src/app/store/auth/auth.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from '../services/auth.service';
import {
  catchError,
  map,
  of,
  switchMap,
  mergeMap
} from 'rxjs';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService
  ) {}

  // -- LOGIN EFFECT --
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      // switchMap gets { email, password } from the action
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          // If success, get role:
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
          map((userCredential) =>
            AuthActions.signUpSuccess({ userCredential })
          ),
          catchError((error) => of(AuthActions.signUpFailure({ error })))
        )
      )
    )
  );

}
