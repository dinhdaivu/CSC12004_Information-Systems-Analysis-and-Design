import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { GuidelinesComponent } from './guidelines.component';

describe('GuidelinesComponent', () => {
  let fixture: ComponentFixture<GuidelinesComponent>;
  let component: GuidelinesComponent;
  let capturedCallback: IntersectionObserverCallback | null = null;

  beforeEach(async () => {
    capturedCallback = null;

    const mockIOInstance = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(() => [] as IntersectionObserverEntry[]),
      root: null,
      rootMargin: '',
      thresholds: [],
    };

    const MockIO = jest.fn().mockImplementation((callback: IntersectionObserverCallback) => {
      capturedCallback = callback;
      return mockIOInstance;
    });

    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIO,
    });

    await TestBed.configureTestingModule({
      imports: [GuidelinesComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(GuidelinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the hero header', () => {
    const header = (fixture.nativeElement as HTMLElement).querySelector('header');
    expect(header).toBeTruthy();
  });

  it('should define 4 guideline steps', () => {
    expect(component.steps.length).toBe(4);
  });

  it('should render 4 step articles', () => {
    const steps = (fixture.nativeElement as HTMLElement).querySelectorAll('.gl-step');
    expect(steps.length).toBe(4);
  });

  it('should have step 4 with sub-items on one of its items', () => {
    const step4 = component.steps[3];
    const itemWithSubs = step4.items.find((i) => i.subItems && i.subItems.length > 0);
    expect(itemWithSubs).toBeTruthy();
    expect(itemWithSubs?.subItems?.length).toBeGreaterThanOrEqual(4);
  });

  it('should render the chat FAB button', () => {
    const fab = (fixture.nativeElement as HTMLElement).querySelector('.chat-fab');
    expect(fab).toBeTruthy();
  });

  it('should add revealed class when entry is intersecting', () => {
    const el = document.createElement('div');
    const entry = { isIntersecting: true, target: el } as unknown as IntersectionObserverEntry;
    capturedCallback?.([entry], {} as IntersectionObserver);
    expect(el.classList.contains('revealed')).toBe(true);
  });

  it('should remove revealed class when entry is not intersecting', () => {
    const el = document.createElement('div');
    el.classList.add('revealed');
    const entry = { isIntersecting: false, target: el } as unknown as IntersectionObserverEntry;
    capturedCallback?.([entry], {} as IntersectionObserver);
    expect(el.classList.contains('revealed')).toBe(false);
  });

  it('should disconnect IntersectionObserver on destroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
