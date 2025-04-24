// src/app/professor-course-detail/professor-course-detail.component.ts
import { Component, OnInit }           from '@angular/core';
import { ActivatedRoute, Router }      from '@angular/router';
import { CommonModule }                from '@angular/common';
import { FormsModule }                 from '@angular/forms';
import { Observable }                  from 'rxjs';
import { Auth }                        from '@angular/fire/auth';

import { CourseService, Course }       from '../services/course.service';
import { UserService, User }           from '../services/user.service';
import { FilterUidPipe }               from '../pipes/filter-uid.pipe';
import { LoggingService }              from '../services/logging.service';

@Component({
  selector: 'app-professor-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterUidPipe],
  templateUrl: './professor-course-detail.component.html',
  styleUrls: ['./professor-course-detail.component.css']
})
export class ProfessorCourseDetailComponent implements OnInit {
  course: Course | null = null;
  allStudents$!: Observable<User[]>;
  private allStudentsList: User[] = [];  // ← hold students locally

  selectedStudentUid = '';
  updateMessage     = '';

  constructor(
    private route          : ActivatedRoute,
    private router         : Router,
    private courseService  : CourseService,
    private userService    : UserService,
    private auth           : Auth,
    private loggingService : LoggingService
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (!courseId) {
      this.router.navigate(['/professor-dashboard']);
      return;
    }

    // load course
    this.loadCourse(courseId);

    // load and cache all students
    this.allStudents$ = this.userService.getStudents();
    this.allStudents$.subscribe(list => this.allStudentsList = list);

    // log page view
    this.loggingService.log(
      'professor-course-detail',
      `Viewed course detail ${courseId}`
    );
  }

  private loadCourse(courseId: string): void {
    this.courseService.getCourseById(courseId).subscribe({
      next: course => {
        if (!course) {
          this.router.navigate(['/professor-dashboard']);
          return;
        }
        this.course = {
          ...course,
          assignedStudents : course.assignedStudents  ?? [],
          attendanceRecords: course.attendanceRecords ?? {}
        };
      },
      error: err => {
        console.error('Error loading course', err);
        this.loggingService.log(
          'professor-course-detail',
          `Error loading course ${courseId}: ${err.message || err}`
        );
        this.router.navigate(['/professor-dashboard']);
      }
    });
  }

  addSelectedStudent(): void {
    if (!this.course) return;
    if (!this.selectedStudentUid) {
      this.updateMessage = 'Please select a student.';
      return;
    }

    const uid = this.selectedStudentUid;
    const student = this.allStudentsList.find(s => s.uid === uid);
    const email   = student?.email || uid;

    if (!this.course.assignedStudents.includes(uid)) {
      this.course.assignedStudents.push(uid);
      this.course.attendanceRecords![uid] ??= 0;

      this.loggingService.log(
        'professor-course-detail',
        `Invited student ${email} to "${this.course.name}"`
      );
      this.updateMessage = 'Student added. Remember to save changes!';
    } else {
      this.updateMessage = 'Student is already assigned.';
    }

    this.selectedStudentUid = '';
  }

  removeStudent(uid: string): void {
    if (!this.course) return;
    const student = this.allStudentsList.find(s => s.uid === uid);
    const email   = student?.email || uid;

    if (this.course.assignedStudents.includes(uid)) {
      this.course.assignedStudents = this.course.assignedStudents.filter(s => s !== uid);

      this.loggingService.log(
        'professor-course-detail',
        `Removed student ${email} from "${this.course!.name}"`
      );
      this.updateMessage = 'Student removed. Don’t forget to save!';
    }
  }

  updateStudentAttendance(uid: string, value: string): void {
    if (!this.course) return;
    const num = Number(value);
    if (!isNaN(num)) {
      const student = this.allStudentsList.find(s => s.uid === uid);
      const email   = student?.email || uid;

      this.course.attendanceRecords![uid] = num;

      this.loggingService.log(
        'professor-course-detail',
        `Set attendance ${num}% for ${email} in "${this.course!.name}"`
      );
    }
  }

  saveCourseChanges(): void {
    if (!this.course?.id) return;
    const updates: Partial<Course> = {
      name             : this.course.name,
      description      : this.course.description,
      assignedStudents : this.course.assignedStudents,
      attendanceRecords: this.course.attendanceRecords
    };

    this.courseService.updateCourse(this.course.id, updates).subscribe({
      next: () => {
        this.updateMessage = 'Changes saved successfully!';
        this.loggingService.log(
          'professor-course-detail',
          `Saved changes to "${this.course!.name}"`
        );
      },
      error: err => {
        console.error('Update Course Error:', err);
        this.loggingService.log(
          'professor-course-detail',
          `Error saving changes for ${this.course!.id}: ${err.message || err}`
        );
        this.updateMessage = 'Error saving changes.';
      }
    });
  }

  goBack(): void {
    this.loggingService.log(
      'professor-course-detail',
      'Navigated back to professor dashboard'
    );
    this.router.navigate(['/professor-dashboard']);
  }
}
