import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, query, where, collectionData } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

export interface Course {
  id?: string;
  name: string;
  description: string;
  assignedStudents: string[];
  createdBy: string;
  createdAt: any;
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

  getCourses(professorId: string): Observable<Course[]> {
    const coursesCollection = collection(this.firestore, 'courses');
    const q = query(coursesCollection, where('createdBy', '==', professorId));
    return collectionData(q, { idField: 'id' }) as Observable<Course[]>;
  }
}
