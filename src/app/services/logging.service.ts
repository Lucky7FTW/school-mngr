// src/app/services/logging.service.ts
import { Injectable } from '@angular/core';
import { Store }      from '@ngrx/store';
import { Auth }       from '@angular/fire/auth';
import { addLogStart } from '../log/log.actions';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  constructor(
    private store: Store,
    private auth : Auth
  ) {}

  /**
   * Dispatches an NgRx log action to write to Firestore.
   */
  log(page: string, command: string) {
    const userUid = this.auth.currentUser?.uid ?? 'anon';
    this.store.dispatch(addLogStart({
      entry: { page, command, userUid }
    }));
  }
}
