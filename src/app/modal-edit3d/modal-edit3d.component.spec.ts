import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEdit3dComponent } from './modal-edit3d.component';

describe('ModalEdit3dComponent', () => {
  let component: ModalEdit3dComponent;
  let fixture: ComponentFixture<ModalEdit3dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEdit3dComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEdit3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
