import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToCrypto } from './to-crypto';

describe('ToCrypto', () => {
  let component: ToCrypto;
  let fixture: ComponentFixture<ToCrypto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToCrypto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToCrypto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
