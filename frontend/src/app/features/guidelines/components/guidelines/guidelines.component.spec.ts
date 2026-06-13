import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuidelinesComponent } from './guidelines.component';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

describe('GuidelinesComponent', () => {
  let component: GuidelinesComponent;
  let fixture: ComponentFixture<GuidelinesComponent>;
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
      imports: [GuidelinesComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GuidelinesComponent);
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

  it('should toggle user menu', () => {
    component.isUserMenuOpen = false;
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(true);
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