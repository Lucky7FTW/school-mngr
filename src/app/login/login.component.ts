import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: (userCredential) => {
        console.log('Login success:', userCredential);
        // Once logged in, you can fetch role if needed:
        const uid = userCredential.user.uid;
        this.authService.getUserRole(uid).subscribe({
          next: (role) => {
            console.log('User role is:', role);
            // Navigate based on role
            switch (role) {
              case 'admin':
                this.router.navigate(['/admin-dashboard']);
                break;
              case 'professor':
                this.router.navigate(['/professor-dashboard']);
                break;
              default:
                // default is student or unrecognized
                this.router.navigate(['/student-dashboard']);
                break;
            }
          }
        });
      },
      error: (error) => {
        console.error('Login error:', error);
      }
    });
  }
}
