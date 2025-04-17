// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth,  getAuth  } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { AppComponent }  from './app/app.component';
import { routes }        from './app/app.routes';
import { firebaseConfig } from './environments/firebase.config';

import { reducers }     from './app/store/index';
import { AuthEffects }  from './app/store/auth.effects';
import { LogEffects }   from './app/log/log.effects';

bootstrapApplication(AppComponent, {
  providers: [
    /* ───────── routing & Firebase ───────── */
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(()        => getAuth()),
    provideFirestore(()   => getFirestore()),

    /* ───────── NgRx store & effects ─────── */
    provideStore(reducers),
    provideEffects([
      AuthEffects,
      LogEffects         
    ])
  ]
}).catch(err => console.error('Bootstrap Error:', err));
