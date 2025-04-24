// src/app/professor-course-detail/professor-course-detail.component.ts
import { Component, OnInit }          from '@angular/core';
import { ActivatedRoute, Router }     from '@angular/router';
import { CommonModule }               from '@angular/common';
import { FormsModule }                from '@angular/forms';
import { Observable }                 from 'rxjs';
import { Auth }                       from '@angular/fire/auth';

import { CourseService, Course }      from '../services/course.service';
import { UserService,  User }         from '../services/user.service';
import { LogService,   LogEntry }     from '../services/log.service';

@Component({
  selector   : 'app-professor-course-detail',
  standalone : true,
  imports    : [CommonModule, FormsModule],
  templateUrl: './professor-course-detail.component.html',
  styleUrls  : ['./professor-course-detail.component.css']
})
export class ProfessorCourseDetailComponent implements OnInit {

  /* ---------- state ---------- */
  course: Course | null = null;

  allStudents$!: Observable<User[]>;           // async pipe in template
  private allStudentsList: User[] = [];        // in-memory lookup

  selectedStudentUid = '';
  updateMessage      = '';

  /** indices 0-6 -> “session 1 … 7” */
  readonly sessions = Array.from({ length: 7 }, (_, i) => i);

  constructor(
    private route     : ActivatedRoute,
    private router    : Router,
    private courseSvc : CourseService,
    private userSvc   : UserService,
    private auth      : Auth,
    private logSvc    : LogService
  ) {}

  /* ---------- init ---------- */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/professor-dashboard']); return; }

    this.loadCourse(id);

    /* keep a local copy of all students so we can resolve e-mails quickly */
    this.allStudents$ = this.userSvc.getStudents();
    this.allStudents$.subscribe(list => (this.allStudentsList = list));

    this.writeLog('professor-course-detail', `Opened detail of course ${id}`);
  }

  /* ---------- helpers ---------- */
  /** maps UID → email (falls back to UID) */
  getStudentEmail(uid: string): string {
    return this.allStudentsList.find(s => s.uid === uid)?.email ?? uid;
  }

  private loadCourse(id: string): void {
    this.courseSvc.getCourseById(id).subscribe({
      next: c => {
        this.course = {
          ...c,
          assignedStudents : c.assignedStudents  ?? [],
          attendanceRecords: c.attendanceRecords ?? {}
        };
      },
      error: err => {
        console.error(err);
        this.writeLog('professor-course-detail', `Load error: ${err}`);
        this.router.navigate(['/professor-dashboard']);
      }
    });
  }

  /* ---------- student actions ---------- */
  addSelectedStudent(): void {
    if (!this.course || !this.selectedStudentUid) {
      this.updateMessage = 'Please select a student.'; return;
    }

    const uid   = this.selectedStudentUid;
    const email = this.getStudentEmail(uid);

    if (!this.course.assignedStudents.includes(uid)) {
      this.course.assignedStudents.push(uid);
      this.course.attendanceRecords![uid] = Array(7).fill(false);
      this.writeLog('professor-course-detail', `Invited ${email}`);
      this.updateMessage = 'Student added – remember to save.';
    } else {
      this.updateMessage = 'Student already assigned.';
    }
    this.selectedStudentUid = '';
  }

  removeStudent(uid: string): void {
    if (!this.course) return;
    const email = this.getStudentEmail(uid);

    this.course.assignedStudents =
      this.course.assignedStudents.filter(s => s !== uid);
    delete this.course.attendanceRecords![uid];

    this.writeLog('professor-course-detail', `Removed ${email}`);
    this.updateMessage = 'Student removed – remember to save.';
  }

  toggleAttendance(uid: string, idx: number, present: boolean): void {
    if (!this.course) return;
    this.course.attendanceRecords![uid][idx] = present;

    const email = this.getStudentEmail(uid);
    this.writeLog(
      'professor-course-detail',
      `Marked ${email} as ${present ? 'present' : 'absent'} for session ${idx + 1}`
    );
  }

  /* ---------- save ---------- */
  saveCourseChanges(): void {
    if (!this.course?.id) return;
    const { assignedStudents, attendanceRecords } = this.course;

    this.courseSvc.updateCourse(this.course.id, { assignedStudents, attendanceRecords })
      .subscribe({
        next : () => {
          this.updateMessage = 'Changes saved!';
          this.writeLog('professor-course-detail', 'Saved changes');
        },
        error: err => {
          console.error(err);
          this.updateMessage = 'Save failed';
        }
      });
  }

  /* ---------- navigation ---------- */
  goBack(): void { this.router.navigate(['/professor-dashboard']); }

  /* ---------- logging ---------- */
  private writeLog(page: string, command: string) {
    const entry: Omit<LogEntry, 'id' | 'createdAt'> = {
      page,
      command,
      userUid: this.auth.currentUser?.uid ?? 'anon'
    };
    this.logSvc.addLog(entry).subscribe();      // fire-and-forget
  }
}
