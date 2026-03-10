import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrcodeTaskPage } from './qrcode-task.page';

describe('QrcodeTaskPage', () => {
  let component: QrcodeTaskPage;
  let fixture: ComponentFixture<QrcodeTaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QrcodeTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
