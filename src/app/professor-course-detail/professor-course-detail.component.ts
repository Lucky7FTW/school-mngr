import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CourseService, Course } from '../services/course.service';
import { UserService, User } from '../services/user.service';
import { FilterUidPipe } from '../pipes/filter-uid.pipe';

@Component({
  selector: 'app-professor-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule,FilterUidPipe],
  templateUrl: './professor-course-detail.component.html',
  styleUrls: ['./professor-course-detail.component.css']
})
export class ProfessorCourseDetailComponent implements OnInit {
  course: Course | null = null;
  // All students from Firestore, but not all are displayed by default
  allStudents$!: Observable<User[]>;

  selectedStudentUid = '';   // Holds the student UID selected from the dropdown
  updateMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (!courseId) {
      this.router.navigate(['/professor-dashboard']);
      return;
    }
    this.loadCourse(courseId);

    // Load all students (role='student'), used by the dropdown
    this.allStudents$ = this.userService.getStudents();
  }

  loadCourse(courseId: string): void {
    this.courseService.getCourseById(courseId).subscribe({
      next: (course: Course | null) => {
        if (!course) {
          this.router.navigate(['/professor-dashboard']);
          return;
        }
        // Coalesce fields to avoid "possibly undefined" errors
        this.course = {
          ...course,
          assignedStudents: course.assignedStudents ?? [],
          attendanceRecords: course.attendanceRecords ?? {}
        };
      },
      error: (err) => {
        console.error('Error loading course', err);
        this.router.navigate(['/professor-dashboard']);
      }
    });
  }

  // ------------------------
  // ADDING A NEW STUDENT
  // ------------------------
  addSelectedStudent(): void {
    if (!this.course) return;
    if (!this.selectedStudentUid) {
      this.updateMessage = 'Please select a student.';
      return;
    }

    // Safely read assignedStudents & attendanceRecords
    let assigned = this.course.assignedStudents ?? [];
    let attendance = this.course.attendanceRecords ?? {};

    if (!assigned.includes(this.selectedStudentUid)) {
      // Add new student to assigned list
      assigned.push(this.selectedStudentUid);

      // Optionally initialize their attendance
      if (attendance[this.selectedStudentUid] == null) {
        attendance[this.selectedStudentUid] = 0;
      }
      this.updateMessage = 'Student added. Remember to save changes!';
    } else {
      this.updateMessage = 'Student is already assigned.';
    }

    // Re-assign to avoid TS warnings
    this.course.assignedStudents = assigned;
    this.course.attendanceRecords = attendance;

    // Clear dropdown
    this.selectedStudentUid = '';
  }

  // ------------------------
  // REMOVING AN ASSIGNED STUDENT
  // ------------------------
  removeStudent(studentUid: string): void {
    if (!this.course) return;
    let assigned = this.course.assignedStudents ?? [];
    if (assigned.includes(studentUid)) {
      assigned = assigned.filter(uid => uid !== studentUid);
      this.course.assignedStudents = assigned;
      this.updateMessage = 'Student removed from course. Don’t forget to save!';
    }
  }

  // ------------------------
  // UPDATING ATTENDANCE
  // ------------------------
  updateStudentAttendance(studentUid: string, value: string): void {
    if (!this.course) return;
    let attendance = this.course.attendanceRecords ?? {};
    const attendanceValue = Number(value);
    if (!isNaN(attendanceValue)) {
      attendance[studentUid] = attendanceValue;
      this.course.attendanceRecords = attendance;
    }
  }

  // ------------------------
  // SAVING CHANGES
  // ------------------------
  saveCourseChanges(): void {
    if (!this.course?.id) return;
    const updates: Partial<Course> = {
      name: this.course.name,
      description: this.course.description,
      assignedStudents: this.course.assignedStudents,
      attendanceRecords: this.course.attendanceRecords
    };

    this.courseService.updateCourse(this.course.id, updates).subscribe({
      next: () => {
        this.updateMessage = 'Changes saved successfully!';
      },
      error: (err) => {
        console.error('Update Course Error:', err);
        this.updateMessage = 'Error saving changes.';
      }
    });
  }

  // ------------------------
  // NAVIGATION
  // ------------------------
  goBack(): void {
    this.router.navigate(['/professor-dashboard']);
  }
}
