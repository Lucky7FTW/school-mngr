// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  collectionData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface User {
  uid: string;
  email: string;
  role: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: Firestore) {}

  // Only fetch users with role 'student'
  getStudents(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', 'student'));
    return collectionData(q, { idField: 'uid' }) as Observable<User[]>;
  }
}
