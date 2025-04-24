// src/app/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit }        from '@angular/core';
import { CommonModule }              from '@angular/common';
import { FormsModule }               from '@angular/forms';
import { Router }                    from '@angular/router';
import { Auth }                      from '@angular/fire/auth';
import { Observable }                from 'rxjs';

import { CourseService, Course }     from '../services/course.service';
import { UserService, User }         from '../services/user.service';
import { LogService, LogEntry }      from '../services/log.service';

@Component({
  selector   : 'app-admin-dashboard',
  standalone : true,
  imports    : [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls  : ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // ───────── Create-Course modal state ─────────
  isCreateCourseModalOpen = false;
  courseName             = '';
  courseDescription      = '';
  selectedProfessorUid   = '';
  createCourseMessage    = '';

  // ───────── Edit-Course modal state ─────────
  isEditCourseModalOpen   = false;
  editCourseId            = '';
  editCourseName          = '';
  editCourseDescription   = '';
  editProfessorUid        = '';
  editCourseMessage       = '';

  // ───────── Delete-Confirm modal state ─────────
  courseToDeleteId   : string | null = null;
  courseToDeleteName = '';

  // ───────── Data streams ─────────
  professors$!: Observable<User[]>;
  courses$!   : Observable<Course[]>;
  // map professor UID → email
  professorEmailMap: Record<string,string> = {};

  constructor(
    private auth      : Auth,
    private router    : Router,
    private courseSvc : CourseService,
    private userSvc   : UserService,
    private logSvc    : LogService
  ) {}

  ngOnInit(): void {
    // load professors & build map
    this.professors$ = this.userSvc.getProfessors();
    this.professors$.subscribe(list =>
      list.forEach(p => this.professorEmailMap[p.uid] = p.email)
    );
    this.refreshCourses();
  }

  private refreshCourses() {
    this.courses$ = this.courseSvc.getAllCourses();
  }

  /** Helper: write a log entry including userUid + userEmail */
  private log(page: string, command: string) {
    const user = this.auth.currentUser;
    const entry: Omit<LogEntry, 'id' | 'createdAt'> = {
      page,
      command,
      userUid:   user?.uid   ?? 'anon',
      userEmail: user?.email ?? 'unknown'
    };
    this.logSvc.addLog(entry)
      .subscribe({ error: err => console.error('Log error:', err) });
  }

  // ───────── Logout ─────────
  onLogout() {
    this.auth.signOut().then(() => {
      this.log('admin-dashboard', 'Logged out');
      this.router.navigate(['/login']);
    });
  }

  // ───────── Create Course ─────────
  openCreateCourseModal()  { this.isCreateCourseModalOpen = true; }
  closeCreateCourseModal() { this.isCreateCourseModalOpen = false; }

  createCourse() {
    if (!this.courseName.trim()
     || !this.courseDescription.trim()
     || !this.selectedProfessorUid) {
      this.createCourseMessage = 'Please fill out all fields.';
      return;
    }
    const payload: Course = {
      name             : this.courseName,
      description      : this.courseDescription,
      assignedStudents : [],
      attendanceRecords: {},
      professorId      : this.selectedProfessorUid,
      createdBy        : this.auth.currentUser?.uid ?? 'admin',
      createdAt        : null
    };
    this.courseSvc.createCourse(payload).subscribe({
      next: () => {
        this.log(
          'admin-dashboard',
          `Created course "${payload.name}" for professor ${this.professorEmailMap[payload.professorId!]!}`
        );
        this.closeCreateCourseModal();
        this.courseName = this.courseDescription = this.selectedProfessorUid = '';
        this.refreshCourses();
      },
      error: e => {
        console.error(e);
        this.createCourseMessage = 'Error creating course.';
      }
    });
  }

  // ───────── Edit Course ─────────
  openEditCourseModal(c: Course) {
    this.isEditCourseModalOpen   = true;
    this.editCourseId            = c.id!;
    this.editCourseName          = c.name;
    this.editCourseDescription   = c.description;
    this.editProfessorUid        = c.professorId ?? '';
    this.editCourseMessage       = '';
    this.log(
      'admin-dashboard',
      `Opened edit for "${c.name}" (${c.id})`
    );
  }
  closeEditCourseModal() {
    this.isEditCourseModalOpen = false;
  }

  saveEditedCourse() {
    if (!this.editCourseName.trim()
     || !this.editCourseDescription.trim()
     || !this.editProfessorUid) {
      this.editCourseMessage = 'Please fill out all fields.';
      return;
    }
    const updates: Partial<Course> = {
      name       : this.editCourseName,
      description: this.editCourseDescription,
      professorId: this.editProfessorUid
    };
    this.courseSvc.updateCourse(this.editCourseId, updates).subscribe({
      next: () => {
        this.log(
          'admin-dashboard',
          `Saved edits for "${this.editCourseName}" (${this.editCourseId})`
        );
        this.closeEditCourseModal();
        this.refreshCourses();
      },
      error: e => {
        console.error(e);
        this.editCourseMessage = 'Error saving changes.';
      }
    });
  }

  // ───────── Delete Course ─────────
  promptDelete(course: Course) {
    this.courseToDeleteId   = course.id!;
    this.courseToDeleteName = course.name;
  }
  cancelDelete() {
    this.courseToDeleteId   = null;
    this.courseToDeleteName = '';
  }

  confirmDelete() {
    if (!this.courseToDeleteId) return;
    this.courseSvc.deleteCourse(this.courseToDeleteId).subscribe({
      next: () => {
        this.log(
          'admin-dashboard',
          `Deleted course "${this.courseToDeleteName}"`
        );
        this.refreshCourses();
        this.courseToDeleteId   = null;
        this.courseToDeleteName = '';
      },
      error: e => {
        console.error(e);
        alert('Delete failed');
        this.courseToDeleteId   = null;
        this.courseToDeleteName = '';
      }
    });
  }
}
