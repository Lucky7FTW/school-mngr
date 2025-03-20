import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class SignUpComponent {
  email = '';
  password = '';
  role: 'admin' | 'professor' | 'student' = 'student'; // default

  constructor(private authService: AuthService) {}

  onSignUp(): void {
    this.authService.signUp(this.email, this.password, this.role)
      .subscribe({
        next: (userCredential) => {
          console.log('Sign-up success:', userCredential);
        },
        error: (error: any) => {
          console.error('Sign-up error:', error);
        }
      });
  }
}
