import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let translate: TranslateService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [LanguageService],
    });

    service = TestBed.inject(LanguageService);
    translate = TestBed.inject(TranslateService);
  });

  afterEach(() => localStorage.clear());

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should use saved language from localStorage on init', () => {
    localStorage.setItem('app_language', 'vi');
    const spy = jest.spyOn(translate, 'use');
    service.initializeLanguage();
    expect(spy).toHaveBeenCalledWith('vi');
  });

  it('should fall back to browser language when no saved language', () => {
    jest.spyOn(translate, 'getBrowserLang').mockReturnValue('vi');
    const spy = jest.spyOn(translate, 'use');
    service.initializeLanguage();
    expect(spy).toHaveBeenCalledWith('vi');
  });

  it('should fall back to "en" when browser language is unsupported', () => {
    jest.spyOn(translate, 'getBrowserLang').mockReturnValue('fr');
    const spy = jest.spyOn(translate, 'use');
    service.initializeLanguage();
    expect(spy).toHaveBeenCalledWith('en');
  });

  it('should set language and persist to localStorage', () => {
    const spy = jest.spyOn(translate, 'use');
    service.setLanguage('vi');
    expect(spy).toHaveBeenCalledWith('vi');
    expect(localStorage.getItem('app_language')).toBe('vi');
  });

  it('should return current language when set', () => {
    jest.spyOn(translate, 'currentLang', 'get').mockReturnValue('vi');
    expect(service.getCurrentLanguage()).toBe('vi');
  });

  it('should return fallback "en" for unsupported currentLang', () => {
    jest.spyOn(translate, 'currentLang', 'get').mockReturnValue('fr');
    expect(service.getCurrentLanguage()).toBe('en');
  });

  it('should return a copy of supported languages', () => {
    const langs = service.getSupportedLanguages();
    expect(langs).toEqual(['en', 'vi']);
    langs.push('fr' as never);
    expect(service.getSupportedLanguages()).toEqual(['en', 'vi']);
  });

  it('should ignore unsupported language in localStorage', () => {
    localStorage.setItem('app_language', 'fr');
    jest.spyOn(translate, 'getBrowserLang').mockReturnValue('en');
    const spy = jest.spyOn(translate, 'use');
    service.initializeLanguage();
    expect(spy).toHaveBeenCalledWith('en');
  });
});
