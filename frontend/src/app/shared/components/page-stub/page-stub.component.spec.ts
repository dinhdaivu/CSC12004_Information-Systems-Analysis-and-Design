import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PageStubComponent } from './page-stub.component';

describe('PageStubComponent', () => {
  let fixture: ComponentFixture<PageStubComponent>;
  let component: PageStubComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageStubComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PageStubComponent);
    component = fixture.componentInstance;
    component.titleKey = 'PAGE.TITLE';
    component.descriptionKey = 'PAGE.DESC';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and description slots', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')).toBeTruthy();
    expect(el.querySelector('p')).toBeTruthy();
  });

  it('should hide eyebrow when eyebrowKey is not set', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('span')).toBeNull();
  });

  it('should show eyebrow when eyebrowKey is provided', async () => {
    const localFixture = TestBed.createComponent(PageStubComponent);
    const localComponent = localFixture.componentInstance;
    localComponent.titleKey = 'PAGE.TITLE';
    localComponent.descriptionKey = 'PAGE.DESC';
    localComponent.eyebrowKey = 'PAGE.EYEBROW';
    localFixture.detectChanges();
    const el = localFixture.nativeElement as HTMLElement;
    expect(el.querySelector('span')).toBeTruthy();
  });

  it('should use default icon when not provided', () => {
    expect(component.icon).toBe('bi bi-grid-1x2');
  });

  it('should use provided icon', () => {
    component.icon = 'bi bi-house';
    expect(component.icon).toBe('bi bi-house');
  });
});
