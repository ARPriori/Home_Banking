import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDesc } from './edit-desc';

describe('EditDesc', () => {
  let component: EditDesc;
  let fixture: ComponentFixture<EditDesc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDesc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDesc);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
