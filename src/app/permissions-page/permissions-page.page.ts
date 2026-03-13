import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {Geolocation} from '@capacitor/geolocation';
import {Camera} from '@capacitor/camera';
import {Capacitor} from '@capacitor/core';
import {
  AlertController,
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import {PageHeaderComponent} from '../components/page-header/page-header.component';
import {NameService} from '../../name-service';
import {AndroidSettings, NativeSettings} from 'capacitor-native-settings';

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
    {key: 'location', icon: '📍', label: 'Standort', granted: false},
    {key: 'camera', icon: '📷', label: 'Kamera', granted: false},
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
    try {
      switch (key) {
        case 'location': {
          const r = await Geolocation.requestPermissions();
          const granted =
            r.location === 'granted';
          this.updatePermission('location', granted);
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
      this.updatePermission(key, false);
    }
  }

  async onWeiter(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Dein Name',
      inputs: [{name: 'name', type: 'text', placeholder: 'Max Mustermann'}],
      buttons: [
        {
          text: 'Weiter',
          handler: (data: { name: string }) => {
            const name = data?.name?.trim();
            if (name) {
              this.nameService.playerName.set(name);
            }
          },
        },
      ],
    });
    await alert.present();
    await alert.onDidDismiss();
    this.router.navigate(['/tasks']);
  }

  private updatePermission(key: Permission['key'], granted: boolean): void {
    this.permissions.update((list) =>
      list.map((p) => (p.key === key ? {...p, granted} : p)),
    );
  }

  allGranted = computed(() => this.permissions().every((p) => p.granted));
}
