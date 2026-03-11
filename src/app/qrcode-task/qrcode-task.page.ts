import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {IonButton, IonContent, IonHeader,} from '@ionic/angular/standalone';
import {CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint,} from '@capacitor/barcode-scanner';
import {PageHeaderComponent} from '../components/page-header/page-header.component';
import {TaskService} from '../services/task.service';

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
export class QrTaskPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private taskService = inject(TaskService);
  private startTime = Date.now();
  private previousElapsed = 0;
  private penaltySeconds = 5 * 60;
  private timerInterval?: ReturnType<typeof setInterval>;

  currentElapsed = signal(0);

  remainingSeconds = computed(() => {
    return Math.max(0, this.penaltySeconds - this.currentElapsed());
  });

  timerDisplay = computed(() => {
    const remaining = this.remainingSeconds();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  timerColor = computed(() => {
    const percentage = this.remainingSeconds() / this.penaltySeconds;
    if (percentage > 0.5) {
      return '#ff9500';
    } else if (percentage > 0.25) {
      const r = 255;
      const g = Math.floor(149 + (255 - 149) * (percentage - 0.25) / 0.25);
      return `rgb(${r}, ${g}, 0)`;
    } else {
      return '#ff0000';
    }
  });

  ngOnInit(): void {
    const taskData = this.taskService.getTaskById(3);
    this.previousElapsed = taskData?.timeElapsed ?? 0;
    this.startTime = Date.now();
    this.currentElapsed.set(this.previousElapsed);

    this.timerInterval = setInterval(() => {
      const elapsed = this.previousElapsed + Math.floor((Date.now() - this.startTime) / 1000);
      this.currentElapsed.set(elapsed);
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  task = {
    index: 3,
    total: 6,
    title: 'QR-Code scannen',
    description: 'Finde den versteckten QR-Code und scanne ihn.',
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
        const allCompleted = await this.taskService.completeTask(3, timeSpent);
        if (allCompleted) {
          this.router.navigate(['/tasks/finish']);
        } else {
          this.nextTask();
        }
      } else {
        this.task.scanStatus = 'Falscher QR-Code';
      }
    } catch (error) {
      console.error(error);
      this.task.scanStatus = 'Scan fehlgeschlagen';
    }
  }

  private calculateTimeSpent(): string {
    const currentElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const totalElapsed = this.previousElapsed + currentElapsed;
    const minutes = Math.floor(totalElapsed / 60);
    const seconds = totalElapsed % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  private getTotalElapsedSeconds(): number {
    const currentElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    return this.previousElapsed + currentElapsed;
  }

  nextTask(): void {
    this.router.navigate(['/tasks']);
  }

  async skip(): Promise<void> {
    const totalElapsed = this.getTotalElapsedSeconds();
    const allCompleted = await this.taskService.skipTask(3, totalElapsed);
    if (allCompleted) {
      this.router.navigate(['/tasks/finish']);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  cancel(): void {
    const totalElapsed = this.getTotalElapsedSeconds();
    this.taskService.pauseTask(3, totalElapsed);
    this.router.navigate(['/tasks']);
  }
}
