// src/app/sign-up/sign-up.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { AppState }     from '../store';
import { signUpStart }  from '../store/auth.actions';
import { addLogStart }  from '../log/log.actions';   // ← log action

@Component({
  selector   : 'app-sign-up',
  standalone : true,
  templateUrl: './sign-up.component.html',
  styleUrls  : ['./sign-up.component.css'],
  imports    : [CommonModule, FormsModule, RouterModule],
})
export class SignUpComponent {

  email = '';
  password = '';
  role: 'admin' | 'professor' | 'student' = 'student';

  constructor(private store: Store<AppState>) {}

  /* ─────────  SIGN‑UP  ───────── */
  onSignUp(): void {

    /* 1. fire authentication flow */
    this.store.dispatch(signUpStart({
      email   : this.email,
      password: this.password,
      role    : this.role
    }));

    /* 2. write a log entry */
    this.store.dispatch(addLogStart({
      entry:{
        page   : 'sign-up',
        command: `Sign‑up attempt as ${this.role} for ${this.email}`,
        userUid: 'unauth'          // user not created yet
      }
    }));
  }
}
