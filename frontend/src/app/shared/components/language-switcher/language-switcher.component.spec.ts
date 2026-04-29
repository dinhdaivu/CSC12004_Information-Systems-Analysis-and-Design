import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { LanguageService } from '@core/i18n/language.service';

const languageServiceMock = {
  getCurrentLanguage: jest.fn(() => 'en'),
  setLanguage: jest.fn(),
};

describe('LanguageSwitcherComponent', () => {
  let fixture: ComponentFixture<LanguageSwitcherComponent>;
  let component: LanguageSwitcherComponent;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent, TranslateModule.forRoot()],
      providers: [{ provide: LanguageService, useValue: languageServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with menu closed', () => {
    expect(component.isOpen).toBe(false);
  });

  it('should open menu on toggleMenu()', () => {
    component.toggleMenu();
    expect(component.isOpen).toBe(true);
  });

  it('should close menu on second toggleMenu()', () => {
    component.toggleMenu();
    component.toggleMenu();
    expect(component.isOpen).toBe(false);
  });

  it('should emit menuOpened when menu opens', () => {
    const spy = jest.spyOn(component.menuOpened, 'emit');
    component.toggleMenu();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit menuOpened when menu closes', () => {
    component.isOpen = true;
    const spy = jest.spyOn(component.menuOpened, 'emit');
    component.toggleMenu();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should change language and close menu', () => {
    component.isOpen = true;
    component.changeLanguage('vi');
    expect(languageServiceMock.setLanguage).toHaveBeenCalledWith('vi');
    expect(component.isOpen).toBe(false);
  });

  it('should close menu when forceClose receives a non-zero value', () => {
    component.isOpen = true;
    component.forceClose = 1;
    expect(component.isOpen).toBe(false);
  });

  it('should not close menu when forceClose receives 0', () => {
    component.isOpen = true;
    component.forceClose = 0;
    expect(component.isOpen).toBe(true);
  });

  it('should return current language from service', () => {
    languageServiceMock.getCurrentLanguage.mockReturnValue('vi');
    expect(component.currentLanguage).toBe('vi');
  });

  it('should close menu on outside document click', () => {
    component.isOpen = true;
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);
    component.handleDocumentClick({ target: outsideElement } as unknown as MouseEvent);
    expect(component.isOpen).toBe(false);
    document.body.removeChild(outsideElement);
  });

  it('should not close menu on click inside the component', () => {
    component.isOpen = true;
    const inside = fixture.nativeElement as HTMLElement;
    component.handleDocumentClick({ target: inside } as unknown as MouseEvent);
    expect(component.isOpen).toBe(true);
  });
});
