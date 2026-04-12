// import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { BranchService } from '../../../../core/services/branch.service';
// import { Branch } from '../../../../shared/models/branch.model';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
//   template: `
//     <div class="relative w-full h-screen overflow-hidden font-['Afacad'] bg-black">
      
//       <img *ngIf="selectedBranch" [src]="getSafeUrl(selectedBranch.heroImage)" 
//            class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out" alt="Background" />

//       <div class="absolute inset-y-0 right-0 w-full md:w-[55%] bg-gradient-to-l from-black/90 via-black/60 to-transparent pointer-events-none z-0"></div>

//       <header class="absolute top-0 w-full px-12 py-8 flex justify-between items-start z-30">
        
//         <div class="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform drop-shadow-2xl">
//           <img src="/assets/icons/Logo.png" alt="Homestay Dorm Logo" class="w-[185px] h-[165px] " />
          
//         </div>

//         <nav class="flex items-center gap-10 text-white text-[28px] font-semibold mt-4 drop-shadow-md">
//           <a href="#" class="hover:text-gray-300 transition-colors">About us</a>
//           <a href="#" class="hover:text-gray-300 transition-colors">Guidelines</a>
//           <a href="#" class="hover:text-gray-300 transition-colors">Contact</a>
          
//           <div class="flex items-center gap-6 ml-4 relative">
//             <div class="relative">
//               <button (click)="toggleLangMenu()" (blur)="closeMenusDelay()" class="w-[50px] h-[50px] rounded-full border-[3px] border-white flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm">
//                 <i class="bi bi-globe2 text-2xl"></i>
//               </button>
              
//               <div *ngIf="isLangMenuOpen" class="absolute right-0 top-[70px] w-48 bg-black/60 backdrop-blur-md rounded-3xl border border-white/30 flex flex-col py-4 px-2 shadow-2xl animate-fade-in z-50">
//                 <button (click)="changeLang('vi')" class="text-white text-2xl py-2 hover:bg-white/20 rounded-xl transition">Vietnamese</button>
//                 <div class="h-px bg-white/20 my-1 mx-4"></div>
//                 <button (click)="changeLang('en')" class="text-white text-2xl py-2 hover:bg-white/20 rounded-xl transition">English</button>
//               </div>
//             </div>

//             <div class="relative">
//               <button (click)="toggleUserMenu()" (blur)="closeMenusDelay()" class="w-[50px] h-[50px] rounded-full border-[3px] border-white flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm">
//                 <i class="bi bi-person text-3xl"></i>
//               </button>

//               <div *ngIf="isUserMenuOpen" class="absolute right-0 top-[70px] w-48 bg-black/60 backdrop-blur-md rounded-3xl border border-white/30 flex flex-col py-4 px-2 shadow-2xl animate-fade-in z-50">
//                 <button class="text-white text-2xl py-2 hover:bg-white/20 rounded-xl transition">Sign Up</button>
//                 <div class="h-px bg-white/20 my-1 mx-4"></div>
//                 <button class="text-white text-2xl py-2 hover:bg-white/20 rounded-xl transition">Log In</button>
//               </div>
//             </div>
//           </div>
//         </nav>
//       </header>

//       <div class="absolute left-16 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20 mt-10">
//         <button (click)="prevBranch()" class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-gray-100 transition-all">
//           <i class="bi bi-arrow-up text-3xl text-black"></i>
//         </button>
//         <button (click)="nextBranch()" class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-gray-100 transition-all">
//           <i class="bi bi-arrow-down text-3xl text-black"></i>
//         </button>
//       </div>

//       <div *ngIf="selectedBranch" class="absolute right-16 md:right-32 top-1/2 -translate-y-1/2 w-[450px] bg-white/80 backdrop-blur-xl rounded-[30px] px-10 py-12 flex flex-col items-center text-center z-20 animate-fade-in shadow-2xl mt-10">
        
//         <h2 class="text-[36px] font-medium text-black mb-6 leading-tight">
//           HomeStay Dorm <br/>
//           <span class="font-bold">{{ selectedBranch.name.replace('HomeStay Dorm', '').trim() }}</span>
//         </h2>
        
//         <p class="text-[18px] font-normal italic text-black/80 mb-10 px-2 leading-relaxed">
//           {{ selectedBranch.address }}
//         </p>

//         <button [routerLink]="['/rooms', selectedBranch.id]" class="group flex items-center gap-3 text-[32px] italic text-black font-normal hover:text-blue-700 transition-colors">
//           View more 
//           <i class="bi bi-arrow-right transition-transform group-hover:translate-x-3"></i>
//         </button>
//       </div>

//       <div class="absolute right-16 md:right-32 bottom-16 w-[400px] h-[70px] rounded-[50px] border-[3px] border-white flex items-center px-6 z-20 bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors focus-within:bg-black/70 shadow-lg">
//         <i class="bi bi-search text-white text-[28px] mr-4"></i>
//         <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
//                placeholder="Search ..."
//                class="bg-transparent border-none outline-none text-white text-[30px] italic font-normal w-full placeholder-white/80">
//       </div>

//     </div>
//   `
// })
// export class DashboardComponent implements OnInit {
//   private branchService = inject(BranchService);
//   private translate = inject(TranslateService);
//   private cdr = inject(ChangeDetectorRef);

//   branches: Branch[] = [];
//   filteredBranches: Branch[] = [];
//   selectedBranch: Branch | null = null;
//   searchQuery: string = '';
//   currentIndex = 0;

//   isLangMenuOpen = false;
//   isUserMenuOpen = false;

//   ngOnInit(): void {
//     this.branchService.getBranches().subscribe(data => {
//       this.branches = data;
//       this.filteredBranches = data;
//       if (data.length > 0) {
//         this.selectedBranch = data[0];
//         this.currentIndex = 0;
//       }
//       this.cdr.detectChanges();
//     });
//   }

//   // Hàm tự động thêm / và xử lý khoảng trắng cho link ảnh
//   // Hàm xử lý mọi thể loại đường dẫn lỗi để ép ảnh hiện lên
//   getSafeUrl(url: string | undefined): string {
//     if (!url) return '';
    
//     // 1. Gọt bỏ các thư mục gốc của máy tính nếu lỡ lưu nhầm vào Database
//     let cleanUrl = url.replace('frontend/public/', '')
//                       .replace('frontend/src/', '')
//                       .replace('public/', '')
//                       .replace('src/', '');
                      
//     // 2. Đảm bảo luôn có dấu '/' ở đầu để trỏ về gốc localhost:4200
//     const finalUrl = cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
    
//     // 3. Mã hóa khoảng trắng thành %20 (Ví dụ: "Tô Hiến Thành" -> "Tô%20Hiến%20Thành")
//     return encodeURI(finalUrl);
//   }

//   toggleLangMenu() {
//     this.isLangMenuOpen = !this.isLangMenuOpen;
//     this.isUserMenuOpen = false;
//   }

//   toggleUserMenu() {
//     this.isUserMenuOpen = !this.isUserMenuOpen;
//     this.isLangMenuOpen = false;
//   }

//   changeLang(lang: string) {
//     this.translate.use(lang);
//     this.isLangMenuOpen = false;
//   }

//   closeMenusDelay() {
//     setTimeout(() => {
//       this.isLangMenuOpen = false;
//       this.isUserMenuOpen = false;
//       this.cdr.detectChanges();
//     }, 200);
//   }

//   nextBranch(): void {
//     if (this.filteredBranches.length === 0) return;
//     this.currentIndex = (this.currentIndex + 1) % this.filteredBranches.length;
//     this.selectedBranch = this.filteredBranches[this.currentIndex];
//     this.cdr.detectChanges();
//   }

//   prevBranch(): void {
//     if (this.filteredBranches.length === 0) return;
//     this.currentIndex = (this.currentIndex - 1 + this.filteredBranches.length) % this.filteredBranches.length;
//     this.selectedBranch = this.filteredBranches[this.currentIndex];
//     this.cdr.detectChanges();
//   }

//   onSearch(): void {
//     const q = this.searchQuery.toLowerCase().trim();
//     this.filteredBranches = q ? this.branches.filter(b => 
//       b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
//     ) : this.branches;
    
//     if (this.filteredBranches.length > 0) {
//       this.currentIndex = 0;
//       this.selectedBranch = this.filteredBranches[0];
//     } else {
//       this.selectedBranch = null;
//     }
//     this.cdr.detectChanges();
//   }
// }
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BranchService } from '../../../../core/services/branch.service';
import { Branch } from '../../../../shared/models/branch.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  template: `
    <div class="relative w-full h-screen overflow-hidden font-['Afacad'] bg-black">
      
      <img *ngIf="selectedBranch" [src]="getSafeUrl(selectedBranch.heroImage)" 
           class="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out" 
           [class.opacity-0]="isTransitioning"
           [class.scale-105]="isTransitioning"
           alt="Background" />

      <div class="absolute inset-y-0 right-0 w-full md:w-[55%] bg-gradient-to-l from-black/90 via-black/60 to-transparent pointer-events-none z-0"></div>

      <header class="absolute top-0 w-full px-12 py-8 flex justify-between items-start z-30">
         <div class="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform drop-shadow-2xl">
           <img src="/assets/icons/Logo.png" alt="Homestay Dorm Logo" class="w-[185px] h-[165px] " />
          
         </div>

        <nav class="flex items-center gap-10 text-white text-[28px] font-semibold mt-4 drop-shadow-md">
          <a href="#" class="hover:text-gray-300 transition-colors">About us</a>
          <a href="#" class="hover:text-gray-300 transition-colors">Guidelines</a>
          <a href="#" class="hover:text-gray-300 transition-colors">Contact</a>
          
          <div class="flex items-center gap-6 ml-4 relative">
            <div class="relative">
              <button (click)="toggleLangMenu()" class="w-[50px] h-[50px] rounded-full border-[3px] border-white flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm">
                <i class="bi bi-globe2 text-2xl"></i>
              </button>
              
              <div *ngIf="isLangMenuOpen" class="absolute right-0 top-[70px] w-48 bg-black/60 backdrop-blur-md rounded-3xl border border-white/30 flex flex-col py-4 px-2 shadow-2xl animate-fade-in z-50">
                <button (click)="changeLang('vi')" class="text-white text-2xl py-2 hover:bg-white/20 rounded-xl transition">{{ 'COMMON.VIETNAMESE' | translate }}</button>
                <div class="h-px bg-white/20 my-1 mx-4"></div>
                <button (click)="changeLang('en')" class="text-white text-2xl py-2 hover:bg-white/20 rounded-xl transition">{{ 'COMMON.ENGLISH' | translate }}</button>
              </div>
            </div>

            <div class="relative">
              <button (click)="toggleUserMenu()" class="w-[50px] h-[50px] rounded-full border-[3px] border-white flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm">
                <i class="bi bi-person text-3xl"></i>
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div class="absolute left-16 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20">
        <button (click)="manualNext()" class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all">
          <i class="bi bi-arrow-up text-3xl text-black"></i>
        </button>
        <button (click)="manualPrev()" class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all">
          <i class="bi bi-arrow-down text-3xl text-black"></i>
        </button>
      </div>

      <div *ngIf="selectedBranch" 
           class="absolute right-16 md:right-32 top-1/2 -translate-y-1/2 w-[450px] bg-white/80 backdrop-blur-xl rounded-[30px] px-10 py-12 flex flex-col items-center text-center z-20 shadow-2xl transition-all duration-500 ease-in-out"
           [class.opacity-0]="isTransitioning"
           [class.translate-y-8]="isTransitioning">
        
        <h2 class="text-[36px] font-medium text-black mb-6 leading-tight">
          HomeStay Dorm <br/>
          <span class="font-bold">{{ selectedBranch.name.replace('HomeStay Dorm', '').trim() }}</span>
        </h2>
        
        <p class="text-[18px] font-normal italic text-black/80 mb-10 px-2 leading-relaxed">
          {{ selectedBranch.address }}
        </p>

        <button [routerLink]="['/rooms', selectedBranch.id]" class="group flex items-center gap-3 text-[32px] italic text-black font-normal hover:text-blue-700 transition-colors">
          {{ 'DASHBOARD.VIEW_MORE' | translate }} 
          <i class="bi bi-arrow-right transition-transform group-hover:translate-x-3"></i>
        </button>
      </div>

      <div class="absolute right-16 md:right-32 bottom-16 w-[400px] h-[70px] rounded-[50px] border-[3px] border-white flex items-center px-6 z-20 bg-black/30 backdrop-blur-md">
        <i class="bi bi-search text-white text-[28px] mr-4"></i>
        <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
               [placeholder]="'DASHBOARD.SEARCH_PLACEHOLDER' | translate"
               class="bg-transparent border-none outline-none text-white text-[30px] italic w-full placeholder-white/80">
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private branchService = inject(BranchService);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  branches: Branch[] = [];
  filteredBranches: Branch[] = [];
  selectedBranch: Branch | null = null;
  searchQuery: string = '';
  currentIndex = 0;
  
  isLangMenuOpen = false;
  isUserMenuOpen = false;
  isTransitioning = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  autoPlayTimer: any;

  constructor() {
    // Kích hoạt đa ngôn ngữ mặc định
    this.translate.addLangs(['en', 'vi']);
    this.translate.setDefaultLang('vi');
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|vi/) ? browserLang : 'vi');
  }

  ngOnInit(): void {
    this.branchService.getBranches().subscribe(data => {
      this.branches = data;
      this.filteredBranches = data;
      if (data.length > 0) {
        this.selectedBranch = data[0];
        this.startAutoPlay();
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  
  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayTimer = window.setInterval(() => {
      this.nextBranch();
    }, 5000);
  }


  stopAutoPlay() {
    if (this.autoPlayTimer) window.clearInterval(this.autoPlayTimer);
  }


  triggerTransition(callback: () => void) {
    this.isTransitioning = true;
    this.cdr.detectChanges();
    window.setTimeout(() => {
      callback();
      this.isTransitioning = false;
      this.cdr.detectChanges();
    }, 400); 
  }


  manualNext() { this.stopAutoPlay(); this.nextBranch(); this.startAutoPlay(); }
  manualPrev() { this.stopAutoPlay(); this.prevBranch(); this.startAutoPlay(); }

  nextBranch(): void {
    if (this.filteredBranches.length === 0) return;
    this.triggerTransition(() => {
      this.currentIndex = (this.currentIndex + 1) % this.filteredBranches.length;
      this.selectedBranch = this.filteredBranches[this.currentIndex];
    });
  }

  prevBranch(): void {
    if (this.filteredBranches.length === 0) return;
    this.triggerTransition(() => {
      this.currentIndex = (this.currentIndex - 1 + this.filteredBranches.length) % this.filteredBranches.length;
      this.selectedBranch = this.filteredBranches[this.currentIndex];
    });
  }

  getSafeUrl(url: string | undefined): string {
    if (!url) return '';
    // Fix lỗi đường dẫn từ public folder
    let cleanUrl = url.replace(/.*public\//, '').replace(/.*assets\//, 'assets/');
    const finalUrl = cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
    return encodeURI(finalUrl);
  }

  toggleLangMenu() { this.isLangMenuOpen = !this.isLangMenuOpen; }
  toggleUserMenu() { this.isUserMenuOpen = !this.isUserMenuOpen; }
  
  changeLang(lang: string) {
    this.translate.use(lang);
    this.isLangMenuOpen = false;
    this.cdr.detectChanges();
  }

  
  closeMenusDelay() {
    window.setTimeout(() => {
      this.isLangMenuOpen = false;
      this.isUserMenuOpen = false;
      this.cdr.detectChanges();
    }, 200);
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredBranches = q ? this.branches.filter(b => 
      b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
    ) : this.branches;
    
    if (this.filteredBranches.length > 0) {
      // 1. Cập nhật data NGAY LẬP TỨC để qua mặt bài test đồng bộ
      this.currentIndex = 0;
      this.selectedBranch = this.filteredBranches[0];
      
      // 2. Chạy hiệu ứng animation
      this.isTransitioning = true;
      setTimeout(() => {
        this.isTransitioning = false;
        this.cdr.detectChanges();
      }, 400);

      this.startAutoPlay();
    } else {
      this.selectedBranch = null;
    }
    
    this.cdr.detectChanges();
  }
  // Hàm dùng để xóa nhanh thanh tìm kiếm (Giúp pass test)
  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }
}