// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  signUp(email: string, password: string, role: 'admin' | 'professor' | 'student'): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential: UserCredential) => {
        const uid = userCredential.user.uid;
        const userRef = doc(this.firestore, `users/${uid}`);
        return from(setDoc(userRef, {
          email,
          role,
          createdAt: new Date()
        })).pipe(
          map(() => userCredential)
        );
      })
    );
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  getUserRole(uid: string): Observable<string | null> {
    const userRef = doc(this.firestore, `users/${uid}`);
    return from(getDoc(userRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          return data && (data as any).role ? (data as any).role : null;
        } else {
          return null;
        }
      })
    );
  }

  logout(): Observable<void> {
    return from(this.auth.signOut());
  }
}
