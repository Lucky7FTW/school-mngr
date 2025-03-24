// src/app/store/auth/auth.actions.ts

import { createAction, props } from '@ngrx/store';
import { UserCredential } from '@angular/fire/auth';

/**
 * Login Start:
 * Dispatched when a user initiates the login process
 */
export const loginStart = createAction(
  '[Auth] Login Start',
  props<{ email: string; password: string }>()
);

/**
 * Login Success:
 * Dispatched when login is successful
 */
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{
    userCredential: UserCredential;
    // If your service can return null, use 'string | null'
    // If it always returns a valid string, just use 'string'
    role: string | null;
  }>()
);

/**
 * Login Failure:
 * Dispatched if an error occurs during login
 */
export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);

/**
 * Logout:
 * Dispatched to clear user session
 */
export const logout = createAction('[Auth] Logout');

/**
 * Sign Up Start:
 * Dispatched when a user starts the sign-up process
 */
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
 * Dispatched when sign-up is successful
 */
export const signUpSuccess = createAction(
  '[Auth] Sign Up Success',
  props<{ userCredential: UserCredential }>()
);

/**
 * Sign Up Failure:
 * Dispatched if an error occurs during sign-up
 */
export const signUpFailure = createAction(
  '[Auth] Sign Up Failure',
  props<{ error: any }>()
);
