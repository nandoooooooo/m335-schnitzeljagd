import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionsPagePage } from './permissions-page.page';

describe('PermissionsPagePage', () => {
  let component: PermissionsPagePage;
  let fixture: ComponentFixture<PermissionsPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionsPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
