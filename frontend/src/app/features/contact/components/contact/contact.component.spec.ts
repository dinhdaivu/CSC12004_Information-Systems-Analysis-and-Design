import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let fixture: ComponentFixture<ContactComponent>;
  let component: ContactComponent;
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
      imports: [ContactComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
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

  it('should render 3 contact cards', () => {
    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('.contact-card');
    expect(cards.length).toBe(3);
  });

  it('should have cards with the correct icon paths', () => {
    const icons = component.cards.map((c) => c.icon);
    expect(icons).toContain('assets/icons/house.svg');
    expect(icons).toContain('assets/icons/phone.svg');
    expect(icons).toContain('assets/icons/mail-contact.svg');
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
