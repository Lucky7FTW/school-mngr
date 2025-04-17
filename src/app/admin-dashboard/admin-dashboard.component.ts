import { Component, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { Router }         from '@angular/router';
import { Auth }           from '@angular/fire/auth';
import { Store }          from '@ngrx/store';
import { Observable }     from 'rxjs';

import { CourseService, Course } from '../services/course.service';
import { UserService,   User   } from '../services/user.service';
import { addLogStart }           from '../log/log.actions';

@Component({
  selector   : 'app-admin-dashboard',
  standalone : true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls  : ['./admin-dashboard.component.css'],
  imports    : [CommonModule, FormsModule]
})
export class AdminDashboardComponent implements OnInit {

  /* ───────── create modal state ───────── */
  isCreateCourseModalOpen = false;
  courseName = '';
  courseDescription = '';
  selectedProfessorUid = '';
  createCourseMessage = '';

  /* ───────── edit modal state ───────── */
  isEditCourseModalOpen = false;
  editCourseId   = '';
  editCourseName = '';
  editCourseDescription = '';
  editProfessorUid = '';
  editCourseMessage = '';

  /* ───────── delete confirm state ───────── */
  courseToDeleteId: string | null = null;

  /* ───────── data streams ───────── */
  professors$!: Observable<User[]>;
  courses$!   : Observable<Course[]>;
  professorEmailMap: Record<string,string> = {};

  constructor(
    private auth : Auth,
    private router: Router,
    private courseSvc: CourseService,
    private userSvc  : UserService,
    private store    : Store
  ) {}

  /* ───────── init ───────── */
  ngOnInit(): void {
    this.professors$ = this.userSvc.getProfessors();
    this.professors$.subscribe(list =>
      list.forEach(p => this.professorEmailMap[p.uid] = p.email)
    );
    this.refreshCourses();
  }

  /* ───────── helpers ───────── */
  private refreshCourses() {
    this.courses$ = this.courseSvc.getAllCourses();
  }
  private dispatchLog(cmd:string){
    this.store.dispatch(addLogStart({
      entry:{
        page   : 'admin-dashboard',
        command: cmd,
        userUid: this.auth.currentUser?.uid ?? 'anon'
      }
    }));
  }

  /* ───────── logout ───────── */
  onLogout() { this.auth.signOut().then(()=> this.router.navigate(['/login'])); }

  /* ───────── CREATE COURSE ───────── */
  openCreateCourseModal(){ this.isCreateCourseModalOpen = true; this.createCourseMessage=''; }
  closeCreateCourseModal(){ this.isCreateCourseModalOpen = false; }

  createCourse(){
    if (!this.courseName.trim() || !this.courseDescription.trim() || !this.selectedProfessorUid){
      this.createCourseMessage = 'Please fill out all fields.'; return;
    }
    const payload: Course = {
      name : this.courseName,
      description: this.courseDescription,
      assignedStudents: [],
      attendanceRecords:{},
      professorId : this.selectedProfessorUid,
      createdBy   : 'admin',
      createdAt   : null
    };
    this.courseSvc.createCourse(payload).subscribe({
      next: () => {
        this.dispatchLog(`Created course "${payload.name}"`);
        this.closeCreateCourseModal();
        this.courseName=this.courseDescription=this.selectedProfessorUid='';
        this.refreshCourses();
      },
      error: e => { console.error(e); this.createCourseMessage='Error.'; }
    });
  }

  /* ───────── EDIT COURSE ───────── */
  openEditCourseModal(c: Course){
    this.isEditCourseModalOpen = true;
    this.editCourseId          = c.id!;
    this.editCourseName        = c.name;
    this.editCourseDescription = c.description;
    this.editProfessorUid      = c.professorId ?? '';
    this.editCourseMessage     = '';
  }
  closeEditCourseModal(){ this.isEditCourseModalOpen = false; }

  saveEditedCourse(){
    if (!this.editCourseName.trim() || !this.editCourseDescription.trim() || !this.editProfessorUid){
      this.editCourseMessage = 'Please fill out all fields.'; return;
    }
    const updates: Partial<Course> = {
      name       : this.editCourseName,
      description: this.editCourseDescription,
      professorId: this.editProfessorUid
    };
    this.courseSvc.updateCourse(this.editCourseId, updates).subscribe({
      next: () => {
        this.dispatchLog(`Edited course "${this.editCourseName}" (${this.editCourseId})`);
        this.closeEditCourseModal();
        this.refreshCourses();
      },
      error: e => { console.error(e); this.editCourseMessage='Error.'; }
    });
  }

  /* ───────── DELETE COURSE ───────── */
  promptDelete(id:string){ this.courseToDeleteId = id; }
  cancelDelete(){ this.courseToDeleteId = null; }

  confirmDelete(){
    if (!this.courseToDeleteId) return;
    this.courseSvc.deleteCourse(this.courseToDeleteId).subscribe({
      next: () => {
        this.dispatchLog(`Deleted course ${this.courseToDeleteId}`);
        this.refreshCourses();
        this.courseToDeleteId = null;
      },
      error: e => { console.error(e); alert('Delete failed'); this.courseToDeleteId=null; }
    });
  }
}
