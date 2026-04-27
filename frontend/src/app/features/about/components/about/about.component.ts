import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/* Mascot and hero images sourced from Figma assets.
   Replace with permanent paths under assets/images/ once downloaded. */
const HERO_BG = 'https://www.figma.com/api/mcp/asset/f9a03180-9f7f-46bb-99bb-021200986e38';
const MASCOT_HOM = 'https://www.figma.com/api/mcp/asset/3483e101-9f28-4208-ad69-adb896471030';
const MASCOT_SA = 'https://www.figma.com/api/mcp/asset/ddaeb985-dd24-4db3-8196-7d1f015d0282';
const MASCOT_DO = 'https://www.figma.com/api/mcp/asset/30be6eac-6af6-4228-87c3-4c6e58d17036';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  template: `
    <!-- ── Hero ── -->
    <section class="relative overflow-hidden" style="min-height:58vh">
      <img
        [src]="heroBg"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <!-- dark top vignette -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-transparent"></div>
      <!-- cream bleed-in from bottom -->
      <div class="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-[#fef4df] to-transparent"></div>

      <div class="relative z-10 flex min-h-[58vh] flex-col items-center justify-center px-6 pb-12 pt-28 text-center">
        <h1 class="font-['Big_Shoulders_Text'] text-[4.5rem] font-extrabold leading-none text-[#264893] lg:text-[8rem]">
          {{ 'ABOUT.HERO.TITLE' | translate }}
        </h1>
        <h2 class="mt-3 max-w-[90%] font-['Big_Shoulders_Text'] text-[1.25rem] font-extrabold leading-tight text-[#264893] lg:max-w-[74%] lg:text-[2.5rem]">
          {{ 'ABOUT.HERO.SUBTITLE' | translate }}
        </h2>
        <p class="mt-5 max-w-[85%] font-['Afacad'] text-[1.05rem] italic leading-relaxed text-[#264893] lg:max-w-[66%] lg:text-[1.75rem]">
          {{ 'ABOUT.HERO.QUOTE' | translate }}
        </p>
      </div>
    </section>

    <!-- ── Mascots ── -->
    <section class="bg-[#fef4df] px-6 py-20 lg:px-20">
      <div class="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 md:grid-cols-3">
        @for (mascot of mascots; track mascot.nameKey) {
          <div class="flex flex-col items-center">
            <!-- floating mascot image above the border box -->
            <div class="relative z-10 mb-[-3.5rem] h-[11rem] w-[10rem] drop-shadow-[4px_4px_4px_rgba(0,0,0,0.25)]">
              <img [src]="mascot.image" [alt]="mascot.nameKey | translate" class="h-full w-full object-contain" />
            </div>
            <!-- border card -->
            <div class="flex w-full flex-col items-center rounded-[1.5625rem] border-[3px] border-[#264893] px-6 pb-8 pt-16">
              <h3 class="font-['Afacad'] text-[1.8rem] font-medium text-[#264893] text-center">
                {{ mascot.nameKey | translate }}
              </h3>
              <p class="mt-4 font-['Afacad'] text-[1rem] italic leading-relaxed text-[#264893] text-justify">
                {{ mascot.descKey | translate }}
              </p>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- ── About text ── -->
    <section class="bg-[#fef4df] px-6 pb-16 pt-4 lg:px-20">
      <div class="mx-auto max-w-[79.5rem] space-y-6 text-center font-['Afacad'] text-[1.05rem] italic leading-relaxed text-[#264893] lg:text-[1.75rem]">
        <p>{{ 'ABOUT.TEXT.PARA1' | translate }}</p>
        <p>{{ 'ABOUT.TEXT.PARA2' | translate }}</p>
      </div>
    </section>

    <!-- ── Stats ── -->
    <section class="bg-[#fef4df] px-6 pb-24 pt-8 lg:px-20">
      <div class="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 md:grid-cols-3">
        @for (stat of stats; track stat.valueKey) {
          <div class="flex flex-col items-center text-center">
            <i [class]="stat.icon + ' text-[3rem] text-[#264893]'"></i>
            <p class="mt-3 font-['Afacad'] text-[3.5rem] font-bold leading-none text-[#264893] lg:text-[4rem]">
              {{ stat.valueKey | translate }}
            </p>
            <p class="mt-1 font-['Afacad'] text-[1.5rem] font-semibold text-[#264893]">
              {{ stat.labelKey | translate }}
            </p>
            <p class="mt-3 max-w-[18rem] font-['Afacad'] text-[1rem] leading-snug text-[#264893] text-justify">
              {{ stat.descKey | translate }}
            </p>
          </div>
        }
      </div>
    </section>

    <!-- ── Footer ── -->
    <footer class="bg-[#264893] px-6 py-12 lg:px-20">
      <div class="mx-auto flex max-w-[1400px] flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <!-- Left: logo + tagline -->
        <div class="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <img src="assets/icons/logo.svg" alt="HomeStay Dorm" class="h-20 w-20 object-contain brightness-0 invert" />
          <p class="font-['Afacad'] text-[1.1rem] italic text-[#fef4df]">
            {{ 'ABOUT.FOOTER.TAGLINE' | translate }}
          </p>
          <p class="font-['Afacad'] text-[0.95rem] text-[#fef4df]/70">
            {{ 'ABOUT.FOOTER.COPYRIGHT' | translate }}
          </p>
        </div>

        <!-- Right: contact info -->
        <div class="font-['Afacad'] text-white">
          <h4 class="text-[1.75rem] font-bold italic">{{ 'ABOUT.FOOTER.CONTACT_TITLE' | translate }}</h4>
          <div class="mt-3 space-y-1 text-[1.1rem]">
            <p>
              <span class="font-bold">{{ 'ABOUT.FOOTER.HQ_LABEL' | translate }}</span>
              <span class="font-normal"> {{ 'ABOUT.FOOTER.HQ_VALUE' | translate }}</span>
            </p>
            <p>
              <span class="font-bold">{{ 'ABOUT.FOOTER.PHONE_LABEL' | translate }}</span>
              <span class="font-normal"> {{ 'ABOUT.FOOTER.PHONE_VALUE' | translate }}</span>
            </p>
            <p>
              <span class="font-bold">{{ 'ABOUT.FOOTER.EMAIL_LABEL' | translate }}</span>
              <span class="font-normal"> {{ 'ABOUT.FOOTER.EMAIL_VALUE' | translate }}</span>
            </p>
            <p>
              <span class="font-bold">{{ 'ABOUT.FOOTER.HOURS_LABEL' | translate }}</span>
              <span class="font-normal"> {{ 'ABOUT.FOOTER.HOURS_VALUE' | translate }}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class AboutComponent {
  readonly heroBg = HERO_BG;

  readonly mascots = [
    {
      image: MASCOT_HOM,
      nameKey: 'ABOUT.MASCOT.HOM.NAME',
      descKey: 'ABOUT.MASCOT.HOM.DESC',
    },
    {
      image: MASCOT_SA,
      nameKey: 'ABOUT.MASCOT.SA.NAME',
      descKey: 'ABOUT.MASCOT.SA.DESC',
    },
    {
      image: MASCOT_DO,
      nameKey: 'ABOUT.MASCOT.DO.NAME',
      descKey: 'ABOUT.MASCOT.DO.DESC',
    },
  ];

  readonly stats = [
    {
      icon: 'bi bi-building',
      valueKey: 'ABOUT.STATS.BRANCHES.VALUE',
      labelKey: 'ABOUT.STATS.BRANCHES.LABEL',
      descKey: 'ABOUT.STATS.BRANCHES.DESC',
    },
    {
      icon: 'bi bi-clock',
      valueKey: 'ABOUT.STATS.HOURS.VALUE',
      labelKey: 'ABOUT.STATS.HOURS.LABEL',
      descKey: 'ABOUT.STATS.HOURS.DESC',
    },
    {
      icon: 'bi bi-shield-check',
      valueKey: 'ABOUT.STATS.TRANSPARENCY.VALUE',
      labelKey: 'ABOUT.STATS.TRANSPARENCY.LABEL',
      descKey: 'ABOUT.STATS.TRANSPARENCY.DESC',
    },
  ];
}
