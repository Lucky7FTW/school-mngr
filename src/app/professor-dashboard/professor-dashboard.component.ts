// src/app/professor-dashboard/professor-dashboard.component.ts
import { Component, OnInit }      from '@angular/core';
import { CommonModule }            from '@angular/common';
import { FormsModule }             from '@angular/forms';
import { Router }                  from '@angular/router';
import { Auth, authState }         from '@angular/fire/auth';
import { Observable }              from 'rxjs';

import { CourseService, Course }   from '../services/course.service';
import { UserService }             from '../services/user.service';
import { LoggingService }          from '../services/logging.service';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professor-dashboard.component.html',
  styleUrls: ['./professor-dashboard.component.css']
})
export class ProfessorDashboardComponent implements OnInit {
  courses$!: Observable<Course[]>;

  constructor(
    private auth           : Auth,
    private router         : Router,
    private courseService  : CourseService,
    private userService    : UserService,
    private loggingService : LoggingService   // ← inject here
  ) {}

  ngOnInit(): void {
    authState(this.auth).subscribe(user => {
      if (user) {
        const professorUid = user.uid;

        // Load only the courses assigned to this professor
        this.courses$ = this.courseService.getCoursesAssignedToProfessor(professorUid);

        // Log that the dashboard was viewed
        this.loggingService.log(
          'professor-dashboard',
          `Professor ${professorUid} viewed dashboard`
        );
      } else {
        console.error('No authenticated professor found.');
        this.router.navigate(['/login']);
      }
    });
  }

  onCourseClick(course: Course): void {
    if (course.id) {
      // Log the navigation intent
      this.loggingService.log(
        'professor-dashboard',
        `Clicked course "${course.name}" (${course.id})`
      );

      // Navigate to the detail page
      this.router.navigate(['/professor/course', course.id]);
    }
  }

  onLogout(): void {
    this.auth.signOut()
      .then(() => {
        // Log the logout
        this.loggingService.log(
          'professor-dashboard',
          'Professor logged out'
        );
        this.router.navigate(['/login']);
      })
      .catch(err => console.error('Logout Error:', err));
  }
}
