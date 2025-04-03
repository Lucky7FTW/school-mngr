import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>
      <p>Welcome to your admin dashboard!</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      text-align: center;
      margin-top: 50px;
    }
  `]
})
export class AdminDashboardComponent {}
