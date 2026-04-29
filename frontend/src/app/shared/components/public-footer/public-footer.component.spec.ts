import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PublicFooterComponent } from './public-footer.component';

describe('PublicFooterComponent', () => {
  let fixture: ComponentFixture<PublicFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicFooterComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicFooterComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a footer element', () => {
    const footer = (fixture.nativeElement as HTMLElement).querySelector('footer');
    expect(footer).toBeTruthy();
  });

  it('should render the logo image', () => {
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('alt')).toBe('HomeStay Dorm');
  });
});
