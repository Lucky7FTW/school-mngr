// auth.actions.ts
import { createAction, props } from '@ngrx/store';
import { UserCredential } from 'firebase/auth';

// Login actions
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ userCredential: UserCredential }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);

// Sign-Up actions
export const signUp = createAction(
  '[Auth] Sign Up',
  props<{ email: string; password: string; role: 'admin' | 'professor' | 'student' }>()
);

export const signUpSuccess = createAction(
  '[Auth] Sign Up Success',
  props<{ userCredential: UserCredential }>()
);

export const signUpFailure = createAction(
  '[Auth] Sign Up Failure',
  props<{ error: any }>()
);

// Logout actions
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: any }>()
);
