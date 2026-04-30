import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { RoomsListComponent } from './rooms-list.component';

describe('RoomsListComponent', () => {
  let component: RoomsListComponent;
  let fixture: ReturnType<typeof TestBed.createComponent<RoomsListComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomsListComponent, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomsListComponent);
    component = fixture.componentInstance;
  });

  it('should create the rooms list component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize without errors', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should have valid component instance', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toEqual(component);
  });

  it('should render the page stub', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeTruthy();
  });
});
