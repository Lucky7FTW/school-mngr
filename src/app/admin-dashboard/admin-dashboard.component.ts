// src/app/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit }   from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormsModule }          from '@angular/forms';
import { Router }               from '@angular/router';
import { Auth }                 from '@angular/fire/auth';
import { Observable }           from 'rxjs';

import { CourseService, Course } from '../services/course.service';
import { UserService, User }     from '../services/user.service';
import { LoggingService }        from '../services/logging.service';

@Component({
  selector   : 'app-admin-dashboard',
  standalone : true,
  imports    : [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls  : ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  /* ─── create/edit modal state ─── */
  isCreateCourseModalOpen = false;
  courseName       = '';
  courseDescription= '';
  selectedProfessorUid = '';
  createCourseMessage  = '';

  isEditCourseModalOpen   = false;
  editCourseId            = '';
  editCourseName          = '';
  editCourseDescription   = '';
  editProfessorUid        = '';
  editCourseMessage       = '';

  /* ─── delete confirm state ─── */
  courseToDeleteId   : string | null = null;
  courseToDeleteName : string       = '';

  /* ─── data streams ─── */
  professors$!: Observable<User[]>;
  courses$!   : Observable<Course[]>;
  professorEmailMap: Record<string,string> = {};

  constructor(
    private auth           : Auth,
    private router         : Router,
    private courseSvc      : CourseService,
    private userSvc        : UserService,
    private loggingService : LoggingService
  ) {}

  ngOnInit(): void {
    this.professors$ = this.userSvc.getProfessors();
    this.professors$.subscribe(list =>
      list.forEach(p => this.professorEmailMap[p.uid] = p.email)
    );
    this.refreshCourses();
  }

  private refreshCourses() {
    this.courses$ = this.courseSvc.getAllCourses();
  }

  /* ───── Logout ───── */
  onLogout() {
    this.auth.signOut().then(()=>{
      this.loggingService.log('admin-dashboard','Logged out');
      this.router.navigate(['/login']);
    });
  }

  /* ───── Create ───── */
  openCreateCourseModal()  { this.isCreateCourseModalOpen = true;  }
  closeCreateCourseModal() { this.isCreateCourseModalOpen = false; }

  createCourse() {
    if (!this.courseName.trim() || !this.courseDescription.trim() || !this.selectedProfessorUid) {
      this.createCourseMessage = 'Please fill out all fields.'; return;
    }
    const payload: Course = {
      name              : this.courseName,
      description       : this.courseDescription,
      assignedStudents  : [],
      attendanceRecords : {},
      professorId       : this.selectedProfessorUid,
      createdBy         : 'admin',
      createdAt         : null
    };
    this.courseSvc.createCourse(payload).subscribe({
      next: () => {
        this.loggingService.log(
          'admin-dashboard',
          `Created course "${payload.name}" for professor ${payload.professorId}`
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

  /* ───── Edit ───── */
  openEditCourseModal(c: Course) {
    this.isEditCourseModalOpen   = true;
    this.editCourseId            = c.id!;
    this.editCourseName          = c.name;
    this.editCourseDescription   = c.description;
    this.editProfessorUid        = c.professorId ?? '';
    this.editCourseMessage       = '';

    this.loggingService.log(
      'admin-dashboard',
      `Opened edit modal for "${c.name}" (${c.id})`
    );
  }
  closeEditCourseModal() { this.isEditCourseModalOpen = false; }

  saveEditedCourse() {
    if (!this.editCourseName.trim() || !this.editCourseDescription.trim() || !this.editProfessorUid) {
      this.editCourseMessage = 'Please fill out all fields.'; return;
    }
    const updates: Partial<Course> = {
      name       : this.editCourseName,
      description: this.editCourseDescription,
      professorId: this.editProfessorUid
    };
    this.courseSvc.updateCourse(this.editCourseId, updates).subscribe({
      next: () => {
        this.loggingService.log(
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

  /* ───── Delete ───── */
  // Now accept the entire Course, so we can capture its name.
  promptDelete(c: Course) {
    this.courseToDeleteId   = c.id!;
    this.courseToDeleteName = c.name;
  }
  cancelDelete() {
    this.courseToDeleteId   = null;
    this.courseToDeleteName = '';
  }
  confirmDelete() {
    if (!this.courseToDeleteId) return;
    this.courseSvc.deleteCourse(this.courseToDeleteId).subscribe({
      next: () => {
        this.loggingService.log(
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
