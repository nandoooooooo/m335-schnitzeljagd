import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
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
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { NameService } from '../../name-service';
import { AndroidSettings, NativeSettings } from 'capacitor-native-settings';

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
  private toastController = inject(ToastController);
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
      await NativeSettings.openAndroid({
        option: AndroidSettings.ApplicationDetails,
      });
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
      }
    } catch (e) {
      console.error(`Permission request failed for ${key}:`, e);
    }
  }

  async onWeiter(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Dein Name',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Max Mustermann',
          attributes: { maxlength: 30 },
        },
      ],
      buttons: [
        {
          text: 'Weiter',
          handler: async (data: { name: string }) => {
            const name = data?.name?.trim();

            if (!name) {
              await this.showToast('Bitte gib einen Namen ein');
              return false;
            }

            if (name.length < 2) {
              await this.showToast('Name muss mindestens 2 Zeichen lang sein');
              return false;
            }

            if (name.length > 30) {
              await this.showToast('Name darf maximal 30 Zeichen lang sein');
              return false;
            }

            this.nameService.playerName.set(name);
            return true;
          },
        },
      ],
    });
    await alert.present();
    await alert.onDidDismiss();
    this.router.navigate(['/tasks']);
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }

  private updatePermission(key: Permission['key'], granted: boolean): void {
    this.permissions.update((list) =>
      list.map((p) => (p.key === key ? { ...p, granted } : p)),
    );
  }

  allGranted = computed(() => this.permissions().every((p) => p.granted));
}
