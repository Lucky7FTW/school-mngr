// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { firebaseConfig } from './environments/firebase.config';

// Import NgRx
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

// Import the Auth reducer and effects
import { reducers } from './app/store/index';       
import { AuthEffects } from './app/store/auth.effects';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),

    // NgRx store
    provideStore(reducers),
    provideEffects([AuthEffects]),
  ]
}).catch(err => console.error("Bootstrap Error:", err));
