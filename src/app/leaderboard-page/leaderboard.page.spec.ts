import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaderboardPage } from './leaderboard.page';

describe('LeaderboardPagePage', () => {
  let component: LeaderboardPage;
  let fixture: ComponentFixture<LeaderboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
