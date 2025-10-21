import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupsPageComponent } from './pickups-page.component';

describe('PickupsPageComponent', () => {
  let component: PickupsPageComponent;
  let fixture: ComponentFixture<PickupsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickupsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickupsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
