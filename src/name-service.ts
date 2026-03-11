import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NameService {
  playerName = signal<string>('Spieler');
}
