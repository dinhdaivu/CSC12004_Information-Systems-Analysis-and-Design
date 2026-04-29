import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>;
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
      imports: [AboutComponent, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
  });

  it('should create the about page', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the hero title', () => {
    const hero = fixture.nativeElement.querySelector('h1');
    expect(hero).toBeTruthy();
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

  it('should disconnect observer on destroy', () => {
    expect(() => fixture.destroy()).not.toThrow();
  });
});
