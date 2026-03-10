import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner';

@Component({
  selector: 'app-qrcode-task',
  templateUrl: './qrcode-task.page.html',
  styleUrls: ['./qrcode-task.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    CommonModule,
    FormsModule,
  ],
})
export class QrTaskPage {
  private router = inject(Router);

  task = {
    index: 3,
    total: 6,
    title: 'QR-Code scannen',
    description: 'Finde den versteckten QR-Code und scanne ihn.',
    timer: '03:43 MIN',
    cameraLabel: 'KAMERA',
    scanStatus: 'Noch kein QR-Code erkannt',
    hint: 'Der Code befindet sich im Kursraum 6.',
    correctCode: 'M335@ICT-BZ',
  };

  async scanQrCode(): Promise<void> {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
        scanInstructions: 'QR-Code scannen',
        scanButton: true,
        scanText: 'Scannen',
      });

      const scannedCode = result.ScanResult;

      if (!scannedCode) {
        this.task.scanStatus = 'Kein QR-Code erkannt';
        return;
      }

      if (scannedCode === this.task.correctCode) {
        this.task.scanStatus = 'Richtiger QR-Code erkannt';
        this.nextTask();
      } else {
        this.task.scanStatus = 'Falscher QR-Code';
      }
    } catch (error) {
      console.error(error);
      this.task.scanStatus = 'Scan fehlgeschlagen';
    }
  }

  nextTask(): void {
    this.router.navigate(['/task-04']);
  }

  cancel(): void {
    this.router.navigate(['/start-page']);
  }
}
