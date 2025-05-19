import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MusicPMenuPage } from './music-pmenu.page';

describe('MusicPMenuPage', () => {
  let component: MusicPMenuPage;
  let fixture: ComponentFixture<MusicPMenuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MusicPMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
