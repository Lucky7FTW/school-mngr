import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CourseService, Course } from '../services/course.service';
import { Auth, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professor-dashboard.component.html',
  styleUrls: ['./professor-dashboard.component.css']
})
export class ProfessorDashboardComponent implements OnInit {
  courseName = '';
  courseDescription = '';
  message = '';
  professorId: string = '';
  isModalOpen: boolean = false;

  courses$!: Observable<Course[]>;

  constructor(
    private courseService: CourseService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state changes and set professorId.
    authState(this.auth).subscribe(user => {
      if (user) {
        this.professorId = user.uid;
        this.loadCourses();
      } else {
        console.error('No authenticated user found.');
      }
    });
  }

  openModal(): void {
    this.isModalOpen = true;
    this.message = '';
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.message = '';
  }

  createCourse(): void {
    // Validate that the required fields are not empty.
    if (!this.courseName.trim() || !this.courseDescription.trim()) {
      this.message = 'Course Name and Description cannot be empty.';
      return;
    }

    const newCourse: Course = {
      name: this.courseName,
      description: this.courseDescription,
      // No students assigned.
      assignedStudents: [],
      createdBy: this.professorId,
      createdAt: null // will be set via serverTimestamp() in the service
    };

    this.courseService.createCourse(newCourse).subscribe({
      next: () => {
        this.message = 'Course created successfully!';
        // Reset form fields.
        this.courseName = '';
        this.courseDescription = '';
        this.loadCourses();
        this.closeModal();
      },
      error: (err) => {
        this.message = 'Error creating course.';
        console.error('Course creation error:', err);
      }
    });
  }

  loadCourses(): void {
    this.courses$ = this.courseService.getCourses(this.professorId);
  }
}
