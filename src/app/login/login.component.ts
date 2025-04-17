// src/app/login/login.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { AppState }           from '../store';
import { loginStart }         from '../store/auth.actions';
import { selectAuthLoading,
         selectAuthError   }  from '../store/auth.selectors';
import { addLogStart }        from '../log/log.actions';  

@Component({
  selector   : 'app-login',
  templateUrl: './login.component.html',
  styleUrls  : ['./login.component.css'],
  standalone : true,
  imports    : [CommonModule, FormsModule, RouterModule],
})
export class LoginComponent implements OnInit, OnDestroy {

  email = '';
  password = '';

  loading$ = this.store.select(selectAuthLoading);
  error$   = this.store.select(selectAuthError);

  private sub!: Subscription;

  constructor(private store: Store<AppState>, private router: Router) {}

  ngOnInit(): void {
    /* Watch for login failures to log them */
    this.sub = this.error$.subscribe(err => {
      if (err) {
        this.store.dispatch(addLogStart({
          entry:{
            page   : 'login',
            command: `Login FAILED for ${this.email} (${err.message ?? err})`,
            userUid: 'unauth'                        // user not signed in yet
          }
        }));
      }
    });
  }

  /* Clean up subscription */
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  /* ─────────  LOGIN  ───────── */
  onLogin() {
    /* Fire the auth flow */
    this.store.dispatch(loginStart({ email: this.email, password: this.password }));

    /* Log the attempt immediately */
    this.store.dispatch(addLogStart({
      entry:{
        page   : 'login',
        command: `Login attempt for ${this.email}`,
        userUid: 'unauth'
      }
    }));
  }
}
