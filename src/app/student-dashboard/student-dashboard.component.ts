// src/app/student-dashboard/student-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { Observable }     from 'rxjs';
import { Router }         from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Store }          from '@ngrx/store';

import { CourseService, Course } from '../services/course.service';
import { addLogStart }          from '../log/log.actions';      // ← log action

@Component({
  selector   : 'app-student-dashboard',
  standalone : true,
  imports    : [CommonModule, FormsModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls  : ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {

  courses$!: Observable<Course[]>;
  studentUid = '';

  constructor(
    private auth : Auth,
    private router: Router,
    private courseService: CourseService,
    private store: Store                           // ← inject Store
  ) {}

  /* ───────── INITIALISATION ───────── */
  ngOnInit(): void {
    authState(this.auth).subscribe(user => {
      if (user) {
        this.studentUid = user.uid;

        /* log successful auth */
        this.dispatchLog(`Student logged in (${user.email})`);

        this.refreshCourses();
      } else {
        console.error('No authenticated student found.');
        this.router.navigate(['/login']);
      }
    });
  }

  /* ───────── REFRESH COURSES ───────── */
  refreshCourses(): void {
    if (!this.studentUid) {
      console.warn('No studentUid. Cannot refresh courses.');
      return;
    }
    this.courses$ = this.courseService.getCoursesForStudent(this.studentUid);

    /* log manual refresh */
    this.dispatchLog('Clicked Refresh courses');
  }

  /* ───────── COURSE CLICK ───────── */
  onCourseClick(course: Course): void {
    if (!course.id) return;

    /* log navigation */
    this.dispatchLog(`Opened course "${course.name}"`);

    this.router.navigate(['/student/course', course.id]);
  }

  /* ───────── LOGOUT ───────── */
  onLogout(): void {
    this.auth.signOut()
      .then(() => {
        this.dispatchLog('Student logged out');
        this.router.navigate(['/login']);
      })
      .catch(err => console.error('Logout Error:', err));
  }

  /* ───────── HELPER TO DISPATCH A LOG ENTRY ───────── */
  private dispatchLog(command: string){
    this.store.dispatch(addLogStart({
      entry:{
        page   : 'student-dashboard',
        command,
        userUid: this.auth.currentUser?.uid ?? 'unauth'
      }
    }));
  }
}
