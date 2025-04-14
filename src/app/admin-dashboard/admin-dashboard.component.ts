import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

import { CourseService, Course } from '../services/course.service';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // -- Fields for the 'Create Course' modal --
  isCreateCourseModalOpen = false;
  courseName = '';
  courseDescription = '';
  selectedProfessorUid = '';
  createCourseMessage = '';

  // -- Observables --
  professors$!: Observable<User[]>; // All professors
  courses$!: Observable<Course[]>;   // All courses

  // -- Local dictionary to map professor UIDs -> emails --
  professorEmailMap: { [uid: string]: string } = {};

  // -------------------------------------------------------------------------
  // CONSTRUCTOR: Where we inject Auth, Router, plus our services
  // -------------------------------------------------------------------------
  constructor(
    private auth: Auth,
    private router: Router,
    private courseService: CourseService,
    private userService: UserService
  ) {}

  // -------------------------------------------------------------------------
  // LIFECYCLE: OnInit
  // -------------------------------------------------------------------------
  ngOnInit(): void {
    // 1) Load all professors & build an email map
    this.professors$ = this.userService.getProfessors();
    this.professors$.subscribe((profs) => {
      this.professorEmailMap = {};
      profs.forEach((p) => {
        this.professorEmailMap[p.uid] = p.email;
      });
    });

    // 2) Load all courses
    this.courses$ = this.courseService.getAllCourses();
  }

  // -------------------------------------------------------------------------
  // LOGOUT METHOD
  // -------------------------------------------------------------------------
  onLogout(): void {
    this.auth.signOut()
      .then(() => {
        // e.g., navigate to login page
        this.router.navigate(['/login']);
      })
      .catch(err => {
        console.error('Logout Error:', err);
      });
  }

  // -------------------------------------------------------------------------
  // MODAL TOGGLE
  // -------------------------------------------------------------------------
  openCreateCourseModal(): void {
    this.isCreateCourseModalOpen = true;
    this.createCourseMessage = '';
  }

  closeCreateCourseModal(): void {
    this.isCreateCourseModalOpen = false;
    this.createCourseMessage = '';
  }

  // -------------------------------------------------------------------------
  // CREATE COURSE
  // -------------------------------------------------------------------------
  createCourse(): void {
    if (!this.courseName.trim() ||
        !this.courseDescription.trim() ||
        !this.selectedProfessorUid) {
      this.createCourseMessage = 'Please fill out all fields.';
      return;
    }

    const newCourse: Course = {
      name: this.courseName,
      description: this.courseDescription,
      assignedStudents: [],
      attendanceRecords: {},
      professorId: this.selectedProfessorUid,  // Assign chosen professor
      createdBy: 'admin',   // or actual admin user ID
      createdAt: null
    };

    this.courseService.createCourse(newCourse).subscribe({
      next: () => {
        this.createCourseMessage = 'Course created successfully!';
        // Reset form fields
        this.courseName = '';
        this.courseDescription = '';
        this.selectedProfessorUid = '';
        // Reload to show new course in the table
        this.courses$ = this.courseService.getAllCourses();
      },
      error: (err) => {
        console.error('Create Course Error:', err);
        this.createCourseMessage = 'Error creating course.';
      }
    });
  }
}
