import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Geolocation02TaskPage } from './geolocation02-task.page';

describe('Geolocation02TaskPage', () => {
  let component: Geolocation02TaskPage;
  let fixture: ComponentFixture<Geolocation02TaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Geolocation02TaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
