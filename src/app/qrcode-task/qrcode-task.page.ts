import { Component, inject, OnInit } from '@angular/core';
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
import { PageHeaderComponent } from '../components/page-header/page-header.component';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-qrcode-task',
  templateUrl: './qrcode-task.page.html',
  styleUrls: ['./qrcode-task.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonButton,
    CommonModule,
    FormsModule,
    PageHeaderComponent,
  ],
})
export class QrTaskPage implements OnInit {
  private router = inject(Router);
  private taskService = inject(TaskService);
  private startTime = Date.now();

  ngOnInit(): void {
    this.startTime = Date.now();
  }

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
        const timeSpent = this.calculateTimeSpent();
        this.taskService.completeTask(3, timeSpent);
        this.nextTask();
      } else {
        this.task.scanStatus = 'Falscher QR-Code';
      }
    } catch (error) {
      console.error(error);
      this.task.scanStatus = 'Scan fehlgeschlagen';
    }
  }

  private calculateTimeSpent(): string {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  nextTask(): void {
    this.router.navigate(['/tasks']);
  }

  skip(): void {
    this.taskService.skipTask(3);
    this.router.navigate(['/tasks']);
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}
