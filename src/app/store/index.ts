// src/app/store/index.ts

import { ActionReducerMap } from '@ngrx/store';
import { authReducer, AuthState } from './auth.reducer';

export interface AppState {
  auth: AuthState; // Add more slices if needed
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer
};
