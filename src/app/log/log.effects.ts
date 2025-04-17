// ───────────────────────────────────────────────────────────────
// src/app/store/log.effects.ts
// Listens for  [Log] Add Start  and writes the entry to Firestore
// ───────────────────────────────────────────────────────────────
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, of } from 'rxjs';

import { LogService } from '../services/log.service';
import * as LogActions from './log.actions';

@Injectable()
export class LogEffects {

  /** When [Log] Add Start is dispatched, call LogService.addLog(...) */
  addLog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LogActions.addLogStart),
      switchMap(({ entry }) =>
        this.logSvc.addLog(entry).pipe(
          /* If Firestore write succeeds emit Add Success */
          map(() => LogActions.addLogSuccess()),
          /* If it fails emit Add Failure carrying the error */
          catchError(error => of(LogActions.addLogFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private logSvc: LogService
  ) {}
}
