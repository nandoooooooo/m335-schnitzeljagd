import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { Motion } from '@capacitor/motion';
import { Capacitor } from '@capacitor/core';
import {
  IonContent,
  IonHeader,
  IonFooter,
  IonToolbar,
  IonButton,
  IonToggle,
} from '@ionic/angular/standalone';
import { PageHeaderComponent } from '../components/page-header/page-header.component';
import { AlertController } from '@ionic/angular/standalone';
import { NameService } from '../../name-service';

interface Permission {
  key: 'location' | 'camera' | 'motion';
  icon: string;
  label: string;
  granted: boolean;
}

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions-page.page.html',
  styleUrls: ['./permissions-page.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonFooter,
    IonToolbar,
    IonButton,
    IonToggle,
    PageHeaderComponent,
  ],
})
export class PermissionsPage implements OnInit {
  private router = inject(Router);
  private alertController = inject(AlertController);
  private nameService = inject(NameService);

  permissions = signal<Permission[]>([
    { key: 'location', icon: '📍', label: 'Standort', granted: false },
    { key: 'camera', icon: '📷', label: 'Kamera', granted: false },
  ]);

  async ngOnInit(): Promise<void> {
    await this.checkAllPermissions();
  }

  async checkAllPermissions(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    const [locStatus, camStatus] = await Promise.all([
      Geolocation.checkPermissions(),
      Camera.checkPermissions(),
    ]);

    this.updatePermission('location', locStatus.location === 'granted');
    this.updatePermission('camera', camStatus.camera === 'granted');
  }

  async onToggle(key: Permission['key'], newValue: boolean): Promise<void> {
    if (newValue) {
      await this.requestPermission(key);
    } else {
      this.updatePermission(key, false); // rot
    }
  }

  async requestPermission(key: Permission['key']): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.updatePermission(key, true);
      return;
    }
    try {
      switch (key) {
        case 'location': {
          const r = await Geolocation.requestPermissions();
          this.updatePermission('location', r.location === 'granted');
          break;
        }
        case 'camera': {
          const r = await Camera.requestPermissions({
            permissions: ['camera'],
          });
          this.updatePermission('camera', r.camera === 'granted');
          break;
        }
        case 'motion': {
          await Motion.addListener('accel', () => {});
          this.updatePermission('motion', true);
          break;
        }
      }
    } catch (e) {
      console.error(`Permission request failed for ${key}:`, e);
    }
  }

  async onWeiter(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Dein Name',
      inputs: [{ name: 'name', type: 'text', placeholder: 'Max Mustermann' }],
      buttons: [
        {
          text: 'Weiter',
          handler: (data) => {
            if (data.name?.trim()) {
              this.nameService.playerName.set(data.name.trim());
            }
            this.router.navigate(['/tasks']);
          },
        },
      ],
    });
    await alert.present();
  }

  private updatePermission(key: Permission['key'], granted: boolean): void {
    this.permissions.update((list) =>
      list.map((p) => (p.key === key ? { ...p, granted } : p)),
    );
  }

  allGranted = computed(() => this.permissions().every((p) => p.granted));
}
