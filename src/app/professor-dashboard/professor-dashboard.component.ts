// src/app/professor-dashboard/professor-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { CourseService, Course } from '../services/course.service';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professor-dashboard.component.html',
  styleUrls: ['./professor-dashboard.component.css']
})
export class ProfessorDashboardComponent implements OnInit {
  // Create Course Fields
  courseName = '';
  courseDescription = '';
  createCourseMessage = '';
  isCreateCourseModalOpen = false;

  // Professor
  professorId: string = '';

  // Observables
  courses$!: Observable<Course[]>;

  constructor(
    private auth: Auth,
    private courseService: CourseService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the professor's ID from Firebase Auth
    authState(this.auth).subscribe((user) => {
      if (user) {
        this.professorId = user.uid;
        this.loadCourses();
      } else {
        console.error('No authenticated user found.');
      }
    });
  }

  // -----------------------------
  // CREATE COURSE
  // -----------------------------
  openCreateCourseModal(): void {
    this.isCreateCourseModalOpen = true;
    this.createCourseMessage = '';
  }

  closeCreateCourseModal(): void {
    this.isCreateCourseModalOpen = false;
    this.createCourseMessage = '';
  }

  createCourse(): void {
    if (!this.courseName.trim() || !this.courseDescription.trim()) {
      this.createCourseMessage = 'Course name/description cannot be empty.';
      return;
    }

    const newCourse: Course = {
      name: this.courseName,
      description: this.courseDescription,
      assignedStudents: [],
      attendanceRecords: {},
      createdBy: this.professorId,
      createdAt: null
    };

    this.courseService.createCourse(newCourse).subscribe({
      next: () => {
        this.createCourseMessage = 'Course created successfully!';
        // Clear fields and reload courses
        this.courseName = '';
        this.courseDescription = '';
        this.loadCourses();
        // Close modal
        this.closeCreateCourseModal();
      },
      error: (err) => {
        console.error('Create Course Error:', err);
        this.createCourseMessage = 'Error creating course.';
      }
    });
  }

  loadCourses(): void {
    this.courses$ = this.courseService.getCourses(this.professorId);
  }

  // -----------------------------
  // REDIRECT TO COURSE DETAIL
  // -----------------------------
  onCourseClick(course: Course): void {
    // Navigate to the detailed view for the selected course
    if (course.id) {
      this.router.navigate(['/professor/course', course.id]);
    }
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  onLogout(): void {
    this.auth.signOut().then(() => {
      // E.g. navigate to login page
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Logout Error:', error);
    });
  }
}
