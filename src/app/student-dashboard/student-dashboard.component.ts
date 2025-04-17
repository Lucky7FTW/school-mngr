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
  studentUid = ''; // We'll store the current student's UID here for refresh

  constructor(
    private auth: Auth,
    private router: Router,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    // Once the student is authenticated, store their UID
    // and fetch their assigned courses
    authState(this.auth).subscribe(user => {
      if (user) {
        this.studentUid = user.uid;
        this.refreshCourses();
      } else {
        console.error('No authenticated student found.');
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Called by the refresh button to re-fetch 
   * courses for the stored 'studentUid'.
   */
  refreshCourses(): void {
    if (!this.studentUid) {
      console.warn('No studentUid found. Cannot refresh courses.');
      return;
    }
    this.courses$ = this.courseService.getCoursesForStudent(this.studentUid);
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
