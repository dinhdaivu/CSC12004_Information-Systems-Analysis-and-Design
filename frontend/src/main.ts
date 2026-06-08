import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { initDatadog } from './app/core/datadog/rum.init';

initDatadog();

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
