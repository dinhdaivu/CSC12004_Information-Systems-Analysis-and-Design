import { TestBed } from '@angular/core/testing';
import { AccountantLayoutComponent } from './accountant-layout.component';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { Subject, of } from 'rxjs';

describe('AccountantLayoutComponent', () => {
  let component: AccountantLayoutComponent;
  let fixture: ReturnType<typeof TestBed.createComponent<AccountantLayoutComponent>>;
  let mockRouter: any;
  let routerEvents: Subject<any>;

  beforeEach(async () => {
    routerEvents = new Subject();
    mockRouter = {
      url: '/accountant/transactions',
      events: routerEvents.asObservable(),
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AccountantLayoutComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: { logout: jest.fn().mockReturnValue(of(null)) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountantLayoutComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update url on navigation end', () => {
    fixture.detectChanges();
    mockRouter.url = '/accountant/checkout';
    routerEvents.next(new NavigationEnd(1, '/accountant/checkout', '/accountant/checkout'));
    expect(component.currentUrl).toBe('/accountant/checkout');
  });

  it('should toggle menus', () => {
    component.isLangMenuOpen = true;
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(true);
    expect(component.isLangMenuOpen).toBe(false);

    component.toggleLangMenu();
    expect(component.isLangMenuOpen).toBe(true);
    expect(component.isUserMenuOpen).toBe(false);
  });

  it('should set lang', () => {
    component.setLang('vi');
    expect(component.currentLang).toBe('vi');
    expect(component.isLangMenuOpen).toBe(false);
  });

  it('should handle document click to close menus', () => {
    component.isUserMenuOpen = true;
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: document.createElement('div') });
    component.handleDocumentClick(event);
    expect(component.isUserMenuOpen).toBe(false);
  });

  it('should logout and navigate', () => {
    component.handleLogout();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to profile', () => {
    component.goProfile();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });
});