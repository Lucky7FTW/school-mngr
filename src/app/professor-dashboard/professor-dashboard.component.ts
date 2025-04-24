// src/app/professor-dashboard/professor-dashboard.component.ts
import { Component, OnInit }      from '@angular/core';
import { CommonModule }            from '@angular/common';
import { FormsModule }             from '@angular/forms';
import { Router }                  from '@angular/router';
import { Auth, authState }         from '@angular/fire/auth';
import { Observable }              from 'rxjs';

import { CourseService, Course }   from '../services/course.service';
import { UserService }             from '../services/user.service';
import { LogService }              from '../services/log.service';

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
    private auth          : Auth,
    private router        : Router,
    private courseService : CourseService,
    private userService   : UserService,
    private logService    : LogService
  ) {}

  ngOnInit(): void {
    authState(this.auth).subscribe(user => {
      if (!user) {
        console.error('No authenticated professor found.');
        return void this.router.navigate(['/login']);
      }

      const uid   = user.uid;
      const email = user.email ?? '';

      // 1) load only courses assigned to this professor
      this.courses$ = this.courseService.getCoursesAssignedToProfessor(uid);

      // 2) log page view
      this.logService.addLog({
        page     : 'professor-dashboard',
        command  : `Viewed dashboard`,
        userUid  : uid,
      }).subscribe();
    });
  }

  onCourseClick(course: Course): void {
    if (!course.id) return;

    const uid   = this.auth.currentUser?.uid ?? 'anon';
    const email = this.auth.currentUser?.email ?? '';

    // record the click
    this.logService.addLog({
      page     : 'professor-dashboard',
      command  : `Clicked course "${course.name}" (${course.id})`,
      userUid  : uid,
    }).subscribe();

    // navigate
    this.router.navigate(['/professor/course', course.id]);
  }

  onLogout(): void {
    const uid   = this.auth.currentUser?.uid ?? 'anon';
    const email = this.auth.currentUser?.email ?? '';

    // sign out then log
    this.auth.signOut()
      .then(() => {
        this.logService.addLog({
          page     : 'professor-dashboard',
          command  : 'Logged out',
          userUid  : uid,
        }).subscribe();

        this.router.navigate(['/login']);
      })
      .catch(err => console.error('Logout Error:', err));
  }
}
