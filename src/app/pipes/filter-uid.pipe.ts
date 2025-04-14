import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../services/user.service';

@Pipe({
  name: 'filterUid',
  standalone: true
})
export class FilterUidPipe implements PipeTransform {
  transform(users: User[], uid: string): User[] {
    if (!Array.isArray(users) || !uid) {
      return [];
    }
    return users.filter((u) => u.uid === uid);
  }
}
