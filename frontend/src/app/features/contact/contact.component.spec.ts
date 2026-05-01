import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactComponent } from './contact.component';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(true),
      logout: jest.fn().mockReturnValue(of({}))
    };
    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ContactComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate', () => {
    component.navigate('/test');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test']);
  });

  it('should toggle lang menu', () => {
    component.isLangMenuOpen = false;
    component.toggleLangMenu();
    expect(component.isLangMenuOpen).toBe(true);
    expect(component.isUserMenuOpen).toBe(false);
  });

  it('should toggle user menu', () => {
    component.isUserMenuOpen = false;
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(true);
    expect(component.isLangMenuOpen).toBe(false);
  });

  it('should change lang', () => {
    const translate = TestBed.inject(TranslateService);
    jest.spyOn(translate, 'use');
    component.changeLang('en');
    expect(translate.use).toHaveBeenCalledWith('en');
    expect(component.isLangMenuOpen).toBe(false);
  });

  it('should logout', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(component.isAuthenticated).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle resize', () => {
    component.onResize();
    expect(component.scaleFactor).toBeDefined();
  });
});