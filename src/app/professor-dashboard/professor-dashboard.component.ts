import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CourseService, Course } from '../services/course.service';
import { UserService, User } from '../services/user.service';
import { Auth, authState } from '@angular/fire/auth';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professor-dashboard.component.html',
  styleUrls: ['./professor-dashboard.component.css']
})
export class ProfessorDashboardComponent implements OnInit {
  // Fields for course creation
  courseName = '';
  courseDescription = '';
  selectedStudents: string[] = [];
  message = '';

  // Current professor's UID (set from auth state)
  professorId: string = '';
  // Toggle variable for displaying the create-course form
  showCreateForm: boolean = false;

  // Observable for available students (users with role "student")
  availableStudents$!: Observable<User[]>;
  // Observable for courses created by the professor
  courses$!: Observable<Course[]>;

  constructor(
    private courseService: CourseService,
    private userService: UserService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    // Get available students from Firestore.
    this.availableStudents$ = this.userService.getStudents();
    // Subscribe to auth state changes and set professorId; then load courses.
    authState(this.auth).subscribe(user => {
      if (user) {
        this.professorId = user.uid;
        this.loadCourses();
      } else {
        console.error('No authenticated user found.');
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  // Called when a student checkbox is checked/unchecked.
  onStudentCheckboxChange(event: any): void {
    const uid = event.target.value;
    if (event.target.checked) {
      this.selectedStudents.push(uid);
    } else {
      this.selectedStudents = this.selectedStudents.filter(s => s !== uid);
    }
  }

  createCourse(): void {
    const newCourse: Course = {
      name: this.courseName,
      description: this.courseDescription,
      assignedStudents: this.selectedStudents,
      createdBy: this.professorId,
      createdAt: null // will be set via serverTimestamp() in the service
    };

    this.courseService.createCourse(newCourse).subscribe({
      next: () => {
        this.message = 'Course created successfully!';
        // Reset form fields.
        this.courseName = '';
        this.courseDescription = '';
        this.selectedStudents = [];
        // Reload the courses list.
        this.loadCourses();
      },
      error: (err) => {
        this.message = 'Error creating course.';
        console.error('Course creation error:', err);
      }
    });
  }

  loadCourses(): void {
    // Get courses created by the current professor.
    this.courses$ = this.courseService.getCourses(this.professorId);
  }
}
