import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { timeout } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import type { User } from '@shared/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  styles: [`
    :host { display: block; }
    .page-text { font-family: Afacad, Arial, sans-serif; }
    .title-text { font-family: 'Big Shoulders Text', Impact, sans-serif; }
    .clickable { cursor: pointer; user-select: none; }
    .field {
      background: #d9d9d9;
      border: 0;
      border-radius: 8px;
      color: #111;
      font-family: Afacad, Arial, sans-serif;
      font-size: 18px;
      outline: none;
      padding: 0 20px;
      box-sizing: border-box;
    }
    select.field {
      cursor: pointer;
      appearance: auto;
    }
    .field-readonly {
      background: #d9d9d9;
      border-radius: 8px;
      color: #111;
      font-family: Afacad, Arial, sans-serif;
      font-size: 18px;
      padding: 0 20px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
    }
    .primary-btn {
      background: #264893;
      border: 0;
      border-radius: 40px;
      color: white;
      cursor: pointer;
      font-family: Afacad, Arial, sans-serif;
      font-size: 26px;
      font-weight: 700;
      height: 64px;
      padding: 0 42px;
      box-sizing: border-box;
    }
    .primary-btn:disabled { background: #8a96b8; cursor: not-allowed; }
    .secondary-btn {
      background: transparent;
      border: 3px solid #264893;
      border-radius: 40px;
      color: #264893;
      cursor: pointer;
      font-family: Afacad, Arial, sans-serif;
      font-size: 24px;
      font-weight: 700;
      height: 64px;
      padding: 0 42px;
      box-sizing: border-box;
    }
    .modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal {
      background: #f6f6f6;
      border-radius: 25px;
      box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25);
    }
  `],
  template: `
    <div [style.height.px]="1080 * scaleFactor" style="width: 100%; overflow: hidden; position: relative; background: #FEF4DF;">
      <div [style.transform]="'scale(' + scaleFactor + ')'" style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 1080px;">
        <div style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden">

          <!-- Background layers -->
          <div style="width: 1920px; height: 644px; left: 0; top: -5px; position: absolute; background: #503D2E"></div>
          <img style="width: 1133px; height: 638px; left: 552px; top: 0; position: absolute; object-fit: cover" src="assets/pictures/Background.png" alt="" />
          <div style="width: 2000px; height: 622px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1920px; height: 698px; left: 0; top: 393px; position: absolute; background: #FEF4DF"></div>

          <!-- Sidebar blue background -->
          <div style="position: absolute; left: 0; top: 0; width: 405px; height: 1080px; background: #264893; pointer-events: none;"></div>

          <!-- Active Profile tab indicator -->
          <div style="width: 307px; height: 78px; left: 98px; top: 253px; position: absolute; background: #264893; border-bottom-right-radius: 31px; z-index: 43;"></div>
          <div style="width: 307px; height: 78px; left: 98px; top: 393px; position: absolute; background: #264893; border-top-right-radius: 31px; z-index: 43;"></div>
          <div style="width: 335px; height: 62px; left: 98px; top: 331px; position: absolute; background: #FEF4DF; border-radius: 31px 0 0 31px; z-index: 45;"></div>

          <!-- Logo -->
          <img (click)="navigate('/')" class="clickable" style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; object-fit: contain; z-index: 50;" src="assets/icons/FooterLogo.png" alt="HomeStay Dorm" />

          <!-- Profile nav (ACTIVE) -->
          <img src="assets/icons/Group 22.png" style="width: 40px; height: 40px; left: 132px; top: 342px; position: absolute; object-fit: contain; z-index: 50; filter: brightness(0) saturate(100%) invert(24%) sepia(34%) saturate(1800%) hue-rotate(199deg) brightness(92%) contrast(93%);" alt="" />
          <div class="page-text" style="width: 126px; height: 62px; left: 191px; top: 331px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #264893; font-size: 32px; font-weight: 600; z-index: 50;">{{ 'COMMON.PROFILE' | translate }}</div>

          <!-- Booking nav (inactive) -->
          <img src="assets/icons/Group 23.png" style="width: 40px; height: 40px; left: 132px; top: 435px; position: absolute; object-fit: contain; z-index: 50; filter: brightness(0) invert(1);" alt="" />
          <div (click)="navigate('/bookings')" class="page-text clickable" style="width: 156px; height: 61px; left: 191px; top: 424px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #FEF4DF; font-size: 32px; font-weight: 500; z-index: 50;">{{ 'COMMON.BOOKING' | translate }}</div>

          <!-- Contract nav (inactive) -->
          <img src="assets/icons/Contract.png" style="width: 40px; height: 40px; left: 132px; top: 538px; position: absolute; object-fit: contain; z-index: 50; filter: brightness(0) invert(1);" alt="" />
          <div (click)="navigate('/contracts')" class="page-text clickable" style="width: 156px; height: 61px; left: 191px; top: 527px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #FEF4DF; font-size: 32px; font-weight: 500; z-index: 50;">{{ 'COMMON.CONTRACT' | translate }}</div>

          <!-- Contact info -->
          <div class="page-text" style="width: 400px; height: 209px; left: 0; top: 870px; position: absolute; text-align: center; z-index: 50;">
            <span style="color: white; font-size: 24px; font-style: italic; font-weight: 700;">{{ 'CONTACT_INFO.TITLE' | translate }}<br/><br/></span>
            <span style="color: white; font-size: 15px; font-style: italic; font-weight: 700;">{{ 'CONTACT_INFO.HEADQUARTERS' | translate }}: </span><span style="color: white; font-size: 15px;">{{ 'CONTACT_INFO.ADDRESS_1' | translate }}<br/>{{ 'CONTACT_INFO.ADDRESS_2' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-style: italic; font-weight: 700;">{{ 'CONTACT_INFO.PHONE_LABEL' | translate }}: </span><span style="color: white; font-size: 15px;">{{ 'CONTACT_INFO.PHONE' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-style: italic; font-weight: 700;">{{ 'CONTACT_INFO.EMAIL_LABEL' | translate }}: </span><span style="color: white; font-size: 15px;">{{ 'CONTACT_INFO.EMAIL' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-style: italic; font-weight: 700;">{{ 'CONTACT_INFO.HOURS_LABEL' | translate }}: </span><span style="color: white; font-size: 15px;">{{ 'CONTACT_INFO.HOURS' | translate }}</span>
          </div>

          <!-- Top navigation -->
          <div (click)="navigate('/about')" class="page-text clickable" style="width: 126px; height: 53px; left: 1071px; top: 110px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #264893; font-size: 32px; font-weight: 600; z-index: 50;">{{ 'COMMON.ABOUT_US' | translate }}</div>
          <div (click)="navigate('/guidelines')" class="page-text clickable" style="width: 152px; height: 53px; left: 1238px; top: 110px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #264893; font-size: 32px; font-weight: 600; z-index: 50;">{{ 'COMMON.GUIDELINES' | translate }}</div>
          <div (click)="navigate('/contact')" class="page-text clickable" style="width: 135px; height: 53px; left: 1431px; top: 110px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #264893; font-size: 32px; font-weight: 600; z-index: 50;">{{ 'COMMON.CONTACT' | translate }}</div>

          <!-- Language switcher -->
          <img (click)="toggleLangMenu()" class="clickable" style="width: 75px; height: 75px; left: 1620px; top: 95px; position: absolute; z-index: 50;" src="assets/icons/Globe.png" alt="" />
          @if (isLangMenuOpen) {
            <div style="position: absolute; left: 1550px; top: 180px; width: 192px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
              <div (click)="changeLang('en')" class="page-text clickable" style="padding: 8px 16px; font-style: italic; color: #264893; font-size: 24px;">{{ 'COMMON.ENGLISH' | translate }}</div>
              <div (click)="changeLang('vi')" class="page-text clickable" style="padding: 8px 16px; font-style: italic; color: #264893; font-size: 24px;">{{ 'COMMON.VIETNAMESE' | translate }}</div>
            </div>
          }

          <!-- User menu -->
          <img (click)="toggleUserMenu()" class="clickable" style="width: 70px; height: 70px; left: 1750px; top: 100px; position: absolute; z-index: 50;" src="assets/icons/Account.png" alt="" />
          @if (isUserMenuOpen) {
            <div style="position: absolute; left: 1680px; top: 180px; width: 150px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
              <div (click)="navigate('/profile')" class="page-text clickable" style="padding: 8px 16px; font-style: italic; color: #264893; font-size: 24px;">{{ 'COMMON.PROFILE' | translate }}</div>
              <div (click)="logout()" class="page-text clickable" style="padding: 8px 16px; font-style: italic; color: #ff4d4f; font-size: 24px;">{{ 'COMMON.LOGOUT' | translate }}</div>
            </div>
          }

          <!-- LEFT CARD (avatar + basic info) -->
          <div style="width: 268px; height: 700px; left: 430px; top: 283px; position: absolute; background: rgba(246, 246, 246, 0.84); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px; z-index: 10;">

            <!-- Avatar -->
            <img
              [src]="user?.avatar_url || 'assets/icons/Account.png'"
              style="width: 152px; height: 152px; left: 58px; top: -56px; position: absolute; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.18); z-index: 20;"
              alt="Avatar"
            />

            <!-- Resident ID -->
            <div class="page-text" style="width: 228px; left: 20px; top: 110px; position: absolute; text-align: center; color: #264893; font-size: 22px; font-weight: 700;">
              {{ 'PROFILE.RESIDENT_ID' | translate }}: {{ residentDisplayId }}
            </div>

            <!-- Full name -->
            <div class="page-text" style="left: 20px; top: 175px; position: absolute; color: #555; font-size: 16px; font-weight: 600;">{{ 'PROFILE.FULL_NAME' | translate }}</div>
            @if (isEditMode) {
              <input [(ngModel)]="editFullName" class="field" style="width: 228px; height: 44px; left: 20px; top: 200px; position: absolute;" />
            } @else {
              <div class="field-readonly" style="width: 228px; height: 44px; left: 20px; top: 200px; position: absolute;">{{ user?.full_name || '' }}</div>
            }

            <!-- Gender -->
            <div class="page-text" style="left: 20px; top: 272px; position: absolute; color: #555; font-size: 16px; font-weight: 600;">{{ 'PROFILE.GENDER' | translate }}</div>
            @if (isEditMode) {
              <select [(ngModel)]="editGender" class="field" style="width: 228px; height: 44px; left: 20px; top: 297px; position: absolute;">
                <option value="">{{ 'PROFILE.GENDER_SELECT' | translate }}</option>
                <option value="Male">{{ 'PROFILE.GENDER_MALE' | translate }}</option>
                <option value="Female">{{ 'PROFILE.GENDER_FEMALE' | translate }}</option>
              </select>
            } @else {
              <div class="field-readonly" style="width: 228px; height: 44px; left: 20px; top: 297px; position: absolute;">{{ user?.gender || '' }}</div>
            }

          </div>

          <!-- RIGHT CARD (personal + staying info) -->
          <div style="width: 1152px; height: 700px; left: 720px; top: 283px; position: absolute; background: rgba(246, 246, 246, 0.84); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px; z-index: 10;">

            <!-- Personal Information heading -->
            <div class="title-text" style="left: 80px; top: 52px; position: absolute; color: #264893; font-size: 36px; font-weight: 900;">{{ 'PROFILE.PERSONAL_INFO' | translate }}</div>

            <!-- Email label + field -->
            <div class="page-text" style="left: 80px; top: 108px; position: absolute; color: #555; font-size: 16px; font-weight: 600;">{{ 'PROFILE.EMAIL' | translate }}</div>
            <div class="field-readonly" style="width: 484px; height: 44px; left: 80px; top: 132px; position: absolute;">{{ user?.email || '' }}</div>

            <!-- Password label + field -->
            <div class="page-text" style="left: 600px; top: 108px; position: absolute; color: #555; font-size: 16px; font-weight: 600;">{{ 'PROFILE.PASSWORD' | translate }}</div>
            <div class="field-readonly" style="width: 484px; height: 44px; left: 600px; top: 132px; position: absolute; letter-spacing: 4px; color: #888;">••••••••</div>

            <!-- Phone label + field -->
            <div class="page-text" style="left: 80px; top: 204px; position: absolute; color: #555; font-size: 16px; font-weight: 600;">{{ 'PROFILE.PHONE' | translate }}</div>
            @if (isEditMode) {
              <input [(ngModel)]="editPhone" class="field" style="width: 484px; height: 44px; left: 80px; top: 228px; position: absolute;" />
            } @else {
              <div class="field-readonly" style="width: 484px; height: 44px; left: 80px; top: 228px; position: absolute;">{{ user?.phone_number || '' }}</div>
            }

            <!-- Divider -->
            <div style="width: 1040px; height: 1px; left: 56px; top: 302px; position: absolute; background: #d0d0d0;"></div>

            <!-- Staying Information heading -->
            <div class="title-text" style="left: 80px; top: 322px; position: absolute; color: #264893; font-size: 36px; font-weight: 900;">{{ 'PROFILE.STAYING_INFO' | translate }}</div>

            <!-- Branch label + field -->
            <div class="page-text" style="left: 80px; top: 378px; position: absolute; color: #555; font-size: 16px; font-weight: 600;">{{ 'PROFILE.BRANCH' | translate }} *</div>
            <div class="field-readonly" style="width: 312px; height: 44px; left: 80px; top: 402px; position: absolute;">{{ stayBranch }}</div>

            <!-- Room ID label + field -->
            <div class="page-text" style="left: 412px; top: 378px; position: absolute; color: #555; font-size: 16px; font-weight: 600;">{{ 'PROFILE.ROOM_ID' | translate }} *</div>
            <div class="field-readonly" style="width: 312px; height: 44px; left: 412px; top: 402px; position: absolute;">{{ stayRoomId }}</div>

            <!-- Contract Term label + field -->
            <div class="page-text" style="left: 744px; top: 378px; position: absolute; color: #555; font-size: 16px; font-weight: 600;">{{ 'PROFILE.CONTRACT_TERM' | translate }} *</div>
            <div class="field-readonly" style="width: 326px; height: 44px; left: 744px; top: 402px; position: absolute;">{{ stayContractTerm }}</div>

            <!-- Save error message -->
            @if (saveError) {
              <div class="page-text" style="position: absolute; left: 80px; top: 600px; color: #b91c1c; font-size: 16px; font-weight: 600;">{{ saveError }}</div>
            }

            <!-- Edit / Save button -->
            <button (click)="isEditMode ? onSaveClick() : enterEditMode()" class="primary-btn" style="position: absolute; left: 895px; top: 594px; min-width: 215px;">
              {{ isEditMode ? ('PROFILE.SAVE_CHANGES' | translate) : ('PROFILE.EDIT_PROFILE' | translate) }}
            </button>

          </div>

          <!-- Confirmation modal -->
          @if (showConfirmDialog) {
            <div class="modal-backdrop">
              <div class="modal" style="width: 620px; height: 390px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 60px; box-sizing: border-box;">
                <div class="title-text" style="color: #264893; font-size: 44px; font-weight: 900; text-align: center;">{{ 'PROFILE.CONFIRM_SAVE_TITLE' | translate }}</div>
                <div class="page-text" style="margin-top: 28px; color: #555; font-size: 22px; text-align: center; line-height: 1.5;">{{ 'PROFILE.CONFIRM_SAVE_MSG' | translate }}</div>
                <div style="display: flex; gap: 22px; margin-top: 54px;">
                  <button (click)="cancelSave()" class="secondary-btn" style="min-width: 160px; height: 60px; font-size: 22px;">{{ 'COMMON.CANCEL' | translate }}</button>
                  <button (click)="confirmSave()" [disabled]="isSaving" class="primary-btn" style="min-width: 160px; height: 60px; font-size: 22px;">{{ 'COMMON.CONFIRM' | translate }}</button>
                </div>
              </div>
            </div>
          }

        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);

  scaleFactor = 1;
  isLangMenuOpen = false;
  isUserMenuOpen = false;
  isEditMode = false;
  showConfirmDialog = false;
  isSaving = false;
  saveError = '';

  user: User | null = null;

  editFullName = '';
  editGender = '';
  editPhone = '';

  private originalFullName = '';
  private originalGender = '';
  private originalPhone = '';

  readonly stayBranch = '';
  readonly stayRoomId = '';
  readonly stayContractTerm = '';

  constructor() {
    this.translate.addLangs(['en', 'vi']);
    const browserLang = this.translate.getBrowserLang();
    const fallbackLang = browserLang?.match(/en|vi/) ? browserLang : 'vi';
    this.translate.setDefaultLang(fallbackLang);
    this.translate.use(fallbackLang);
    this.onResize();
    this.user = this.authService.getCurrentUser();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.scaleFactor = window.innerWidth / 1920;
  }

  get residentDisplayId(): string {
    if (!this.user?.id) return '001';
    const hash = parseInt(this.user.id.replace(/-/g, '').substring(0, 8), 16) % 1000;
    return String(hash).padStart(3, '0');
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen = !this.isLangMenuOpen;
    this.isUserMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isLangMenuOpen = false;
  }

  changeLang(lang: string): void {
    this.translate.use(lang);
    this.isLangMenuOpen = false;
  }

  logout(): void {
    try {
      const result = this.authService.logout() as { subscribe?: (cb: () => void) => void } | null | undefined;
      if (result?.subscribe) {
        result.subscribe(() => this.router.navigate(['/login']));
      } else {
        this.router.navigate(['/login']);
      }
    } catch {
      this.router.navigate(['/login']);
    }
    this.isUserMenuOpen = false;
  }

  enterEditMode(): void {
    this.editFullName = this.user?.full_name ?? '';
    this.editGender = this.user?.gender ?? '';
    this.editPhone = this.user?.phone_number ?? '';
    this.originalFullName = this.editFullName;
    this.originalGender = this.editGender;
    this.originalPhone = this.editPhone;
    this.saveError = '';
    this.isEditMode = true;
  }

  onSaveClick(): void {
    if (!this.editFullName.trim()) {
      this.saveError = 'Full name is required.';
      return;
    }
    this.saveError = '';
    this.showConfirmDialog = true;
  }

  cancelSave(): void {
    this.showConfirmDialog = false;
  }

  confirmSave(): void {
    // Close dialog immediately — don't wait for network
    this.showConfirmDialog = false;
    this.isSaving = true;
    this.saveError = '';

    const payload: { full_name?: string; gender?: string; phone_number?: string } = {
      full_name: this.editFullName.trim(),
    };
    if (this.editGender !== this.originalGender) {
      payload.gender = this.editGender || undefined;
    }
    if (this.editPhone !== this.originalPhone) {
      payload.phone_number = this.editPhone || undefined;
    }

    this.authService.updateCurrentUser(payload).pipe(
      timeout(15000)
    ).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          this.user = updatedUser;
          this.originalFullName = updatedUser.full_name ?? '';
          this.originalGender = updatedUser.gender ?? '';
          this.originalPhone = updatedUser.phone_number ?? '';
        }
        this.isEditMode = false;
        this.isSaving = false;
      },
      error: (err: unknown) => {
        this.isSaving = false;
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.authService.clearSession();
          this.router.navigate(['/login']);
          return;
        }
        this.saveError = 'Failed to save changes. Please try again.';
      }
    });
  }
}
