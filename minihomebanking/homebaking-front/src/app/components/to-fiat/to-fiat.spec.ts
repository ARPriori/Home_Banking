import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToFiat } from './to-fiat';

describe('ToFiat', () => {
  let component: ToFiat;
  let fixture: ComponentFixture<ToFiat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToFiat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToFiat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
