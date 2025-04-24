// src/app/professor-course-detail/professor-course-detail.component.ts
import { Component, OnInit }        from '@angular/core';
import { ActivatedRoute, Router }   from '@angular/router';
import { CommonModule }             from '@angular/common';
import { FormsModule }              from '@angular/forms';
import { Observable }               from 'rxjs';
import { Auth }                     from '@angular/fire/auth';

import { CourseService, Course }    from '../services/course.service';
import { UserService, User }        from '../services/user.service';
import { FilterUidPipe }            from '../pipes/filter-uid.pipe';
import { LogService, LogEntry }     from '../services/log.service';

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
  private allStudentsList: User[] = [];

  selectedStudentUid = '';
  updateMessage     = '';

  constructor(
    private route       : ActivatedRoute,
    private router      : Router,
    private courseSvc   : CourseService,
    private userSvc     : UserService,
    private auth        : Auth,
    private logSvc      : LogService          // ← use LogService
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (!courseId) {
      this.router.navigate(['/professor-dashboard']);
      return;
    }

    // 1) load the course
    this.loadCourse(courseId);

    // 2) load & cache students
    this.allStudents$ = this.userSvc.getStudents();
    this.allStudents$.subscribe(list => this.allStudentsList = list);

    // 3) log page view
    this.writeLog('professor-course-detail', `Viewed course detail ${courseId}`);
  }

  private loadCourse(courseId: string) {
    this.courseSvc.getCourseById(courseId).subscribe({
      next: c => {
        if (!c) {
          this.router.navigate(['/professor-dashboard']);
          return;
        }
        this.course = {
          ...c,
          assignedStudents: c.assignedStudents  ?? [],
          attendanceRecords: c.attendanceRecords ?? {}
        };
      },
      error: err => {
        console.error('Error loading course', err);
        this.writeLog(
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

    const uid   = this.selectedStudentUid;
    const user  = this.allStudentsList.find(s => s.uid === uid);
    const email = user?.email ?? uid;

    if (!this.course.assignedStudents.includes(uid)) {
      this.course.assignedStudents.push(uid);
      this.course.attendanceRecords![uid] ??= 0;

      this.writeLog(
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
    const user  = this.allStudentsList.find(s => s.uid === uid);
    const email = user?.email ?? uid;

    if (this.course.assignedStudents.includes(uid)) {
      this.course.assignedStudents = this.course.assignedStudents.filter(s => s !== uid);
      this.writeLog(
        'professor-course-detail',
        `Removed student ${email} from "${this.course.name}"`
      );
      this.updateMessage = 'Student removed. Don’t forget to save!';
    }
  }

  updateStudentAttendance(uid: string, value: string): void {
    if (!this.course) return;
    const num = Number(value);
    if (isNaN(num)) return;

    const user  = this.allStudentsList.find(s => s.uid === uid);
    const email = user?.email ?? uid;

    this.course.attendanceRecords![uid] = num;
    this.writeLog(
      'professor-course-detail',
      `Set attendance ${num}% for ${email} in "${this.course.name}"`
    );
  }

  saveCourseChanges(): void {
    if (!this.course?.id) return;
    const updates: Partial<Course> = {
      name: this.course.name,
      description: this.course.description,
      assignedStudents: this.course.assignedStudents,
      attendanceRecords: this.course.attendanceRecords
    };

    this.courseSvc.updateCourse(this.course.id, updates).subscribe({
      next: () => {
        this.updateMessage = 'Changes saved successfully!';
        this.writeLog(
          'professor-course-detail',
          `Saved changes to "${this.course!.name}"`
        );
      },
      error: err => {
        console.error('Update Course Error:', err);
        this.writeLog(
          'professor-course-detail',
          `Error saving changes for ${this.course!.id}: ${err.message || err}`
        );
        this.updateMessage = 'Error saving changes.';
      }
    });
  }

  goBack(): void {
    this.writeLog(
      'professor-course-detail',
      'Navigated back to professor dashboard'
    );
    this.router.navigate(['/professor-dashboard']);
  }

  /**
   * Helper: wrap logSvc.addLog(...) so you don’t repeat boilerplate
   */
  private writeLog(page: string, command: string) {
    const entry: Omit<LogEntry, 'id' | 'createdAt'> = {
      page,
      command,
      userUid: this.auth.currentUser?.uid ?? 'anon',
      userEmail: this.auth.currentUser?.email ?? undefined
    };
    this.logSvc.addLog(entry).subscribe();
  }
}
