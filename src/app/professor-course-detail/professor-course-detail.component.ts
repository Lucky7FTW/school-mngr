// src/app/professor-course-detail/professor-course-detail.component.ts
import { Component, OnInit }   from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { Observable }          from 'rxjs';
import { Store }               from '@ngrx/store';
import { Auth }                from '@angular/fire/auth';

import { CourseService, Course } from '../services/course.service';
import { UserService,   User   } from '../services/user.service';
import { FilterUidPipe }        from '../pipes/filter-uid.pipe';
import { addLogStart }          from '../log/log.actions';   // ← log action

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

  selectedStudentUid = '';
  updateMessage = '';

  constructor(
    private route : ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private userService  : UserService,
    private store : Store,                 // ← inject Store
    private auth  : Auth                   // ← to get current UID
  ) {}

  /* ───────── INITIAL LOAD ───────── */
  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (!courseId) { this.router.navigate(['/professor-dashboard']); return; }
    this.loadCourse(courseId);
    this.allStudents$ = this.userService.getStudents();
  }

  private loadCourse(courseId: string): void {
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        if (!course) { this.router.navigate(['/professor-dashboard']); return; }
        this.course = {
          ...course,
          assignedStudents : course.assignedStudents ?? [],
          attendanceRecords: course.attendanceRecords ?? {}
        };
      },
      error: err => {
        console.error(err);
        this.router.navigate(['/professor-dashboard']);
      }
    });
  }

  /* ───────── ADD STUDENT ───────── */
  addSelectedStudent(): void {
    if (!this.course) return;
    if (!this.selectedStudentUid) { this.updateMessage = 'Please select a student.'; return; }

    if (!this.course.assignedStudents.includes(this.selectedStudentUid)) {
      this.course.assignedStudents.push(this.selectedStudentUid);
      this.course.attendanceRecords![this.selectedStudentUid] ??= 0;

      /* LOG */
      this.dispatchLog(`Invited student ${this.selectedStudentUid} to course "${this.course.name}"`);
      this.updateMessage = 'Student added. Remember to save changes!';
    } else {
      this.updateMessage = 'Student is already assigned.';
    }
    this.selectedStudentUid = '';
  }

  /* ───────── REMOVE STUDENT ───────── */
  removeStudent(uid: string): void {
    if (!this.course) return;
    if (this.course.assignedStudents.includes(uid)) {
      this.course.assignedStudents = this.course.assignedStudents.filter(s => s !== uid);

      /* LOG */
      this.dispatchLog(`Removed student ${uid} from course "${this.course.name}"`);
      this.updateMessage = 'Student removed. Don’t forget to save!';
    }
  }

  /* ───────── UPDATE ATTENDANCE ───────── */
  updateStudentAttendance(uid: string, value: string): void {
    if (!this.course) return;
    const num = Number(value);
    if (!isNaN(num)) {
      this.course.attendanceRecords![uid] = num;
      /* optional: log every change */
      this.dispatchLog(`Set attendance ${num}% for ${uid} in "${this.course.name}"`);
    }
  }

  /* ───────── SAVE CHANGES ───────── */
  saveCourseChanges(): void {
    if (!this.course?.id) return;
    const updates: Partial<Course> = {
      name: this.course.name,
      description: this.course.description,
      assignedStudents : this.course.assignedStudents,
      attendanceRecords: this.course.attendanceRecords
    };

    this.courseService.updateCourse(this.course.id, updates).subscribe({
      next: () => {
        this.updateMessage = 'Changes saved successfully!';

        /* LOG success save */
        this.dispatchLog(`Saved changes to course "${this.course!.name}"`);
      },
      error: err => {
        console.error(err);
        this.updateMessage = 'Error saving changes.';
      }
    });
  }

  /* ───────── NAVIGATION ───────── */
  goBack(): void { this.router.navigate(['/professor-dashboard']); }

  /* ───────── HELPER: dispatch a log entry ───────── */
  private dispatchLog(command: string){
    this.store.dispatch(addLogStart({
      entry:{
        page   : 'professor-course-detail',
        command,
        userUid: this.auth.currentUser?.uid ?? 'anon'
      }
    }));
  }
}
