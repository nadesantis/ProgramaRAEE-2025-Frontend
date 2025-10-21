import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupCreateComponent } from './pickup-create.component';

describe('PickupCreateComponent', () => {
  let component: PickupCreateComponent;
  let fixture: ComponentFixture<PickupCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickupCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickupCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
