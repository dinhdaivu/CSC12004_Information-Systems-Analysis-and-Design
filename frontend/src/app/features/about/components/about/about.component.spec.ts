import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
  });

  it('should create the about page', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the hero title', () => {
    const hero = fixture.nativeElement.querySelector('h1');
    expect(hero).toBeTruthy();
  });
});
