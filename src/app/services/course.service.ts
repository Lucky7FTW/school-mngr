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
  query,
  where,
  collectionData,
  serverTimestamp
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Course document shape stored in Firestore */
export interface Course {
  id?: string;                                 // document ID (added by idField)
  name: string;
  description: string;
  assignedStudents: string[];                  // array of student UIDs
  attendanceRecords?: { [uid: string]: number };
  professorId?: string;                        // assigned professor UID
  createdBy: string;                           // UID of the user who created it
  createdAt: any;                              // Firestore timestamp
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  constructor(private firestore: Firestore) {}

  /* ───────── Create ───────── */
  createCourse(course: Course): Observable<void> {
    const ref = collection(this.firestore, 'courses');
    return from(
      addDoc(ref, { ...course, createdAt: serverTimestamp() })
    ).pipe(map(() => void 0));
  }

  /* ───────── Read ───────── */
  /** All courses (admin) */
  getAllCourses(): Observable<Course[]> {
    return collectionData(
      collection(this.firestore, 'courses'),
      { idField: 'id' }
    ) as Observable<Course[]>;
  }

  /** Courses created by a professor (legacy use) */
  getCourses(professorId: string): Observable<Course[]> {
    const q = query(
      collection(this.firestore, 'courses'),
      where('createdBy', '==', professorId)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Course[]>;
  }

  /** Courses assigned to a professor */
  getCoursesAssignedToProfessor(uid: string): Observable<Course[]> {
    const q = query(
      collection(this.firestore, 'courses'),
      where('professorId', '==', uid)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Course[]>;
  }

  /** Courses where student UID appears in assignedStudents[] */
  getCoursesForStudent(uid: string): Observable<Course[]> {
    const q = query(
      collection(this.firestore, 'courses'),
      where('assignedStudents', 'array-contains', uid)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Course[]>;
  }

  /** Single course by document ID */
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

  /* ───────── Update ───────── */
  updateCourse(id: string, updates: Partial<Course>): Observable<void> {
    return from(updateDoc(doc(this.firestore, `courses/${id}`), updates));
  }

  /* ───────── Delete ───────── */
  deleteCourse(id: string): Observable<void> {
    return from(deleteDoc(doc(this.firestore, `courses/${id}`)));
  }
}
