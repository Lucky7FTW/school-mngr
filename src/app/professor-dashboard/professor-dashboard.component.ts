import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';

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

  // View/Edit Course Fields
  selectedCourse: Course | null = null;
  isViewCourseModalOpen = false;
  viewCourseMessage = '';

  // Professor
  professorId: string = '';

  // Observables
  courses$!: Observable<Course[]>;
  allStudents$!: Observable<User[]>;

  constructor(
    private auth: Auth,
    private courseService: CourseService,
    private userService: UserService
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

    // Load all students
    this.allStudents$ = this.userService.getStudents();
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
  // VIEW / EDIT COURSE
  // -----------------------------
  onCourseClick(course: Course): void {
    // Shallow copy to avoid mutating the original
    this.selectedCourse = { ...course };
    // Ensure arrays/objects exist
    this.selectedCourse.assignedStudents = this.selectedCourse.assignedStudents || [];
    this.selectedCourse.attendanceRecords = this.selectedCourse.attendanceRecords || {};

    this.viewCourseMessage = '';
    this.isViewCourseModalOpen = true;
  }

  closeViewCourseModal(): void {
    this.isViewCourseModalOpen = false;
    this.selectedCourse = null;
    this.viewCourseMessage = '';
  }

  // Toggle student assignment
  toggleStudentAssignment(studentUid: string, checked: boolean): void {
    if (!this.selectedCourse) return;

    if (checked) {
      if (!this.selectedCourse.assignedStudents.includes(studentUid)) {
        this.selectedCourse.assignedStudents.push(studentUid);
      }
    } else {
      this.selectedCourse.assignedStudents = this.selectedCourse.assignedStudents.filter(
        (uid) => uid !== studentUid
      );
    }
  }

  // Update attendance in local state
  updateStudentAttendance(studentUid: string, value: string): void {
    if (!this.selectedCourse) return;

    const attendanceValue = Number(value);
    if (isNaN(attendanceValue)) return;

    this.selectedCourse.attendanceRecords![studentUid] = attendanceValue;
  }

  // Save changes back to Firestore
  saveCourseChanges(): void {
    if (!this.selectedCourse?.id) return;

    const updates: Partial<Course> = {
      assignedStudents: this.selectedCourse.assignedStudents,
      attendanceRecords: this.selectedCourse.attendanceRecords
    };

    this.courseService.updateCourse(this.selectedCourse.id, updates).subscribe({
      next: () => {
        this.viewCourseMessage = 'Changes saved!';
      },
      error: (err) => {
        console.error('Update Course Error:', err);
        this.viewCourseMessage = 'Error saving changes.';
      }
    });
  }
}
