import {Injectable} from '@angular/core';
import {Haptics, ImpactStyle} from '@capacitor/haptics';

@Injectable({
  providedIn: 'root',
})
export class HapticService {
  async taskSuccess(): Promise<void> {
    try {
      await Haptics.impact({style: ImpactStyle.Medium});
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }

  async gameComplete(): Promise<void> {
    try {
      await Haptics.impact({style: ImpactStyle.Heavy});
      setTimeout(async () => {
        await Haptics.impact({style: ImpactStyle.Heavy});
      }, 150);
      setTimeout(async () => {
        await Haptics.impact({style: ImpactStyle.Heavy});
      }, 300);
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }
}
