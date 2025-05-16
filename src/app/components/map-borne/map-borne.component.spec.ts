import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapBorneComponent } from './map-borne.component';

describe('MapBorneComponent', () => {
  let component: MapBorneComponent;
  let fixture: ComponentFixture<MapBorneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapBorneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapBorneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
