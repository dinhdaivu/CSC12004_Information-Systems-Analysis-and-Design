import { ApplicationConfig } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslationObject } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
// import { errorInterceptor } from '@core/interceptors/error.interceptor';

export function httpLoaderFactory(http: HttpClient): TranslateLoader {
  return {
    getTranslation(language: string): Observable<TranslationObject> {
      return http.get<TranslationObject>(`./assets/i18n/${language}.json`);
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    provideAnimations(),
  ],
};
