import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LanguageService } from '@core/i18n/language.service';
import { TranslateModule } from '@ngx-translate/core';

const languageServiceMock = {
  initializeLanguage: jest.fn(),
  setLanguage: jest.fn(),
  getCurrentLanguage: jest.fn(() => 'en')
};

describe('AppComponent', () => {
  beforeEach(async () => {
    languageServiceMock.initializeLanguage.mockClear();

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [{ provide: LanguageService, useValue: languageServiceMock }]
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
});
