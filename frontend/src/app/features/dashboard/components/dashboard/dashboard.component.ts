import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BranchService } from '../../../../core/services/branch.service';
import { Branch } from '../../../../shared/models/branch.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-12">
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
            {{ 'DASHBOARD.TITLE' | translate }}
          </h1>
          <div class="relative w-full md:w-96">
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch()"
              [placeholder]="'DASHBOARD.SEARCH_PLACEHOLDER' | translate"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
            <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ng-container *ngIf="filteredBranches.length > 0; else emptyState">
          <section *ngIf="selectedBranch" class="mb-12 animate-fade-in">
            <div class="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-xl group">
              <img 
                [src]="selectedBranch.heroImage" 
                [alt]="selectedBranch.name" 
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                (error)="handleImageError($event)"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
              
              <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                <div class="inline-flex items-center px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-sm text-sm font-medium mb-4">
                  {{ selectedBranch.roomCount }} {{ 'DASHBOARD.ROOMS_AVAILABLE' | translate }}
                </div>
                <h2 class="text-3xl md:text-5xl font-bold mb-3">{{ selectedBranch.name }}</h2>
                <div class="flex items-center text-gray-200 mb-4">
                  <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ selectedBranch.address }}
                </div>
                <p class="text-gray-300 max-w-2xl text-base md:text-lg line-clamp-2 md:line-clamp-none mb-6">
                  {{ selectedBranch.description }}
                </p>
                <button 
                  [routerLink]="['/rooms', selectedBranch.id]" 
                  class="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                >
                  {{ 'DASHBOARD.VIEW_MORE' | translate }}
                </button>
              </div>
            </div>
          </section>

          <section>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                *ngFor="let branch of filteredBranches" 
                (click)="selectBranch(branch)"
                class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                [ngClass]="{'ring-2 ring-blue-500 shadow-md': selectedBranch?.id === branch.id}"
              >
                <div class="h-48 overflow-hidden relative">
                  <img 
                    [src]="branch.heroImage" 
                    [alt]="branch.name" 
                    class="w-full h-full object-cover"
                    (error)="handleImageError($event)"
                  >
                  <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-700">
                    {{ branch.roomCount }} {{ 'DASHBOARD.ROOMS_AVAILABLE' | translate }}
                  </div>
                </div>
                <div class="p-5">
                  <h3 class="text-xl font-bold text-gray-900 mb-1">{{ branch.name }}</h3>
                  <p class="text-sm text-gray-500 mb-3 line-clamp-1">{{ branch.address }}</p>
                  <p class="text-gray-600 text-sm line-clamp-2">{{ branch.description }}</p>
                </div>
              </div>
            </div>
          </section>
        </ng-container>

        <ng-template #emptyState>
          <div class="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
            <svg class="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-1">{{ 'DASHBOARD.EMPTY_STATE' | translate }}</h3>
            <button (click)="clearSearch()" class="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2">
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        </ng-template>
      </main>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private branchService = inject(BranchService);
  private cdr = inject(ChangeDetectorRef); 

  branches: Branch[] = [];
  filteredBranches: Branch[] = [];
  selectedBranch: Branch | null = null;
  searchQuery: string = '';

  ngOnInit(): void {
    this.branchService.getBranches().subscribe({
      next: (data) => {
        this.branches = data;
        this.filteredBranches = data;
        if (data.length > 0) {
          this.selectedBranch = data[0];
        }
        
        // 3. THÊM DÒNG NÀY: Ép Angular cập nhật HTML ngay lập tức!
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Failed to load branches', err)
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredBranches = this.branches;
    } else {
      this.filteredBranches = this.branches.filter(b => 
        b.name.toLowerCase().includes(query) || 
        b.address.toLowerCase().includes(query)
      );
    }
    
    // Auto-select first matching branch if current selection is not in filtered list
    if (this.filteredBranches.length > 0) {
      const isSelectedStillVisible = this.filteredBranches.some(b => b.id === this.selectedBranch?.id);
      if (!isSelectedStillVisible) {
        this.selectedBranch = this.filteredBranches[0];
      }
    } else {
      this.selectedBranch = null;
    }
  }

  selectBranch(branch: Branch): void {
    this.selectedBranch = branch;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }

  handleImageError(event: any): void {
    // Fallback if image fails to load
    event.target.src = 'https://placehold.co/800x500/e2e8f0/475569?text=HomeStay+Dorm';
  }
}