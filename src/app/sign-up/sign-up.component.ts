// src/app/sign-up/sign-up.component.ts
import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule }  from '@angular/forms';
import { Store }        from '@ngrx/store';

import { AppState }     from '../store';
import { signUpStart }  from '../store/auth.actions';
import { LoggingService } from '../services/logging.service';

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
    private store          : Store<AppState>,
    private loggingService : LoggingService   // ← inject logging service
  ) {}

  onSignUp(): void {
    // 1️⃣ Start the sign-up flow
    this.store.dispatch(signUpStart({
      email: this.email,
      password: this.password,
      role: this.role
    }));

    // 2️⃣ Log the attempt
    this.loggingService.log(
      'sign-up',
      `Sign-up attempt as ${this.role} for ${this.email}`
    );
  }
}
