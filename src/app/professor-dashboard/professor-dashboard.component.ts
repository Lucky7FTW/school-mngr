import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { CourseService, Course } from '../services/course.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professor-dashboard.component.html',
  styleUrls: ['./professor-dashboard.component.css']
})
export class ProfessorDashboardComponent implements OnInit {
  // Observables
  courses$!: Observable<Course[]>;

  constructor(
    private auth: Auth,
    private router: Router,
    private courseService: CourseService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Wait for the professor to be authenticated
    authState(this.auth).subscribe(user => {
      if (user) {
        const professorUid = user.uid;
        // Fetch only the courses where professorId = this user’s UID
        this.courses$ = this.courseService.getCoursesAssignedToProfessor(professorUid);
      } else {
        console.error('No authenticated professor found.');
        this.router.navigate(['/login']);
      }
    });
  }

  // Called from the template on each course row click
  onCourseClick(course: Course): void {
    // Navigate to a detail page or open a modal, etc.
    if (course.id) {
      this.router.navigate(['/professor/course', course.id]);
    }
  }

  onLogout(): void {
    this.auth.signOut()
      .then(() => this.router.navigate(['/login']))
      .catch(err => console.error('Logout Error:', err));
  }
}
