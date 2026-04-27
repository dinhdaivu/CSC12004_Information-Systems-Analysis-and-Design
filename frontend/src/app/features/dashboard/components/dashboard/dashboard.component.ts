import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BranchService } from '@core/services/branch.service';
import { Branch } from '@shared/models/branch.model';

type BranchVisualPreset = {
  keys: string[];
  heroImage: string;
  displayAddress: string;
};

const BRANCH_VISUAL_PRESETS: BranchVisualPreset[] = [
  {
    keys: ['to hien thanh'],
    heroImage: 'assets/pictures/Homepage Tô Hiến Thành.png',
    displayAddress: '163/5 To Hien Thanh Street, Ward 13, District 10, Ho Chi Minh City',
  },
  {
    keys: ['tran nao'],
    heroImage: 'assets/pictures/Homepage Trần Não.png',
    displayAddress: '153/8 Quoc Huong Street, Thao Dien Ward, Thu Duc City',
  },
  {
    keys: ['nguyen cuu van'],
    heroImage: 'assets/pictures/Homepage Nguyễn Cửu Vân.png',
    displayAddress: '60/12 Nguyen Cuu Van Street, Ward 17, Binh Thanh District, Ho Chi Minh City',
  },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <section class="relative min-h-screen overflow-hidden font-['Afacad'] text-white">
      @if (selectedBranch) {
        <img
          [src]="getHeroImageUrl(selectedBranch)"
          (error)="onHeroImageError($event)"
          class="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out"
          [class.opacity-0]="isTransitioning"
          [class.scale-105]="isTransitioning"
          alt="HomeStay branch background"
        />
      }

      <div class="absolute inset-y-0 right-0 w-[51.46%] bg-[linear-gradient(270deg,_rgba(0,0,0,0.8)_0%,_rgba(0,0,0,0)_100%)]"></div>

      <div class="relative z-10 min-h-screen px-5 pb-10 pt-32 sm:px-8 sm:pb-12 sm:pt-36 lg:px-0 lg:pb-0 lg:pt-0">
        <div class="mx-auto flex min-h-screen max-w-[1920px] flex-col gap-10 lg:relative lg:block">
          <div class="flex justify-start lg:absolute lg:left-[14.85%] lg:top-[36.76%]">
            <div class="flex flex-col items-center gap-6 lg:gap-[3.125rem]">
              <button
                type="button"
                (click)="manualPrev()"
                class="inline-flex h-[clamp(2.5rem,6.25vw,4.5rem)] w-[clamp(2.5rem,6.25vw,4.5rem)] items-center justify-center rounded-full bg-white text-[clamp(1.8rem,2.35vw,3rem)] text-black shadow-[0_24px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-1"
                aria-label="Previous branch"
              >
                <i class="bi bi-arrow-up"></i>
              </button>
              <button
                type="button"
                (click)="manualNext()"
                class="inline-flex h-[clamp(2.5rem,6.25vw,4.5rem)] w-[clamp(2.5rem,6.25vw,4.5rem)] items-center justify-center rounded-full bg-white text-[clamp(1.8rem,2.35vw,3rem)] text-black shadow-[0_24px_60px_rgba(0,0,0,0.22)] transition hover:translate-y-1"
                aria-label="Next branch"
              >
                <i class="bi bi-arrow-down"></i>
              </button>
            </div>
          </div>

          <div
            class="w-full max-w-[25.25rem] rounded-[1.5625rem] bg-[#d9d9d9]/[0.78] px-8 py-8 text-black shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-[10px] transition-all duration-500 sm:ml-auto lg:absolute lg:left-[69.17%] lg:top-[28.89vh] lg:ml-0 lg:h-[clamp(20.5rem,41.57vh,26.0625rem)] lg:w-[clamp(22.5rem,41.57vh,28.0625rem)] lg:px-[clamp(2.35rem,4.44vh,3rem)] lg:pb-[clamp(3.8rem,7.04vh,4.8rem)] lg:pt-[clamp(4.6rem,8.7vh,5.875rem)]"
            [class.translate-y-8]="isTransitioning"
            [class.opacity-0]="isTransitioning"
          >
            @if (selectedBranch) {
              <div class="flex h-full flex-col items-center text-center">
                <h1 class="max-w-[19rem] font-['Afacad'] text-[1.8rem] font-medium leading-[1.38] lg:text-[clamp(1.4rem,2.59vh,1.75rem)]">
                  <span class="block">HomeStay Dorm</span>
                  <span class="block">{{ getBranchDisplayName(selectedBranch) }}</span>
                </h1>

                <p class="mt-[clamp(1.9rem,3.61vh,2.45rem)] max-w-[18rem] font-['Afacad'] text-[0.95rem] italic leading-[1.28] text-black/90 lg:text-[clamp(0.8rem,1.48vh,1rem)]">
                  {{ getDisplayAddress(selectedBranch) }}
                </p>

                <div class="mt-10 lg:mt-auto">
                  <button
                    [routerLink]="['/rooms', selectedBranch.id]"
                    class="group inline-flex items-center gap-4 rounded-full px-4 py-2 font-['Afacad'] text-[1.65rem] italic leading-[1.15] text-black transition hover:text-[#264893] lg:text-[clamp(1.35rem,2.59vh,1.75rem)]"
                  >
                    <span>{{ 'DASHBOARD.VIEW_MORE' | translate }}</span>
                    <i class="bi bi-arrow-right text-[1.75rem] transition-transform group-hover:translate-x-1 lg:text-[clamp(1.4rem,2.78vh,1.875rem)]"></i>
                  </button>
                </div>
              </div>
            } @else {
              <div class="flex h-full items-center justify-center text-center">
                <h2 class="text-3xl font-medium">{{ 'DASHBOARD.EMPTY_STATE' | translate }}</h2>
              </div>
            }
          </div>

          <div class="flex justify-end lg:absolute lg:left-[70.16%] lg:top-[79.26vh] lg:w-[clamp(20rem,37.96vh,25.625rem)]">
            <label class="relative block w-full max-w-[24rem] lg:max-w-none">
              <span class="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[1.7rem] text-white lg:text-[clamp(1.35rem,2.5vh,1.7rem)]">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearch()"
                [placeholder]="'DASHBOARD.SEARCH_PLACEHOLDER' | translate"
                class="h-[4.1rem] w-full rounded-full border-[3px] border-white bg-transparent pl-[4.05rem] pr-6 font-['Afacad'] text-[1.35rem] italic text-white outline-none placeholder:text-white/95 lg:h-[clamp(3.5rem,6.48vh,4.375rem)] lg:pl-[clamp(3.3rem,6vh,4.05rem)] lg:text-[clamp(1.2rem,2.31vh,1.55rem)]"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly branchService = inject(BranchService);
  private readonly cdr = inject(ChangeDetectorRef);

  branches: Branch[] = [];
  filteredBranches: Branch[] = [];
  selectedBranch: Branch | null = null;
  searchQuery = '';
  currentIndex = 0;
  isTransitioning = false;
  autoPlayTimer: number | null = null;

  ngOnInit(): void {
    this.branchService.getBranches().subscribe((data) => {
      this.branches = data;
      this.filteredBranches = data;

      if (data.length > 0) {
        this.selectedBranch = this.getInitialBranch(data);
        this.currentIndex = this.filteredBranches.findIndex((branch) => branch.id === this.selectedBranch?.id);
        if (this.currentIndex < 0) {
          this.currentIndex = 0;
        }
        this.startAutoPlay();
      }

      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    this.autoPlayTimer = window.setInterval(() => {
      this.nextBranch();
    }, 5000);
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer !== null) {
      window.clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  triggerTransition(callback: () => void): void {
    this.isTransitioning = true;
    this.cdr.detectChanges();

    window.setTimeout(() => {
      callback();
      this.isTransitioning = false;
      this.cdr.detectChanges();
    }, 400);
  }

  manualNext(): void {
    this.stopAutoPlay();
    this.nextBranch();
    this.startAutoPlay();
  }

  manualPrev(): void {
    this.stopAutoPlay();
    this.prevBranch();
    this.startAutoPlay();
  }

  nextBranch(): void {
    if (this.filteredBranches.length === 0) {
      return;
    }

    this.triggerTransition(() => {
      this.currentIndex = (this.currentIndex + 1) % this.filteredBranches.length;
      this.selectedBranch = this.filteredBranches[this.currentIndex];
    });
  }

  prevBranch(): void {
    if (this.filteredBranches.length === 0) {
      return;
    }

    this.triggerTransition(() => {
      this.currentIndex = (this.currentIndex - 1 + this.filteredBranches.length) % this.filteredBranches.length;
      this.selectedBranch = this.filteredBranches[this.currentIndex];
    });
  }

  getSafeUrl(url: string | undefined): string {
    if (!url) {
      return '';
    }

    const cleanUrl = url.replace(/.*public\//, '').replace(/.*assets\//, 'assets/');
    const finalUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    return encodeURI(finalUrl);
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredBranches = query
      ? this.branches.filter((branch) => branch.name.toLowerCase().includes(query) || branch.address.toLowerCase().includes(query))
      : this.branches;

    if (this.filteredBranches.length > 0) {
      this.currentIndex = 0;
      this.selectedBranch = this.filteredBranches[0];
      this.isTransitioning = true;

      window.setTimeout(() => {
        this.isTransitioning = false;
        this.cdr.detectChanges();
      }, 400);

      this.startAutoPlay();
    } else {
      this.selectedBranch = null;
    }

    this.cdr.detectChanges();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }

  getHeroImageUrl(branch: Branch): string {
    const heroImage = branch.heroImage?.trim();
    const preset = this.getBranchVisualPreset(branch);

    if (!heroImage || this.isKnownMissingHeroImage(heroImage)) {
      return this.getSafeUrl(preset?.heroImage ?? BRANCH_VISUAL_PRESETS[0].heroImage);
    }

    return this.getSafeUrl(heroImage);
  }

  onHeroImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;

    if (!image || image.dataset['fallbackApplied'] === 'true') {
      return;
    }

    image.dataset['fallbackApplied'] = 'true';
    image.src = this.getSafeUrl(this.getBranchVisualPreset(this.selectedBranch)?.heroImage ?? BRANCH_VISUAL_PRESETS[0].heroImage);
  }

  getBranchDisplayName(branch: Branch): string {
    return branch.name.replace(/^homestay\s+dorm\s*/i, '').trim() || branch.name;
  }

  getDisplayAddress(branch: Branch): string {
    return this.getBranchVisualPreset(branch)?.displayAddress ?? branch.address;
  }

  private getInitialBranch(branches: Branch[]): Branch {
    const preferredBranch = branches.find((branch) => this.normalizeText(branch.name).includes('to hien thanh'));
    return preferredBranch ?? branches[0];
  }

  private getBranchVisualPreset(branch: Branch | null): BranchVisualPreset | undefined {
    if (!branch) {
      return undefined;
    }

    const searchableText = this.normalizeText(`${branch.name} ${branch.address} ${branch.heroImage ?? ''}`);
    return BRANCH_VISUAL_PRESETS.find((preset) => preset.keys.some((key) => searchableText.includes(key)));
  }

  private isKnownMissingHeroImage(heroImage: string): boolean {
    const normalizedHeroImage = this.normalizeText(heroImage);
    return normalizedHeroImage.includes('homepage to hien thanh.png');
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
