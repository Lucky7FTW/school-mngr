// src/app/services/log.service.ts
//-------------------------------------------------------------
// A tiny wrapper around Firestore for writing / streaming logs
//-------------------------------------------------------------
import { Injectable } from '@angular/core';
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

/** Shape of a single log entry stored in `/logs/{logId}` */
export interface LogEntry {
  id?: string;      // <-- document ID (injected by { idField:'id' })
  page: string;     // e.g. "admin-dashboard", "professor-course-detail"
  command: string;  // short description: "Create course X", "Delete course Y"
  userUid: string;  // UID of the user who triggered the action
  createdAt: any;   // Firestore timestamp (serverTimestamp)
}

@Injectable({ providedIn: 'root' })
export class LogService {
  constructor(private fs: Firestore) {}

  //---------------------------------------------------------------------------
  // addLog  ➜  write one log entry (fire‑and‑forget)
  //---------------------------------------------------------------------------
  addLog(entry: Omit<LogEntry, 'id' | 'createdAt'>) {
    return from(
      addDoc(collection(this.fs, 'logs'), {
        ...entry,
        createdAt: serverTimestamp()
      })
    );
  }

  getLogs(page: string, userUid?: string): Observable<LogEntry[]> {
    let q = query(
      collection(this.fs, 'logs'),
      where('page', '==', page),
      orderBy('createdAt', 'desc')
    );

    // If a specific user's history is desired, add a second filter:
    if (userUid) {
      q = query(q, where('userUid', '==', userUid));
    }

    // `idField:'id'` maps Firestore doc.id onto the `id` property
    return collectionData(q, { idField: 'id' }) as Observable<LogEntry[]>;
  }
}
