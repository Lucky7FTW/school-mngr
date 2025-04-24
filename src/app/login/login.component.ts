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

import { LogService, LogEntry }    from '../services/log.service';
import { Auth }                    from '@angular/fire/auth';

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
    private store   : Store<AppState>,
    private router  : Router,
    private auth    : Auth,
    private logSvc  : LogService
  ) {}

  ngOnInit(): void {
    // Log login failures
    this.errSub = this.error$.subscribe(err => {
      if (err) {
        const entry: Omit<LogEntry, 'id' | 'createdAt'> = {
          page:    'login',
          command: `Login FAILED for ${this.email}: ${err.message || err}`,
          userUid: 'unauth',
          userEmail: this.email
        };
        this.logSvc.addLog(entry).subscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.errSub?.unsubscribe();
  }

  onLogin(): void {
    // Dispatch authentication
    this.store.dispatch(loginStart({
      email: this.email,
      password: this.password
    }));

    // Immediately log the attempt
    const entry: Omit<LogEntry, 'id' | 'createdAt'> = {
      page:    'login',
      command: `Login attempt for ${this.email}`,
      userUid: 'unauth',
      userEmail: this.email
    };
    this.logSvc.addLog(entry).subscribe();
  }
}
