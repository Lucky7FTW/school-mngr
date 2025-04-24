// ────────────────────────────────────────────────────────────────
// src/app/professor-course-detail/professor-course-detail.component.ts
// ────────────────────────────────────────────────────────────────
import { Component, OnInit }           from '@angular/core';
import { ActivatedRoute, Router }      from '@angular/router';
import { CommonModule }                from '@angular/common';
import { FormsModule }                 from '@angular/forms';
import { Observable }                  from 'rxjs';
import { Auth }                        from '@angular/fire/auth';

import { CourseService, Course }       from '../services/course.service';
import { UserService,   User }         from '../services/user.service';
import { LogService,    LogEntry }     from '../services/log.service';

import { AttendanceGridComponent } from '../grid/attendance-grid.component';

/* ------ optional: Ag-Grid row model (used if you render <app-attendance-grid>) */
export interface GridRow {
  student: string;
  s1: boolean; s2: boolean; s3: boolean;
  s4: boolean; s5: boolean; s6: boolean; s7: boolean;
}

@Component({
  selector   : 'app-professor-course-detail',
  standalone : true,
  imports    : [CommonModule, FormsModule,AttendanceGridComponent],
  templateUrl: './professor-course-detail.component.html',
  styleUrls  : ['./professor-course-detail.component.css']
})
export class ProfessorCourseDetailComponent implements OnInit {

  /* ───────── page state ───────── */
  course: Course | null = null;

  allStudents$!: Observable<User[]>;       // bound with | async
  private allStudentsList: User[] = [];    // fast UID → email look-up

  selectedStudentUid = '';
  updateMessage      = '';

  /** index helper [0 … 6] used by ngFor in template */
  readonly sessions = Array.from({ length: 7 }, (_, i) => i);

  /** data for <app-attendance-grid> (if you switch from the plain table) */
  rowData: GridRow[] = [];

  // ─────────────────────────────────────────────────────────────
  constructor(
    private route     : ActivatedRoute,
    private router    : Router,
    private courseSvc : CourseService,
    private userSvc   : UserService,
    private auth      : Auth,
    private logSvc    : LogService
  ) {}
  // ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/professor-dashboard']); return; }

    this.loadCourse(id);

    /* cache every student once for quick e-mail lookup */
    this.allStudents$ = this.userSvc.getStudents();
    this.allStudents$.subscribe(list => (this.allStudentsList = list));

    this.writeLog('professor-course-detail', `Opened course ${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // helpers
  // ─────────────────────────────────────────────────────────────
  /** convert UID ⇒ e-mail (fallback UID) */
  getStudentEmail(uid: string): string {
    return this.allStudentsList.find(s => s.uid === uid)?.email ?? uid;
  }

  /** query Firestore and normalise the course object */
  private loadCourse(id: string): void {
    this.courseSvc.getCourseById(id).subscribe({
      next: c => {
        this.course = {
          ...c,
          assignedStudents : c.assignedStudents  ?? [],
          attendanceRecords: c.attendanceRecords ?? {}
        };
        this.ensureArrays();   // make sure each student has a 7-slot array
        this.rebuildGrid();
      },
      error: err => {
        console.error(err);
        this.writeLog('professor-course-detail', `Load error: ${err}`);
        this.router.navigate(['/professor-dashboard']);
      }
    });
  }

  /** guarantees every student has an attendance array of length 7 */
  private ensureArrays(): void {
    if (!this.course) return;
    for (const uid of this.course.assignedStudents) {
      if (!Array.isArray(this.course.attendanceRecords![uid])) {
        this.course.attendanceRecords![uid] = Array(7).fill(false);
      }
    }
  }

  /** builds `rowData` for an Ag-Grid table (optional) */
  private rebuildGrid(): void {
    if (!this.course) { this.rowData = []; return; }

    this.rowData = this.course.assignedStudents.map(uid => {
      const rec = this.course!.attendanceRecords![uid];
      return {
        student: this.getStudentEmail(uid),
        s1: rec[0], s2: rec[1], s3: rec[2],
        s4: rec[3], s5: rec[4], s6: rec[5], s7: rec[6]
      };
    });
  }

  // ─────────────────────────────────────────────────────────────
  // student actions
  // ─────────────────────────────────────────────────────────────
  addSelectedStudent(): void {
    if (!this.course || !this.selectedStudentUid) {
      this.updateMessage = 'Please select a student.'; return;
    }
    const uid = this.selectedStudentUid;
    if (this.course.assignedStudents.includes(uid)) {
      this.updateMessage = 'Student already assigned.'; return;
    }

    this.course.assignedStudents.push(uid);
    this.course.attendanceRecords![uid] = Array(7).fill(false);
    this.rebuildGrid();

    this.writeLog('professor-course-detail', `Invited ${this.getStudentEmail(uid)}`);
    this.updateMessage = 'Student added – remember to save.';
    this.selectedStudentUid = '';
  }

  removeStudent(uid: string): void {
    if (!this.course) return;

    this.course.assignedStudents =
      this.course.assignedStudents.filter(s => s !== uid);
    delete this.course.attendanceRecords![uid];
    this.rebuildGrid();

    this.writeLog('professor-course-detail', `Removed ${this.getStudentEmail(uid)}`);
    this.updateMessage = 'Student removed – remember to save.';
  }

  toggleAttendance(uid: string, idx: number, present: boolean): void {
    if (!this.course) return;
    this.course.attendanceRecords![uid][idx] = present;
    this.rebuildGrid();

    this.writeLog(
      'professor-course-detail',
      `Marked ${this.getStudentEmail(uid)} as ${present ? 'present' : 'absent'} for S${idx + 1}`
    );
  }

  // ─────────────────────────────────────────────────────────────
  // persistence
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // navigation
  // ─────────────────────────────────────────────────────────────
  goBack(): void { this.router.navigate(['/professor-dashboard']); }

  // ─────────────────────────────────────────────────────────────
  // logging helper
  // ─────────────────────────────────────────────────────────────
  private writeLog(page: string, command: string): void {
    const entry: Omit<LogEntry, 'id' | 'createdAt'> = {
      page,
      command,
      userUid: this.auth.currentUser?.uid ?? 'anon'
    };
    this.logSvc.addLog(entry).subscribe();   // fire-and-forget
  }
}
