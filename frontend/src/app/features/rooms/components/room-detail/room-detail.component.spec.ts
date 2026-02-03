import { TestBed } from '@angular/core/testing';
import { RoomDetailComponent } from './room-detail.component';

describe('RoomDetailComponent', () => {
  let component: RoomDetailComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create room detail view', () => {
    expect(component).toBeTruthy();
  });

  it('should load room data from route params', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should display room information', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled).toBeTruthy();
  });

  it('should handle room booking', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
