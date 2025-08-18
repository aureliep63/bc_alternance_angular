import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section2SituationComponent } from './section2Situation.component';

describe('Section2Component', () => {
  let component: Section2SituationComponent;
  let fixture: ComponentFixture<Section2SituationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Section2SituationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Section2SituationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
