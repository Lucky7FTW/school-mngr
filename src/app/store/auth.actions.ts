// src/app/store/auth/auth.actions.ts

import { createAction, props } from '@ngrx/store';
import { UserCredential } from '@angular/fire/auth';

/** Login Start */
export const loginStart = createAction(
  '[Auth] Login Start',
  props<{ email: string; password: string }>()
);

/** Login Success */
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{
    userCredential: UserCredential;
    role: string | null;
  }>()
);

/** Login Failure */
export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);

/** Logout */
export const logout = createAction('[Auth] Logout');

/** Sign Up Start */
export const signUpStart = createAction(
  '[Auth] Sign Up Start',
  props<{
    email: string;
    password: string;
    role: 'admin' | 'professor' | 'student';
  }>()
);

/** 
 * Sign Up Success:
 * We ADDED `role` here so we can store it immediately. 
 */
export const signUpSuccess = createAction(
  '[Auth] Sign Up Success',
  props<{
    userCredential: UserCredential;
    role: string | null; // or 'admin' | 'professor' | 'student' | null
  }>()
);

/** Sign Up Failure */
export const signUpFailure = createAction(
  '[Auth] Sign Up Failure',
  props<{ error: any }>()
);
