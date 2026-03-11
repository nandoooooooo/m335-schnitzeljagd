import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChargeTaskPage } from './charge-task.page';

describe('ChargeTaskPage', () => {
  let component: ChargeTaskPage;
  let fixture: ComponentFixture<ChargeTaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
