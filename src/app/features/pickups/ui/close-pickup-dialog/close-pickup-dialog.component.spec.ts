import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosePickupDialogComponent } from './close-pickup-dialog.component';

describe('ClosePickupDialogComponent', () => {
  let component: ClosePickupDialogComponent;
  let fixture: ComponentFixture<ClosePickupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClosePickupDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClosePickupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
