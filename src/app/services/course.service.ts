import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
  collectionData
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Course {
  id?: string;
  name: string;
  description: string;
  assignedStudents: string[]; 
  attendanceRecords?: { [studentUid: string]: number };
  professorId?: string;  
  createdBy: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private firestore: Firestore) {}

  /**
   * Create a new course document in 'courses' collection.
   */
  createCourse(course: Course): Observable<any> {
    const coursesRef = collection(this.firestore, 'courses');
    return from(
      addDoc(coursesRef, {
        ...course,
        createdAt: serverTimestamp()
      })
    );
  }

  /**
   * Update an existing course.
   */
  updateCourse(courseId: string, updates: Partial<Course>): Observable<void> {
    const courseDocRef = doc(this.firestore, `courses/${courseId}`);
    return from(updateDoc(courseDocRef, updates));
  }

  /**
   * Fetch courses by 'createdBy' (a professor's UID).
   */
  getCourses(professorId: string): Observable<Course[]> {
    const coursesRef = collection(this.firestore, 'courses');
    const qCourses = query(coursesRef, where('createdBy', '==', professorId));
    return collectionData(qCourses, { idField: 'id' }) as Observable<Course[]>;
  }

  /**
   * Fetch ALL courses in the system (admin usage).
   */
  getAllCourses(): Observable<Course[]> {
    const coursesRef = collection(this.firestore, 'courses');
    return collectionData(coursesRef, { idField: 'id' }) as Observable<Course[]>;
  }

  /**
   * Return only courses where 'professorId' = professorUid.
   */
  getCoursesAssignedToProfessor(professorUid: string): Observable<Course[]> {
    const coursesRef = collection(this.firestore, 'courses');
    const qCourses = query(coursesRef, where('professorId', '==', professorUid));
    return collectionData(qCourses, { idField: 'id' }) as Observable<Course[]>;
  }

  /**
   * NEW: Return courses where assignedStudents array includes studentUid.
   */
  getCoursesForStudent(studentUid: string): Observable<Course[]> {
    const coursesRef = collection(this.firestore, 'courses');
    // Use 'array-contains' to find docs where assignedStudents includes studentUid
    const qCourses = query(coursesRef, where('assignedStudents', 'array-contains', studentUid));
    return collectionData(qCourses, { idField: 'id' }) as Observable<Course[]>;
  }

  /**
   * Fetch a single course by ID from Firestore.
   */
  getCourseById(courseId: string): Observable<Course> {
    const courseDocRef = doc(this.firestore, `courses/${courseId}`);
    return from(getDoc(courseDocRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Course;
          data.id = snapshot.id;
          return data;
        } else {
          throw new Error('Course not found');
        }
      })
    );
  }
}
