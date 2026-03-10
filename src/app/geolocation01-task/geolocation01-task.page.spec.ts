import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Geolocation01TaskPage } from './geolocation01-task.page';

describe('Geolocation01TaskPage', () => {
  let component: Geolocation01TaskPage;
  let fixture: ComponentFixture<Geolocation01TaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Geolocation01TaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
