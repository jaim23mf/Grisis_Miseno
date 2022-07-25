import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editor3dComponent } from './editor3d.component';

describe('Editor3dComponent', () => {
  let component: Editor3dComponent;
  let fixture: ComponentFixture<Editor3dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Editor3dComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editor3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
