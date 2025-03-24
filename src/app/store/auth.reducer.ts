// src/app/store/auth/auth.reducer.ts

import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { UserCredential } from '@angular/fire/auth';

export interface AuthState {
  userCredential: UserCredential | null;
  role: string | null;
  loading: boolean;
  error: any;
}

const initialState: AuthState = {
  userCredential: null,
  role: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

  // ---- LOGIN ----
  on(AuthActions.loginStart, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { userCredential, role }) => ({
    ...state,
    userCredential,
    role,
    loading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    userCredential: null,
    role: null,
    loading: false,
    error,
  })),

  // ---- SIGN UP ----
  on(AuthActions.signUpStart, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.signUpSuccess, (state, { userCredential }) => ({
    ...state,
    userCredential,
    loading: false,
    error: null
  })),

  on(AuthActions.signUpFailure, (state, { error }) => ({
    ...state,
    userCredential: null,
    loading: false,
    error
  })),

  // ---- LOGOUT ----
  on(AuthActions.logout, (state) => ({
    ...state,
    userCredential: null,
    role: null,
    loading: false,
    error: null
  }))
);
