import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BranchService } from '@core/services/branch.service';
import { Branch } from '@shared/models/branch.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <section class="relative min-h-screen overflow-hidden font-['Afacad'] text-white">
      @if (selectedBranch) {
        <img
          [src]="getSafeUrl(selectedBranch.heroImage)"
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
                class="inline-flex h-[clamp(4.5rem,6.25vw,7.5rem)] w-[clamp(4.5rem,6.25vw,7.5rem)] items-center justify-center rounded-full bg-white text-[clamp(1.8rem,2.35vw,3rem)] text-black shadow-[0_24px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-1"
                aria-label="Previous branch"
              >
                <i class="bi bi-arrow-up"></i>
              </button>
              <button
                type="button"
                (click)="manualNext()"
                class="inline-flex h-[clamp(4.5rem,6.25vw,7.5rem)] w-[clamp(4.5rem,6.25vw,7.5rem)] items-center justify-center rounded-full bg-white text-[clamp(1.8rem,2.35vw,3rem)] text-black shadow-[0_24px_60px_rgba(0,0,0,0.22)] transition hover:translate-y-1"
                aria-label="Next branch"
              >
                <i class="bi bi-arrow-down"></i>
              </button>
            </div>
          </div>

          <div
            class="w-full max-w-[25.25rem] rounded-[1.5625rem] bg-white/62 px-8 py-8 text-black shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-[10px] transition-all duration-500 sm:ml-auto lg:absolute lg:left-[69.11%] lg:top-[27.85%] lg:ml-0 lg:h-[25.25rem] lg:w-[21.1%] lg:min-w-[23.5rem] lg:max-w-[25.25rem] lg:px-[2.55rem] lg:py-[3.8rem]"
            [class.translate-y-8]="isTransitioning"
            [class.opacity-0]="isTransitioning"
          >
            @if (selectedBranch) {
              <div class="flex h-full flex-col items-center text-center">
                <h1 class="max-w-[17rem] font-['Afacad'] text-[1.8rem] font-medium leading-[1.25] lg:text-[1.95rem]">
                  {{ selectedBranch.name }}
                </h1>

                <p class="mt-5 max-w-[15.5rem] font-['Afacad'] text-[0.95rem] italic leading-[1.32] text-black/72 lg:text-[1rem]">
                  {{ selectedBranch.address }}
                </p>

                <div class="mt-10 lg:mt-auto">
                  <button
                    [routerLink]="['/rooms', selectedBranch.id]"
                    class="group inline-flex items-center gap-4 rounded-full px-4 py-2 font-['Afacad'] text-[1.65rem] italic leading-[1.15] text-black transition hover:text-sky-700 lg:text-[1.8rem]"
                  >
                    <span>{{ 'DASHBOARD.VIEW_MORE' | translate }}</span>
                    <i class="bi bi-arrow-right text-[1.75rem] transition-transform group-hover:translate-x-1 lg:text-[1.9rem]"></i>
                  </button>
                </div>
              </div>
            } @else {
              <div class="flex h-full items-center justify-center text-center">
                <h2 class="text-3xl font-medium">{{ 'DASHBOARD.EMPTY_STATE' | translate }}</h2>
              </div>
            }
          </div>

          <div class="flex justify-end lg:absolute lg:left-[70.21%] lg:top-[80.2%] lg:w-[21.25%] lg:min-w-[22.5rem] lg:max-w-[25.5rem]">
            <label class="relative block w-full max-w-[24rem] lg:max-w-none">
              <span class="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[1.5rem] text-white">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearch()"
                [placeholder]="'DASHBOARD.SEARCH_PLACEHOLDER' | translate"
                class="h-[4.1rem] w-full rounded-full border-[3px] border-white bg-transparent pl-[3.8rem] pr-6 font-['Afacad'] text-[1.35rem] italic text-white outline-none placeholder:text-white/85 lg:h-[4.375rem] lg:text-[1.55rem]"
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

  private getInitialBranch(branches: Branch[]): Branch {
    const preferredBranch = branches.find((branch) => this.normalizeText(branch.name).includes('to hien thanh'));
    return preferredBranch ?? branches[0];
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
