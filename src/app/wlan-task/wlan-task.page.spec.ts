import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WlanTaskPage } from './wlan-task.page';

describe('WlanTaskPage', () => {
  let component: WlanTaskPage;
  let fixture: ComponentFixture<WlanTaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WlanTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
