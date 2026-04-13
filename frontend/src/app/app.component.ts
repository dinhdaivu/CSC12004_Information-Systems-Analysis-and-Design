import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '@core/i18n/language.service';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule, LanguageSwitcherComponent],
  template: `
    

      <router-outlet></router-outlet>
    
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private readonly languageService = inject(LanguageService);

  title = 'HomeStay Dorm';

  ngOnInit(): void {
    this.languageService.initializeLanguage();
  }
}
