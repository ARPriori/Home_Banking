import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetBalance } from './get-balance';

describe('GetBalance', () => {
  let component: GetBalance;
  let fixture: ComponentFixture<GetBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetBalance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetBalance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
