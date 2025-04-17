import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Store } from '@ngrx/store';       
import { Observable } from 'rxjs';

import { CourseService, Course } from '../services/course.service';
import { UserService,  User   } from '../services/user.service';
import { addLogStart }        from '../log/log.actions'; 

@Component({
  selector   : 'app-admin-dashboard',
  standalone : true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls  : ['./admin-dashboard.component.css'],
  imports    : [CommonModule, FormsModule]
})
export class AdminDashboardComponent implements OnInit {

  /* modal + form state */
  isCreateCourseModalOpen = false;
  courseName = '';
  courseDescription = '';
  selectedProfessorUid = '';
  createCourseMessage = '';

  /* delete‑confirm state */
  courseToDeleteId: string | null = null;

  /* streams */
  professors$!: Observable<User[]>;
  courses$!   : Observable<Course[]>;
  professorEmailMap: Record<string,string> = {};

  constructor(
    private auth     : Auth,
    private router   : Router,
    private courseSvc: CourseService,
    private userSvc  : UserService,
    private store    : Store            
  ) {}

  ngOnInit(): void {
    this.professors$ = this.userSvc.getProfessors();
    this.professors$.subscribe(p =>
      p.forEach(prof => this.professorEmailMap[prof.uid] = prof.email)
    );
    this.courses$ = this.courseSvc.getAllCourses();
  }

  /* logout */
  onLogout(){
    this.auth.signOut().then(()=> this.router.navigate(['/login']));
  }

  /* open / close create modal */
  openCreateCourseModal(){ this.isCreateCourseModalOpen = true;  }
  closeCreateCourseModal(){ this.isCreateCourseModalOpen = false; }

  /* CREATE COURSE */
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
        /* ——— Fire a log entry ——— */
        this.store.dispatch(addLogStart({
          entry:{
            page   : 'admin-dashboard',
            command: `Created course "${payload.name}" for professor ${payload.professorId}`,
            userUid: this.auth.currentUser?.uid ?? 'anon'
          }
        }));

        /* reset UI */
        this.closeCreateCourseModal();
        this.courseName = this.courseDescription = this.selectedProfessorUid = '';
        this.courses$ = this.courseSvc.getAllCourses();
      },
      error: e => { console.error(e); this.createCourseMessage = 'Error.'; }
    });
  }

  /* DELETE COURSE */
  promptDelete(id:string){ this.courseToDeleteId = id; }
  cancelDelete(){          this.courseToDeleteId = null; }

  confirmDelete(){
    if (!this.courseToDeleteId) return;

    this.courseSvc.deleteCourse(this.courseToDeleteId).subscribe({
      next: () => {
        /* ——— Log deletion ——— */
        this.store.dispatch(addLogStart({
          entry:{
            page   : 'admin-dashboard',
            command: `Deleted course ${this.courseToDeleteId}`,
            userUid: this.auth.currentUser?.uid ?? 'anon'
          }
        }));

        this.courses$       = this.courseSvc.getAllCourses();
        this.courseToDeleteId = null;
      },
      error: e => { console.error(e); alert('Delete failed'); this.courseToDeleteId = null; }
    });
  }
}
