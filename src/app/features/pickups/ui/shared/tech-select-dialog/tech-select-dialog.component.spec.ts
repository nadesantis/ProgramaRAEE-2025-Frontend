import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechSelectDialogComponent } from './tech-select-dialog.component';

describe('TechSelectDialogComponent', () => {
  let component: TechSelectDialogComponent;
  let fixture: ComponentFixture<TechSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechSelectDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
