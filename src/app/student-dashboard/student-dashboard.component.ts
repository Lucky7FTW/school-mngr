import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';

import { CourseService, Course } from '../services/course.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  courses$!: Observable<Course[]>;

  constructor(
    private auth: Auth,
    private router: Router,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    // Once the student is authenticated, fetch only the courses where
    // assignedStudents contains this student's UID.
    authState(this.auth).subscribe(user => {
      if (user) {
        const studentUid = user.uid;
        // Make sure we have the method getCoursesForStudent(...) in CourseService
        this.courses$ = this.courseService.getCoursesForStudent(studentUid);
      } else {
        console.error('No authenticated student found.');
        this.router.navigate(['/login']);
      }
    });
  }

  onCourseClick(course: Course): void {
    // Optionally navigate to a detail page or open a modal, etc.
    if (course.id) {
      // e.g., navigate to /student/course/<courseId>
      this.router.navigate(['/student/course', course.id]);
    }
  }

  onLogout(): void {
    this.auth.signOut()
      .then(() => this.router.navigate(['/login']))
      .catch(err => console.error('Logout Error:', err));
  }
}
