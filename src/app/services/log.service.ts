// src/app/services/log.service.ts
//-------------------------------------------------------------
// A tiny wrapper around Firestore for writing/streaming logs
//-------------------------------------------------------------
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  collectionData,
  serverTimestamp
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

export interface LogEntry {
  id?: string;         // document ID (mapped by collectionData)
  page: string;        // e.g. "admin-dashboard"
  command: string;     // e.g. "Created course X"
  userUid: string;     // UID of the actor
  userEmail?: string;  // injected from Auth.currentUser.email
  createdAt: any;      // Firestore server timestamp
}

@Injectable({ providedIn: 'root' })
export class LogService {
  constructor(
    private fs: Firestore,
    private auth: Auth
  ) {}

  /**
   * Writes a log entry. Automatically adds `userEmail` and `createdAt`.
   * 
   * @param entry Omit<LogEntry, 'id' | 'createdAt' | 'userEmail'>
   */
  addLog(entry: Omit<LogEntry, 'id' | 'createdAt' | 'userEmail'>) {
    const user = this.auth.currentUser;
    const userEmail = user?.email ?? 'unknown';

    return from(
      addDoc(collection(this.fs, 'logs'), {
        ...entry,
        userEmail,
        createdAt: serverTimestamp()
      })
    );
  }

  /**
   * Streams logs for a given page, optionally filtered by userUid.
   */
  getLogs(page: string, userUid?: string): Observable<LogEntry[]> {
    let q = query(
      collection(this.fs, 'logs'),
      where('page', '==', page),
      orderBy('createdAt', 'desc')
    );
    if (userUid) {
      q = query(q, where('userUid', '==', userUid));
    }
    return collectionData(q, { idField: 'id' }) as Observable<LogEntry[]>;
  }
}
