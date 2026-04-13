import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LanguageService } from '@core/i18n/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

const languageServiceMock = {
  initializeLanguage: jest.fn(),
  setLanguage: jest.fn(),
  getCurrentLanguage: jest.fn(() => 'en')
};

const authServiceMock = {
  getToken: jest.fn(),
  loadCurrentUser: jest.fn(),
  clearSession: jest.fn(),
};

describe('AppComponent', () => {
  beforeEach(async () => {
    languageServiceMock.initializeLanguage.mockClear();
    authServiceMock.getToken.mockReset();
    authServiceMock.loadCurrentUser.mockReset();
    authServiceMock.clearSession.mockReset();
    authServiceMock.getToken.mockReturnValue(null);
    authServiceMock.loadCurrentUser.mockReturnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: LanguageService, useValue: languageServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should initialize without errors', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should handle component lifecycle', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    
    expect(component).toBeDefined();
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize language on init', () => {
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(languageServiceMock.initializeLanguage).toHaveBeenCalledTimes(1);
  });

  it('should refresh the current user on init when a token exists', () => {
    authServiceMock.getToken.mockReturnValue('signed-jwt');
    authServiceMock.loadCurrentUser.mockReturnValue(of({
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'Test User',
      role: 'customer',
      status: 'active',
      created_at: '2026-04-09T00:00:00.000Z',
      updated_at: '2026-04-09T00:00:00.000Z',
    }));

    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(authServiceMock.loadCurrentUser).toHaveBeenCalledTimes(1);
    expect(authServiceMock.clearSession).not.toHaveBeenCalled();
  });

  it('should clear the session when current-user refresh fails', () => {
    authServiceMock.getToken.mockReturnValue('signed-jwt');
    authServiceMock.loadCurrentUser.mockReturnValue(throwError(() => new Error('Unauthorized')));

    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(authServiceMock.loadCurrentUser).toHaveBeenCalledTimes(1);
    expect(authServiceMock.clearSession).toHaveBeenCalledTimes(1);
  });
});
