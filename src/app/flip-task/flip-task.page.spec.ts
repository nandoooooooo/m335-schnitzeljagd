import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlipTaskPage } from './flip-task.page';

describe('FlipTaskPage', () => {
  let component: FlipTaskPage;
  let fixture: ComponentFixture<FlipTaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FlipTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
