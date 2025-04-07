// src/app/services/course.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  collectionData
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

export interface Course {
  id?: string;
  name: string;
  description: string;
  assignedStudents: string[];              // array of student UIDs
  attendanceRecords?: { [studentUid: string]: number }; // e.g., { 'uidA': 80, 'uidB': 90 }
  createdBy: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private firestore: Firestore) {}

  createCourse(course: Course): Observable<any> {
    const coursesRef = collection(this.firestore, 'courses');
    return from(
      addDoc(coursesRef, {
        ...course,
        createdAt: serverTimestamp()
      })
    );
  }

  updateCourse(courseId: string, updates: Partial<Course>): Observable<void> {
    const courseDoc = doc(this.firestore, `courses/${courseId}`);
    return from(updateDoc(courseDoc, updates));
  }

  getCourses(professorId: string): Observable<Course[]> {
    const coursesRef = collection(this.firestore, 'courses');
    const q = query(coursesRef, where('createdBy', '==', professorId));
    return collectionData(q, { idField: 'id' }) as Observable<Course[]>;
  }
}
