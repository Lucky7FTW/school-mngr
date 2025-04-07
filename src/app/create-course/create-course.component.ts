import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CourseService, Course } from '../services/course.service';
import { UserService, User } from '../services/user.service';
import { Auth, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.css']
})
export class CreateCourseComponent implements OnInit {
  courseName = '';
  courseDescription = '';
  // Array to hold selected student UIDs.
  selectedStudents: string[] = [];
  
  // Current professor's UID (retrieved from the auth state)
  professorId: string = '';
  message = '';

  // Observable of available students from Firestore.
  availableStudents$!: Observable<User[]>;

  constructor(
    private courseService: CourseService,
    private userService: UserService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    // Load available students (users with role "student")
    this.availableStudents$ = this.userService.getStudents();
    // Subscribe to the current auth state and set the professorId.
    authState(this.auth).subscribe(user => {
      if (user) {
        this.professorId = user.uid;
      } else {
        console.error("No authenticated user found.");
      }
    });
  }

  // Handle checkbox changes for student assignment.
  onStudentCheckboxChange(event: any): void {
    const uid = event.target.value;
    if (event.target.checked) {
      this.selectedStudents.push(uid);
    } else {
      this.selectedStudents = this.selectedStudents.filter(s => s !== uid);
    }
  }

  // Create a new course document in Firestore.
  createCourse(): void {
    const newCourse: Course = {
      name: this.courseName,
      description: this.courseDescription,
      assignedStudents: this.selectedStudents,
      createdBy: this.professorId,
      createdAt: null // Will be set in the service via serverTimestamp.
    };

    this.courseService.createCourse(newCourse).subscribe({
      next: () => {
        this.message = 'Course created successfully!';
        // Reset the form fields.
        this.courseName = '';
        this.courseDescription = '';
        this.selectedStudents = [];
      },
      error: (err) => {
        this.message = 'Error creating course.';
        console.error('Course creation error:', err);
      }
    });
  }
}
