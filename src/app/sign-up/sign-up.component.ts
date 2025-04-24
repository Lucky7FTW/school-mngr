// src/app/sign-up/sign-up.component.ts
import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { Store }        from '@ngrx/store';

import { AppState }     from '../store';
import { signUpStart }  from '../store/auth.actions';
import { LogService }   from '../services/log.service';

@Component({
  selector   : 'app-sign-up',
  standalone : true,
  imports    : [CommonModule, FormsModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrls  : ['./sign-up.component.css'],
})
export class SignUpComponent {
  email    = '';
  password = '';
  role: 'admin' | 'professor' | 'student' = 'student';

  constructor(
    private store      : Store<AppState>,
    private logService : LogService
  ) {}

  onSignUp(): void {
    // 1️⃣ Kick off the sign-up flow
    this.store.dispatch(signUpStart({
      email: this.email,
      password: this.password,
      role: this.role
    }));

    // 2️⃣ Immediately log the attempt (LogService will fill in userEmail for you)
    this.logService.addLog({
      page   : 'sign-up',
      command: `Sign-up attempt as ${this.role} for ${this.email}`,
      userUid: 'unauth'
    }).subscribe();
  }
}
