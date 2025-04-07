// src/app/login/login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../store';
import { loginStart } from '../store/auth.actions';
import {
  selectAuthLoading,
  selectAuthError,
} from '../store/auth.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class LoginComponent {
  email = '';
  password = '';

  loading$!: Observable<boolean>;
  error$!: Observable<any>;

  constructor(private store: Store<AppState>, private router: Router) {}

  ngOnInit(): void {
    // Listen to auth state if needed
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  onLogin() {
    // Dispatch the loginStart action
    this.store.dispatch(loginStart({ email: this.email, password: this.password }));
  }
}
