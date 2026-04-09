import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <section class="mx-auto max-w-md px-4 py-10">
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 class="text-2xl font-semibold text-gray-900">{{ 'AUTH.REGISTER.TITLE' | translate }}</h2>
        <p class="mt-2 text-sm text-gray-600">{{ 'AUTH.REGISTER.SUBTITLE' | translate }}</p>

        <div class="mt-6 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
          {{ 'AUTH.REGISTER.INFO' | translate }}
        </div>

        <div class="mt-6 flex gap-3">
          <a
            routerLink="/auth/login"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            {{ 'AUTH.REGISTER.LOGIN_ACTION' | translate }}
          </a>
        </div>
      </div>
    </section>
  `
})
export class RegisterComponent {}
