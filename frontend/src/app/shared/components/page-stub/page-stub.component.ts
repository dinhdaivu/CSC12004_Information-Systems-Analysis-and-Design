import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-page-stub',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <section class="rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
      <div class="flex max-w-2xl flex-col gap-5">
        @if (eyebrowKey) {
          <span class="inline-flex w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            {{ eyebrowKey | translate }}
          </span>
        }

        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl text-white shadow-lg">
            <i [class]="icon"></i>
          </div>

          <div class="space-y-3">
            <h1 class="font-['Big_Shoulders_Text'] text-4xl font-black uppercase tracking-[0.08em] text-slate-900">
              {{ titleKey | translate }}
            </h1>
            <p class="max-w-xl text-base leading-7 text-slate-600">
              {{ descriptionKey | translate }}
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PageStubComponent {
  @Input({ required: true }) titleKey!: string;
  @Input({ required: true }) descriptionKey!: string;
  @Input() eyebrowKey?: string;
  @Input() icon = 'bi bi-grid-1x2';
}
