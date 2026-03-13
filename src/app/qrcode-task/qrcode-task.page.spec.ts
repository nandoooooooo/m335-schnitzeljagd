import {ComponentFixture, TestBed} from '@angular/core/testing';
import {QrTaskPage} from './qrcode-task.page';

describe('QrTaskPage', () => {
  let component: QrTaskPage;
  let fixture: ComponentFixture<QrTaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QrTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
