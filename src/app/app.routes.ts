// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  // Show the HomeComponent at the root path
  { path: '', component: HomeComponent, pathMatch: 'full' },

  // Login and Sign Up
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },

  // Wildcard: if no path matches, redirect to Home
  { path: '**', redirectTo: '' }
];
