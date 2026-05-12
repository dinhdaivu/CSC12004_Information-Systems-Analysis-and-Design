import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MyBookingService } from '../../../../core/services/my-booking.service';
import { AuthService } from '../../../../core/services/auth.service';

interface BookingRecord {
  id: string;
  status: string;
  rooms?: { room_number: string };
}

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  styles: [`
    .booking-scroll-container::-webkit-scrollbar {
      width: 8px;
    }
    .booking-scroll-container::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.05);
      border-radius: 10px;
    }
    .booking-scroll-container::-webkit-scrollbar-thumb {
      background: #9ca3af;
      border-radius: 10px;
    }
  `],
  template: `
    <div [style.height.px]="1080 * scaleFactor" style="width: 100%; overflow: hidden; position: relative; background: #FEF4DF;">
      <div [style.transform]="'scale(' + scaleFactor + ')'" style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 1080px;">
        <div style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden">
            
          <div style="width: 1920px; height: 644px; left: 0px; top: -5px; position: absolute; background: #503D2E"></div>
          
          <img style="width: 1133px; height: 638px; left: 552px; top: 0px; position: absolute; object-fit: cover" src="assets/pictures/Background.png" alt="Background" />
          
          <div style="width: 2000px; height: 622px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1920px; height: 698px; left: 0px; top: 393px; position: absolute; background: #FEF4DF"></div>
          
          <img src="assets/pictures/Union.png" style="position: absolute; left: 0px; top: 0px; height: 1080px; object-fit: cover; pointer-events: none" alt="Sidebar Background" />

          <div (click)="navigate('/guidelines')" style="width: 152px; height: 53px; left: 1238px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.GUIDELINES' | translate }}</div>
          <div (click)="navigate('/about')" style="width: 126px; height: 53px; left: 1071px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.ABOUT_US' | translate }}</div>
          <div (click)="navigate('/contact')" style="width: 135px; height: 53px; left: 1431px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.CONTACT' | translate }}</div>
          
          <img (click)="toggleLangMenu()" style="width: 75px; height: 75px; left: 1620px; top: 95px; position: absolute; cursor: pointer; z-index: 50;" src="assets/icons/Globe.png" />
          <div *ngIf="isLangMenuOpen" style="position: absolute; left: 1550px; top: 180px; width: 192px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
            <div (click)="changeLang('en')" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ 'COMMON.ENGLISH' | translate }}</div>
            <div (click)="changeLang('vi')" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ 'COMMON.VIETNAMESE' | translate }}</div>
          </div>
          
          <img (click)="toggleUserMenu()" style="width: 70px; height: 70px; left: 1750px; top: 100px; position: absolute; cursor: pointer; z-index: 50;" src="assets/icons/Account.png" />
          <div *ngIf="isUserMenuOpen" style="position: absolute; left: 1680px; top: 180px; width: 150px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
            <div (click)="navigate('/profile')" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ 'COMMON.PROFILE' | translate }}</div>
            <div (click)="logout()" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #ff4d4f; font-size: 24px; cursor: pointer;">{{ 'COMMON.LOGOUT' | translate }}</div>
          </div>
          
          <img (click)="navigate('/')" style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; object-fit: contain; cursor: pointer; z-index: 50;" src="assets/icons/FooterLogo.png" alt="Homestay Dorm Logo" />
          
          <div (click)="navigate('/profile')" style="width: 126px; height: 62px; left: 191px; top: 331px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.PROFILE' | translate }}</div>
          <img src="assets/icons/Group 22.png" style="width: 40px; height: 40px; left: 132px; top: 342px; position: absolute; object-fit: contain; z-index: 50;" alt="Profile Icon" />
          
          <div (click)="navigate('/bookings')" style="width: 156px; height: 61px; left: 191px; top: 424px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.BOOKING' | translate }}</div>
          <img src="assets/icons/Group 23.png" style="width: 40px; height: 40px; left: 132px; top: 435px; position: absolute; object-fit: contain; z-index: 50;" alt="Booking Icon" />
          
          <div (click)="navigate('/contracts')" style="width: 126px; height: 62px; left: 188px; top: 527px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.CONTRACT' | translate }}</div>
          <img src="assets/icons/Contracts.png" style="width: 40px; height: 40px; left: 132px; top: 538px; position: absolute; object-fit: contain; z-index: 50;" alt="Contract Icon" />
          
          <div style="width: 400px; height: 209px; left: 0px; top: 870px; position: absolute; text-align: center">
            <span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.TITLE' | translate }}<br/><br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.HEADQUARTERS' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.ADDRESS_1' | translate }}<br/>{{ 'CONTACT_INFO.ADDRESS_2' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.PHONE_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.PHONE' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.EMAIL_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.EMAIL' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.HOURS_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.HOURS' | translate }}</span>
          </div>

          <div style="position: absolute; left: 500px; top: 180px; display: flex; gap: 20px; z-index: 60;">
            <button (click)="filterStatus('')" [style.background]="currentFilter === '' ? '#264893' : 'white'" [style.color]="currentFilter === '' ? 'white' : '#264893'" style="padding: 10px 20px; border-radius: 20px; border: 2px solid #264893; font-family: Afacad; font-weight: bold; cursor: pointer;">{{ 'MY_BOOKINGS.FILTERS.ALL' | translate }}</button>
            <button (click)="filterStatus('pending')" [style.background]="currentFilter === 'pending' ? '#264893' : 'white'" [style.color]="currentFilter === 'pending' ? 'white' : '#264893'" style="padding: 10px 20px; border-radius: 20px; border: 2px solid #264893; font-family: Afacad; font-weight: bold; cursor: pointer;">{{ 'MY_BOOKINGS.TRACKING.STEPS.PROCESSING.LABEL' | translate }}</button>
            <button (click)="filterStatus('confirmed')" [style.background]="currentFilter === 'confirmed' ? '#264893' : 'white'" [style.color]="currentFilter === 'confirmed' ? 'white' : '#264893'" style="padding: 10px 20px; border-radius: 20px; border: 2px solid #264893; font-family: Afacad; font-weight: bold; cursor: pointer;">{{ 'MY_BOOKINGS.TRACKING.STEPS.ACCEPTED.LABEL' | translate }}</button>
            <button (click)="filterStatus('cancelled')" [style.background]="currentFilter === 'cancelled' ? '#264893' : 'white'" [style.color]="currentFilter === 'cancelled' ? 'white' : '#264893'" style="padding: 10px 20px; border-radius: 20px; border: 2px solid #264893; font-family: Afacad; font-weight: bold; cursor: pointer;">{{ 'MY_BOOKINGS.TRACKING.STEPS.CANCELLED.LABEL' | translate }}</button>
          </div>

          <div *ngIf="bookings.length === 0 && !isLoading" style="width: 1317px; left: 500px; top: 350px; position: absolute; display: flex; flex-direction: column; align-items: center; gap: 24px; z-index: 50;">
            <div style="text-align: center; color: #595959; font-size: 32px; font-family: Big Shoulders Text; font-weight: bold;">
              {{ 'MY_BOOKINGS.MESSAGES.EMPTY' | translate }}
            </div>
            <button (click)="navigate('/dashboard')" style="padding: 12px 32px; background-color: #264893; color: white; border: none; border-radius: 20px; font-family: Afacad; font-size: 24px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              {{ 'NAV.PUBLIC.HOME' | translate }} &rarr;
            </button>
          </div>

          <!-- Scrollable Container -->
          <div class="booking-scroll-container" style="position: absolute; left: 500px; top: 250px; width: 1317px; height: 730px; overflow-y: auto; z-index: 10; padding-right: 15px;">
            <div *ngFor="let booking of bookings; let i = index" style="position: relative; width: 100%; margin-bottom: 30px;">
              <!-- Card for each booking -->
              <div style="width: 100%; height: 730px; position: relative; background: rgba(246.42, 246.42, 246.42, 0.70); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px">
                
                <!-- Card Content with relative positions -->
                <div style="width: 684px; height: 30px; left: 93px; top: 86px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">
                  {{ 'MY_BOOKINGS.TRACKING.TITLE' | translate }} {{ booking.rooms?.room_number ? '- ' + ('COMMON.ROOM' | translate) + ' ' + booking.rooms?.room_number : '' }}
                </div>
                <div style="width: 889px; height: 30px; left: 93px; top: 143px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">
                  {{ 'MY_BOOKINGS.TRACKING.SUBTITLE' | translate }}
                </div>
                
                <button *ngIf="canCancel(booking.status)" (click)="cancelBooking(booking.id)" style="position: absolute; left: 1050px; top: 86px; padding: 12px 24px; background-color: #ff4d4f; color: white; border: none; border-radius: 12px; font-family: Afacad; font-size: 20px; cursor: pointer; font-weight: bold; z-index: 20; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  {{ 'MY_BOOKINGS.ACTIONS.CANCEL_REQUEST' | translate }}
                </button>
                
                <div style="width: 746px; height: 0px; left: 268px; top: 307px; position: absolute; outline: 3px #D9D9D9 solid; outline-offset: -1.50px"></div>
                
                <div [style.width.px]="getLineWidth(booking.status)" style="height: 0px; left: 268px; top: 307px; position: absolute; outline: 3px #264893 solid; outline-offset: -1.50px; transition: width 0.3s ease;"></div>
                
                <div [style.background]="getStepBg(booking.status, 1)" style="width: 60px; height: 60px; left: 238px; top: 277px; position: absolute; border-radius: 9999px"></div>
                <div [style.color]="getStepColor(booking.status, 1)" style="width: 29px; height: 60px; left: 253px; top: 277px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; font-size: 32px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">1</div>
                <div [style.color]="getTextColor(booking.status, 1)" style="width: 240px; height: auto; min-height: 40px; left: 148px; top: 355px; position: absolute; text-align: center; justify-content: flex-start; display: flex; flex-direction: column; font-size: 32px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">{{ 'MY_BOOKINGS.TRACKING.STEPS.PROCESSING.LABEL' | translate }}</div>
                <div [style.color]="getTextColor(booking.status, 1)" style="width: 240px; height: auto; min-height: 50px; left: 148px; top: 405px; position: absolute; text-align: center; justify-content: flex-start; display: flex; flex-direction: column; font-size: 16px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word" [innerHTML]="'MY_BOOKINGS.TRACKING.STEPS.PROCESSING.DESC' | translate"></div>

                <div [style.background]="getStepBg(booking.status, 2)" style="width: 60px; height: 60px; left: 485px; top: 277px; position: absolute; border-radius: 9999px"></div>
                <div [style.color]="getStepColor(booking.status, 2)" style="width: 29px; height: 60px; left: 500px; top: 277px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; font-size: 32px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">2</div>
                <div [style.color]="getTextColor(booking.status, 2)" style="width: 240px; height: auto; min-height: 40px; left: 395px; top: 355px; position: absolute; text-align: center; justify-content: flex-start; display: flex; flex-direction: column; font-size: 32px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">{{ 'MY_BOOKINGS.TRACKING.STEPS.ACCEPTED.LABEL' | translate }}</div>
                <div [style.color]="getTextColor(booking.status, 2)" style="width: 240px; height: auto; min-height: 50px; left: 395px; top: 405px; position: absolute; text-align: center; justify-content: flex-start; display: flex; flex-direction: column; font-size: 16px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word" [innerHTML]="'MY_BOOKINGS.TRACKING.STEPS.ACCEPTED.DESC' | translate"></div>

                <div [style.background]="getStepBg(booking.status, 3)" style="width: 60px; height: 60px; left: 737px; top: 277px; position: absolute; border-radius: 9999px"></div>
                <div [style.color]="getStepColor(booking.status, 3)" style="width: 29px; height: 60px; left: 752px; top: 277px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; font-size: 32px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">3</div>
                <div [style.color]="getTextColor(booking.status, 3)" style="width: 240px; height: auto; min-height: 40px; left: 647px; top: 355px; position: absolute; text-align: center; justify-content: flex-start; display: flex; flex-direction: column; font-size: 32px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">{{ booking.status === 'cancelled' ? ('MY_BOOKINGS.TRACKING.STEPS.CANCELLED.LABEL' | translate) : ('MY_BOOKINGS.TRACKING.STEPS.REJECTED.LABEL' | translate) }}</div>
                <div [style.color]="getTextColor(booking.status, 3)" style="width: 240px; height: auto; min-height: 50px; left: 647px; top: 405px; position: absolute; text-align: center; justify-content: flex-start; display: flex; flex-direction: column; font-size: 16px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word" [innerHTML]="'MY_BOOKINGS.TRACKING.STEPS.REJECTED.DESC' | translate"></div>

                <div [style.background]="getStepBg(booking.status, 4)" style="width: 60px; height: 60px; left: 985px; top: 277px; position: absolute; border-radius: 9999px"></div>
                <div [style.color]="getStepColor(booking.status, 4)" style="width: 29px; height: 60px; left: 1000px; top: 277px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; font-size: 32px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">4</div>
                <div [style.color]="getTextColor(booking.status, 4)" style="width: 240px; height: auto; min-height: 40px; left: 895px; top: 355px; position: absolute; text-align: center; justify-content: flex-start; display: flex; flex-direction: column; font-size: 32px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">{{ 'MY_BOOKINGS.TRACKING.STEPS.PENDING_DEPOSIT.LABEL' | translate }}</div>
                <div [style.color]="getTextColor(booking.status, 4)" style="width: 240px; height: auto; min-height: 50px; left: 895px; top: 405px; position: absolute; text-align: center; justify-content: flex-start; display: flex; flex-direction: column; font-size: 16px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word" [innerHTML]="'MY_BOOKINGS.TRACKING.STEPS.PENDING_DEPOSIT.DESC' | translate"></div>

                <a (click)="navigate('/bookings/' + booking.id)" style="position: absolute; left: 1050px; top: 600px; font-family: Afacad; font-size: 24px; font-weight: bold; color: #264893; cursor: pointer; text-decoration: none; z-index: 20;">
                  {{ 'MY_BOOKINGS.ACTIONS.VIEW_DETAILS' | translate }} &rarr;
                </a>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `
})
export class BookingsListComponent implements OnInit {
  isLangMenuOpen = false;
  isUserMenuOpen = false;
  isAuthenticated = false;
  scaleFactor = 1;
  
  allBookings: BookingRecord[] = [];
  bookings: BookingRecord[] = [];
  currentFilter = '';
  isLoading = true;

  constructor(
    private myBookingService: MyBookingService,
    private translate: TranslateService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef 
  ) {
    const browserLang = translate.getBrowserLang();
    const isForeign = browserLang && !browserLang.includes('vi');
    this.translate.setDefaultLang(isForeign ? 'en' : 'vi');
    this.translate.use(isForeign ? 'en' : 'vi');
  }

  @HostListener('window:resize')
  onResize() {
    this.scaleFactor = window.innerWidth / 1920;
  }
  
  ngOnInit(): void {
    this.onResize();
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadBookings();
  }

  toggleLangMenu() {
    this.isLangMenuOpen = !this.isLangMenuOpen;
    this.isUserMenuOpen = false;
    this.cdr.detectChanges();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isLangMenuOpen = false;
    this.cdr.detectChanges(); 
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    this.isLangMenuOpen = false;
    this.cdr.detectChanges(); 
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    try {
      const result = this.authService.logout() as { subscribe?: (cb: () => void) => void } | null | undefined;
      if (result && typeof result.subscribe === 'function') {
        result.subscribe(() => this.router.navigate(['/login']));
      } else {
        this.router.navigate(['/login']);
      }
    } catch {
      this.router.navigate(['/login']);
    }
    this.isUserMenuOpen = false;
  }

  loadBookings(): void {
    this.isLoading = true;

    this.myBookingService.getMyBookings({}).subscribe({
      next: (res: { data?: unknown[] }) => {
        const data = (res.data ?? []) as BookingRecord[];
        this.allBookings = data.length > 0 ? data : [];
        this.applyLocalFilter();
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Failed to load bookings', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterStatus(status: string): void {
    this.currentFilter = status;
    this.applyLocalFilter();
  }

  applyLocalFilter(): void {
    if (!this.currentFilter) {
      this.bookings = [...this.allBookings];
    } else {
      this.bookings = this.allBookings.filter(b => {
        if (this.currentFilter === 'pending') {
          return ['requested', 'reviewing', 'viewing_scheduled'].includes(b.status);
        }
        if (this.currentFilter === 'confirmed') {
          return ['accepted'].includes(b.status);
        }
        if (this.currentFilter === 'cancelled') {
          return ['cancelled', 'rejected'].includes(b.status);
        }
        return true;
      });
    }
    this.cdr.detectChanges();
  }

  canCancel(status: string): boolean {
    return ['requested', 'reviewing', 'viewing_scheduled'].includes(status);
  }

  cancelBooking(id: string): void {
    if (window.confirm(this.translate.instant('MY_BOOKINGS.ACTIONS.CONFIRM_CANCEL_MSG'))) {
      this.myBookingService.performAction(id, 'cancel').subscribe({
        next: () => {
          const target = this.allBookings.find(b => b.id === id);
          if (target) target.status = 'cancelled';
          this.applyLocalFilter();
        },
        error: (err: unknown) => {
          console.error(err);
          this.cdr.detectChanges();
        }
      });
    }
  }
  
  getStepLevel(status: string): number {
    if (['requested', 'reviewing', 'viewing_scheduled'].includes(status)) return 1;
    if (status === 'accepted') return 2;
    if (['rejected', 'cancelled'].includes(status)) return 3;
    if (status === 'deposit_pending') return 4;
    if (status === 'completed') return 4;
    return 1;
  }

  getLineWidth(status: string): number {
    const level = this.getStepLevel(status);
    if (level === 1) return 0;
    if (level === 2) return 247;
    if (level === 3) return 492;
    if (level >= 4) return 739;
    return 0;
  }

  getStepBg(status: string, step: number): string {
    const level = this.getStepLevel(status);
    if (step <= level) {
      return '#264893';
    }
    return '#D9D9D9';
  }

  getStepColor(status: string, step: number): string {
    const level = this.getStepLevel(status);
    return step <= level ? 'white' : '#595959';
  }

  getTextColor(status: string, step: number): string {
    const level = this.getStepLevel(status);
    return step <= level ? '#264893' : '#595959';
  }
}
