import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreamingPage } from './streaming.page';

describe('StreamingPage', () => {
  let component: StreamingPage;
  let fixture: ComponentFixture<StreamingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
