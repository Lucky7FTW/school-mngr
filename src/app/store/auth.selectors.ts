// src/app/store/auth/auth.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

// 1) feature selector
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// 2) pick off pieces of state
export const selectUserCredential = createSelector(
  selectAuthState,
  (state) => state.userCredential
);

export const selectUserRole = createSelector(
  selectAuthState,
  (state) => state.role
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);
