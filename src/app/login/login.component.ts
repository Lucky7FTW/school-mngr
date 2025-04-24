// src/app/login/login.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { RouterModule, Router }         from '@angular/router';
import { FormsModule }                   from '@angular/forms';
import { Store }                         from '@ngrx/store';
import { Subscription }                  from 'rxjs';

import { AppState }                from '../store';
import { loginStart }              from '../store/auth.actions';
import {
  selectAuthLoading,
  selectAuthError
} from '../store/auth.selectors';

import { LoggingService }          from '../services/logging.service';

@Component({
  selector   : 'app-login',
  standalone : true,
  imports    : [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls  : ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  email    = '';
  password = '';

  loading$ = this.store.select(selectAuthLoading);
  error$   = this.store.select(selectAuthError);

  private errSub!: Subscription;

  constructor(
    private store          : Store<AppState>,
    private router         : Router,
    private loggingService : LoggingService   // ← inject it
  ) {}

  ngOnInit(): void {
    // Log any login failures
    this.errSub = this.error$.subscribe(err => {
      if (err) {
        this.loggingService.log(
          'login',
          `Login FAILED for ${this.email} (${err.message || err})`
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.errSub?.unsubscribe();
  }

  onLogin(): void {
    // Start the auth flow
    this.store.dispatch(
      loginStart({ email: this.email, password: this.password })
    );

    // Log the attempt
    this.loggingService.log(
      'login',
      `Login attempt for ${this.email}`
    );
  }
}
