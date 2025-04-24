// src/app/services/course.service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
  collectionData
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * A Course now holds, for each student UID,
 * an array of 7 booleans (one per session).
 */
export interface Course {
  id?: string;                             // Firestore doc ID
  name: string;
  description: string;
  assignedStudents: string[];              // student UIDs
  attendanceRecords?: { [uid: string]: boolean[] };
  professorId?: string;                    // assigned professor UID
  createdBy: string;                       // who created the course
  createdAt: any;                          // server timestamp
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  constructor(private firestore: Firestore) {}

  /** Create a new course */
  createCourse(course: Course): Observable<void> {
    const ref = collection(this.firestore, 'courses');
    return from(
      addDoc(ref, { ...course, createdAt: serverTimestamp() })
    ).pipe(map(() => void 0));
  }

  /** Get all courses (for admin) */
  getAllCourses(): Observable<Course[]> {
    return collectionData(
      collection(this.firestore, 'courses'),
      { idField: 'id' }
    ) as Observable<Course[]>;
  }

  /** Get courses this professor created */
  getCourses(professorId: string): Observable<Course[]> {
    const q = query(
      collection(this.firestore, 'courses'),
      where('createdBy', '==', professorId)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Course[]>;
  }

  /** Get courses assigned to a specific professor */
  getCoursesAssignedToProfessor(uid: string): Observable<Course[]> {
    const q = query(
      collection(this.firestore, 'courses'),
      where('professorId', '==', uid)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Course[]>;
  }

  /** Get courses where the student is in assignedStudents */
  getCoursesForStudent(uid: string): Observable<Course[]> {
    const q = query(
      collection(this.firestore, 'courses'),
      where('assignedStudents', 'array-contains', uid)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Course[]>;
  }

  /** Fetch a single course by ID */
  getCourseById(id: string): Observable<Course> {
    return from(getDoc(doc(this.firestore, `courses/${id}`))).pipe(
      map(snap => {
        if (!snap.exists()) throw new Error('Course not found');
        const data = snap.data() as Course;
        data.id = snap.id;
        return data;
      })
    );
  }

  /** Update an existing course */
  updateCourse(id: string, updates: Partial<Course>): Observable<void> {
    return from(updateDoc(doc(this.firestore, `courses/${id}`), updates));
  }

  /** Delete a course */
  deleteCourse(id: string): Observable<void> {
    return from(deleteDoc(doc(this.firestore, `courses/${id}`)));
  }
}
