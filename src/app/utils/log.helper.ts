// src/app/utils/log.helper.ts
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { LogService } from '../services/log.service';

export function logCommand(page: string, command: string) {
  // 1) grab singletons WITHOUT constructor injection
  const auth  = inject(Auth);
  const logs  = inject(LogService);

  // 2) write the log (fire‑and‑forget)
  logs.addLog({
    page,
    command,
    userUid: auth.currentUser?.uid ?? 'anon'
  }).subscribe();     // ignore result – we just want it recorded
}
