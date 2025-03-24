// src/app/sign-up/sign-up.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../store';
import { signUpStart } from '../store/auth.actions';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class SignUpComponent {
  email = '';
  password = '';
  role: 'admin' | 'professor' | 'student' = 'student';

  constructor(private store: Store<AppState>) {}

  onSignUp(): void {
    this.store.dispatch(
      signUpStart({
        email: this.email,
        password: this.password,
        role: this.role,
      })
    );
  }
}
