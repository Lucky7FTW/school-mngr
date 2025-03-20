// auth.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { UserCredential } from 'firebase/auth';

export interface AuthState {
  userCredential: UserCredential | null;
  error: string | null;
  loading: boolean;
}

export const initialState: AuthState = {
  userCredential: null,
  error: null,
  loading: false,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, AuthActions.signUp, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, AuthActions.signUpSuccess, (state, { userCredential }) => ({
    ...state,
    userCredential,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, AuthActions.signUpFailure, (state, { error }) => ({
    ...state,
    error: error?.message || 'An error occurred',
    loading: false,
  })),
  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    userCredential: null,
  }))
);
