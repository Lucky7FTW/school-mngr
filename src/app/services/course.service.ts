// src/app/services/course.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

export interface Course {
  id?: string;
  name: string;
  description: string;
  assignedStudents: string[];
  createdBy: string;
  createdAt: any; // Firestore timestamp
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private firestore: Firestore) {}

  createCourse(course: Course): Observable<any> {
    const coursesCollection = collection(this.firestore, 'courses');
    return from(
      addDoc(coursesCollection, {
        name: course.name,
        description: course.description,
        assignedStudents: course.assignedStudents,
        createdBy: course.createdBy,
        createdAt: serverTimestamp()
      })
    );
  }
}
