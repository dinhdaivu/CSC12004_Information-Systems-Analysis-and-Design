import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RentalRequestService } from '@core/services/rental-request.service';
import { RentalPayload } from '@shared/models/rental-request.model';
import { BranchService } from '@core/services/branch.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '@shared/components';
import { HostListener } from '@angular/core';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import type { User } from '@shared/models/auth.model';

@Component({
  selector: 'app-new-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, LanguageSwitcherComponent],
  template: `
    <div [style.height.px]="1080 * scaleFactor" style="width: 100%; overflow: hidden; position: relative; background: #FEF4DF;">
      <div [style.transform]="'scale(' + scaleFactor + ')'" style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 1080px;">
        <div style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden">
          <div style="width: 1920px; height: 644px; left: 0px; top: -5px; position: absolute; background: #503D2E"></div>
          
          <img style="width: 1133px; height: 638px; left: 552px; top: 0px; position: absolute" src="assets/pictures/Background.png" />
          
          <div style="width: 2000px; height: 622px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1920px; height: 698px; left: 0px; top: 393px; position: absolute; background: #FEF4DF"></div>
          
          <div (click)="navigate('/guidelines')" style="width: 152px; height: 53px; left: 1238px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.GUIDELINES' | translate }}</div>
          <div (click)="navigate('/about')" style="width: 126px; height: 53px; left: 1071px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.ABOUT_US' | translate }}</div>
          <div (click)="navigate('/contact')" style="width: 135px; height: 53px; left: 1431px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.CONTACT' | translate }}</div>
          
          <div style="position: absolute; left: 1620px; top: 95px; z-index: 50;">
            <app-language-switcher tone="dark" size="hero" />
          </div>
          
          <img (click)="toggleUserMenu()" style="width: 70px; height: 70px; left: 1750px; top: 100px; position: absolute; cursor: pointer; z-index: 50;" src="assets/icons/Account.png" />
          <div *ngIf="isUserMenuOpen" style="position: absolute; left: 1680px; top: 180px; width: 200px; height: 150px; z-index: 100;">
            <div style="width: 200px; height: 150px; left: 0px; top: 0px; position: absolute; background: #D9D9D9; border-radius: 25px"></div>

            <ng-container *ngIf="!isAuthenticated">
              <div (mousedown)="navigate('/register')" style="width: 180px; height: 46px; left: 10px; top: 19px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word; cursor: pointer; z-index: 101;">
                {{ 'AUTH.SIGN_UP' | translate }}
              </div>
              <div (mousedown)="navigate('/login')" style="width: 180px; height: 46px; left: 10px; top: 85px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word; cursor: pointer; z-index: 101;">
                {{ 'AUTH.LOG_IN' | translate }}
              </div>
            </ng-container>

            <ng-container *ngIf="isAuthenticated">
              <div (mousedown)="navigate('/profile')" style="width: 180px; height: 46px; left: 10px; top: 19px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word; cursor: pointer; z-index: 101;">
                {{ 'COMMON.PROFILE' | translate }}
              </div>
              <div (mousedown)="logout()" style="width: 180px; height: 46px; left: 10px; top: 85px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #ff4d4f; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word; cursor: pointer; z-index: 101;">
                {{ 'COMMON.LOGOUT' | translate }}
              </div>
            </ng-container>
          </div>
          
          <img style="width: 405px; height: 1080px; left: 0px; top: 0px; position: absolute;" src="assets/pictures/Union.png" />
          
          <img (click)="navigate('/')" style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; cursor: pointer;" src="assets/icons/BookingLogo.png" />
          
          <div (click)="navigate('/profile')" style="width: 126px; height: 62px; left: 191px; top: 331px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.PROFILE' | translate }}</div>
          <img style="width: 35px; height: 35px; left: 132px; top: 345px; position: absolute; pointer-events: none;" src="assets/icons/Group 22.png" />
          
          <div (click)="navigate('/bookings')" style="width: 146px; height: 61px; left: 191px; top: 424px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.BOOKING' | translate }}</div>
          <img style="width: 37px; height: 35px; left: 131px; top: 438px; position: absolute; pointer-events: none;" src="assets/icons/Group 23.png" />
          
          <div (click)="navigate('/contracts')" style="width: 126px; height: 62px; left: 188px; top: 527px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.CONTRACT' | translate }}</div>
          <img style="width: 40px; height: 40px; left: 132px; top: 538px; position: absolute; pointer-events: none;" src="assets/icons/Contracts.png" />
          
          <div style="width: 400px; height: 209px; left: 0px; top: 870px; position: absolute; text-align: center">
            <span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.TITLE' | translate }}<br/><br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.HEADQUARTERS' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.ADDRESS_1' | translate }}<br/>{{ 'CONTACT_INFO.ADDRESS_2' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.PHONE_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.PHONE' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.EMAIL_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.EMAIL' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.HOURS_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.HOURS' | translate }}</span>
          </div>
          
          <div style="width: 1317px; height: 730px; left: 500px; top: 250px; position: absolute; background: rgba(246.42, 246.42, 246.42, 0.70); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px"></div>
          
          <ng-container *ngIf="currentPage === 1 || currentPage === 2">
            <div style="width: 684px; height: 30px; left: 593px; top: 336px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">{{ 'BOOKING.TITLE' | translate }}</div>
            <div style="width: 730px; height: 30px; left: 593px; top: 393px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">{{ 'BOOKING.SUBTITLE' | translate }}</div>
          </ng-container>

          <ng-container *ngIf="currentPage === 3">
            <div style="width: 684px; height: 30px; left: 593px; top: 336px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">{{ 'BOOKING.VIEWING_TITLE' | translate }}</div>
            <div style="width: 889px; height: 30px; left: 593px; top: 393px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">{{ 'BOOKING.VIEWING_SUBTITLE' | translate }}</div>
          </ng-container>

          <form [formGroup]="bookingForm">
            <ng-container *ngIf="currentPage === 1">
              <div data-property-1="Default" style="width: 680px; height: 30px; left: 593px; top: 500px; position: absolute">
                <div style="width: 174px; height: 30px; left: 0px; top: 0px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'BOOKING.BRANCH_SELECTION' | translate }}</div>
                
                <div (click)="selectBranch('Tô Hiến Thành')" style="width: 116px; height: 30px; left: 225px; top: 0px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">Tô Hiến Thành</div>
                <div (click)="selectBranch('Tô Hiến Thành')" [style.background]="bookingForm.get('branch')?.value === 'Tô Hiến Thành' ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; left: 190px; top: 5px; position: absolute; border-radius: 9999px; cursor: pointer; transition: 0.3s;"></div>
                
                <div (click)="selectBranch('Trần Não')" style="width: 82px; height: 30px; left: 399px; top: 0px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">Trần Não</div>
                <div (click)="selectBranch('Trần Não')" [style.background]="bookingForm.get('branch')?.value === 'Trần Não' ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; left: 364px; top: 5px; position: absolute; border-radius: 9999px; cursor: pointer; transition: 0.3s;"></div>
                
                <div (click)="selectBranch('Nguyễn Cửu Vân')" style="width: 141px; height: 30px; left: 539px; top: 0px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">Nguyễn Cửu Vân</div>
                <div (click)="selectBranch('Nguyễn Cửu Vân')" [style.background]="bookingForm.get('branch')?.value === 'Nguyễn Cửu Vân' ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; left: 504px; top: 5px; position: absolute; border-radius: 9999px; cursor: pointer; transition: 0.3s;"></div>
              </div>
              
              <div data-property-1="Default" style="width: 680px; height: 30px; left: 593px; top: 572px; position: absolute">
                <div style="width: 174px; height: 30px; left: 0px; top: 0px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'BOOKING.ROOM_CATEGORY' | translate }}</div>
                
                <div (click)="selectRoom('Twin Room (2)')" style="width: 116px; height: 30px; left: 225px; top: 0px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">Twin Room (2)</div>
                <div (click)="selectRoom('Twin Room (2)')" [style.background]="bookingForm.get('room_category')?.value === 'Twin Room (2)' ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; left: 190px; top: 5px; position: absolute; border-radius: 9999px; cursor: pointer; transition: 0.3s;"></div>
                
                <div (click)="selectRoom('Quad Room (4)')" style="width: 141px; height: 30px; left: 399px; top: 0px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">Quad Room (4)</div>
                <div (click)="selectRoom('Quad Room (4)')" [style.background]="bookingForm.get('room_category')?.value === 'Quad Room (4)' ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; left: 364px; top: 5px; position: absolute; border-radius: 9999px; cursor: pointer; transition: 0.3s;"></div>
              </div>

              <div style="width: 212px; height: 30px; left: 888px; top: 644px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'BOOKING.MOVE_IN_DATE' | translate }}</div>
              <input type="date" formControlName="expected_move_in_date" style="width: 247px; height: 50px; left: 887px; top: 674px; position: absolute; background: #D9D9D9; border-radius: 10px; border: none; padding: 0 22px; color: black; font-size: 20px; font-family: Afacad; outline: none; z-index: 10;">
              
              <div style="width: 248px; height: 30px; left: 593px; top: 644px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'BOOKING.OCCUPANTS' | translate }}</div>
              <input type="number" formControlName="people_count" placeholder="2" style="width: 250px; height: 50px; left: 593px; top: 674px; position: absolute; background: #D9D9D9; border-radius: 10px; border: none; padding: 0 25px; color: black; font-size: 20px; font-family: Afacad; outline: none; z-index: 10;">
              
              <div style="width: 247px; height: 30px; left: 1178px; top: 644px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'BOOKING.DURATION' | translate }}</div>
              <input type="number" formControlName="rental_duration_months" placeholder="6" style="width: 250px; height: 50px; left: 1178px; top: 674px; position: absolute; background: #D9D9D9; border-radius: 10px; border: none; padding: 0 25px; color: black; font-size: 20px; font-family: Afacad; outline: none; z-index: 10;">
              
              <div style="width: 247px; height: 30px; left: 1474px; top: 644px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'BOOKING.RENTAL_TYPE' | translate }}</div>
              <input type="text" formControlName="note" [placeholder]="'BOOKING.SHARED_FULL' | translate" style="width: 250px; height: 50px; left: 1474px; top: 674px; position: absolute; background: #D9D9D9; border-radius: 10px; border: none; padding: 0 25px; color: black; font-size: 20px; font-family: Afacad; outline: none; z-index: 10;">
              
              <!-- UC1 §3.1.1: rental mode + preference criteria -->
              <div style="position: absolute; left: 593px; top: 750px; width: 1130px;">
                <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 40px; font-family: Afacad; font-size: 20px; color: black; font-weight: 500; align-items: center;">
                  
                  <!-- Rental Mode -->
                  <div style="display: flex; gap: 20px; align-items: center;">
                    <div (click)="bookingForm.patchValue({rental_mode: 'whole_room'})" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                      <div [style.background]="bookingForm.get('rental_mode')?.value === 'whole_room' ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; border-radius: 50%; transition: 0.3s;"></div>
                      <span>Whole Room</span>
                    </div>
                    <div (click)="bookingForm.patchValue({rental_mode: 'shared_bed'})" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                      <div [style.background]="bookingForm.get('rental_mode')?.value === 'shared_bed' ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; border-radius: 50%; transition: 0.3s;"></div>
                      <span>Shared Bed</span>
                    </div>
                  </div>

                  <!-- Preferred Gender Custom Segmented Control -->
                  <div style="display: flex; align-items: center; gap: 15px;">
                    <span>Preferred gender:</span>
                    <div style="display: flex; background: #D9D9D9; border-radius: 10px; overflow: hidden;">
                      <div (click)="bookingForm.patchValue({preferred_gender: ''})" 
                           [style.background]="bookingForm.get('preferred_gender')?.value === '' ? '#264893' : 'transparent'"
                           [style.color]="bookingForm.get('preferred_gender')?.value === '' ? 'white' : 'black'"
                           style="padding: 6px 16px; cursor: pointer; transition: 0.3s; font-weight: 600;">Any</div>
                      <div (click)="bookingForm.patchValue({preferred_gender: 'male'})" 
                           [style.background]="bookingForm.get('preferred_gender')?.value === 'male' ? '#264893' : 'transparent'"
                           [style.color]="bookingForm.get('preferred_gender')?.value === 'male' ? 'white' : 'black'"
                           style="padding: 6px 16px; cursor: pointer; transition: 0.3s; font-weight: 600;">Male</div>
                      <div (click)="bookingForm.patchValue({preferred_gender: 'female'})" 
                           [style.background]="bookingForm.get('preferred_gender')?.value === 'female' ? '#264893' : 'transparent'"
                           [style.color]="bookingForm.get('preferred_gender')?.value === 'female' ? 'white' : 'black'"
                           style="padding: 6px 16px; cursor: pointer; transition: 0.3s; font-weight: 600;">Female</div>
                    </div>
                  </div>

                  <!-- Checkboxes -->
                  <div style="display: flex; gap: 20px; align-items: center;">
                    <div (click)="bookingForm.patchValue({prefers_quiet: !bookingForm.get('prefers_quiet')?.value})" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                      <div [style.background]="bookingForm.get('prefers_quiet')?.value ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; border-radius: 6px; transition: 0.3s; display: flex; align-items: center; justify-content: center;">
                        <svg *ngIf="bookingForm.get('prefers_quiet')?.value" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span>Quiet</span>
                    </div>

                    <div (click)="bookingForm.patchValue({needs_parking: !bookingForm.get('needs_parking')?.value})" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                      <div [style.background]="bookingForm.get('needs_parking')?.value ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; border-radius: 6px; transition: 0.3s; display: flex; align-items: center; justify-content: center;">
                        <svg *ngIf="bookingForm.get('needs_parking')?.value" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span>Parking</span>
                    </div>

                    <div (click)="bookingForm.patchValue({needs_air_conditioner: !bookingForm.get('needs_air_conditioner')?.value})" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                      <div [style.background]="bookingForm.get('needs_air_conditioner')?.value ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; border-radius: 6px; transition: 0.3s; display: flex; align-items: center; justify-content: center;">
                        <svg *ngIf="bookingForm.get('needs_air_conditioner')?.value" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span>Air Con</span>
                    </div>
                  </div>

                </div>
              </div>

              <div (click)="currentPage = 2" style="width: 215px; height: 70px; left: 1470px; top: 824px; position: absolute; background: #264893; border-radius: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; z-index: 10;">{{ 'BOOKING.NEXT' | translate }}</div>
            </ng-container>

            <ng-container *ngIf="currentPage === 2">
              <input type="file" #fileInput (change)="onFileSelected($event)" style="display: none;" accept="image/*">
              
              <div style="width: 607px; height: 266px; left: 855px; top: 489px; position: absolute; border-radius: 30px; border: 3px rgba(38, 72, 147, 0.40) solid; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; overflow: hidden; background: rgba(255, 255, 255, 0.5);">
                
                <ng-container *ngIf="!selectedFilePreview && !isImageLoading">
                  <img src="assets/icons/Browse.png" alt="Browse" style="width: 90px; height: 90px;" />
                  <div (click)="fileInput.click()" style="padding: 10px 30px; background: #264893; border-radius: 10px; cursor: pointer; color: white; font-size: 20px; font-family: Afacad; font-weight: 500;">
                    {{ 'BOOKING.BROWSE' | translate }}
                  </div>
                  <div style="color: #264893; font-size: 16px; font-family: Afacad; font-weight: 500;">
                    {{ 'BOOKING.UPLOAD_ID' | translate }}
                  </div>
                </ng-container>

                <ng-container *ngIf="isImageLoading">
                  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px;">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#264893" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    <div style="color: #264893; font-size: 18px; font-family: Afacad; font-weight: 500;">Processing image...</div>
                    <style>
                      @keyframes spin { 100% { transform: rotate(360deg); } }
                    </style>
                  </div>
                </ng-container>

                <ng-container *ngIf="selectedFilePreview && !isImageLoading">
                  <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #e0e0e0;">
                    <img [src]="selectedFilePreview" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                    <div style="position: absolute; bottom: 15px; display: flex; gap: 10px; background: rgba(255, 255, 255, 0.9); padding: 5px 15px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); align-items: center;">
                      <span style="color: #264893; font-size: 14px; font-family: Afacad; font-weight: 500; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ selectedFileName }}</span>
                      <div (click)="fileInput.click()" style="cursor: pointer; background: #264893; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px; font-family: Afacad; font-weight: 600;">Change</div>
                    </div>
                  </div>
                </ng-container>

              </div>
              
              <button type="button" (click)="currentPage = 3" [disabled]="bookingForm.invalid || !selectedFile" style="all: unset; position: absolute; left: 1470px; top: 824px; cursor: pointer; z-index： 10;" [style.opacity]="(bookingForm.invalid || !selectedFile) ? '0.5' : '1'">
                <div style="width: 215px; height: 70px; background: #264893; border-radius: 40px"></div>
                <div style="width: 195px; height: 54px; left: 10px; top: 8px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; word-wrap: break-word">{{ 'BOOKING.SUBMIT' | translate }}</div>
              </button>
            </ng-container>

          <ng-container *ngIf="currentPage === 3">
            <button type="button" (click)="onSubmit()" [disabled]="isSubmitting" style="all: unset; position: absolute; left: 1462px; top: 800px; cursor: pointer; z-index: 10;" [style.opacity]="isSubmitting ? '0.5' : '1'">
              <div style="width: 285px; height: 70px; background: #264893; border-radius: 40px"></div>
              <div style="width: 231px; height: 44px; left: 27px; top: 13px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; word-wrap: break-word">{{ 'BOOKING.CONFIRM_ATTENDANCE' | translate }}</div>
            </button>

            <div style="width: 107px; height: 30px; left: 791px; top: 490px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'BOOKING.DATE' | translate }}</div>
            <input type="date" formControlName="viewing_date" style="width: 678px; height: 42px; left: 924px; top: 484px; position: absolute; background: #D9D9D9; border-radius: 10px; border: none; padding: 0 22px; color: black; font-size: 20px; font-family: Afacad; outline: none; z-index: 10;">

            <div style="width: 107px; height: 30px; left: 791px; top: 562px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'BOOKING.TIME' | translate }}</div>
            <input type="time" formControlName="viewing_time" style="width: 678px; height: 42px; left: 924px; top: 556px; position: absolute; background: #D9D9D9; border-radius: 10px; border: none; padding: 0 22px; color: black; font-size: 20px; font-family: Afacad; outline: none; z-index: 10;">

            <div style="width: 107px; height: 30px; left: 791px; top: 634px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'BOOKING.LOCATION' | translate }}</div>
            <div style="width: 678px; height: 42px; left: 924px; top: 628px; position: absolute; background: #D9D9D9; border-radius: 10px"></div>
            <div style="width: 300px; height: 30px; left: 960px; top: 634px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #747474; font-size: 20px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ bookingForm.get('branch')?.value }}</div>
            
            <div style="width: 133px; height: 30px; left: 791px; top: 703px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'BOOKING.ROOM_INTEREST' | translate }}</div>
            <div style="width: 678px; height: 42px; left: 924px; top: 697px; position: absolute; background: #D9D9D9; border-radius: 10px"></div>
            <div style="width: 381px; height: 30px; left: 960px; top: 703px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #747474; font-size: 20px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ bookingForm.get('room_category')?.value }}</div>

            <div *ngIf="isSubmitting" style="position: absolute; left: 855px; top: 810px; width: 600px; height: 50px;">
              <div style="width: 100%; height: 100%; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 600; word-wrap: break-word">{{ 'BOOKING.PROCESSING' | translate }}</div>
            </div>
            <div *ngIf="errorMessage" style="width: 600px; height: 50px; position: absolute; left: 855px; top: 810px; justify-content: center; display: flex; flex-direction: column; color: #991B1B; font-size: 24px; font-family: Afacad; font-weight: 600; word-wrap: break-word">{{ errorMessage }}</div>
          </ng-container>
          </form>

          <ng-container *ngIf="currentPage === 4">
            <div style="position: absolute; left: 500px; top: 250px; width: 1317px; height: 730px; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 20;">
              <div style="width: 120px; height: 120px; background: #2E7D32; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div style="color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; margin-bottom: 10px;">
                {{ 'BOOKING.SUCCESS' | translate }}
              </div>
              <div style="color: #595959; font-size: 24px; font-family: Afacad; font-weight: 500; margin-bottom: 40px; text-align: center; max-width: 600px;">
                Your rental request has been successfully submitted. Our team will review it and contact you shortly.
              </div>
              <button type="button" (click)="navigate('/bookings')" style="padding: 16px 48px; background: #264893; border-radius: 40px; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; cursor: pointer; border: none; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                {{ 'NAV.PUBLIC.BOOKINGS' | translate }} &rarr;
              </button>
            </div>
          </ng-container>

          <ng-container *ngIf="currentPage < 3">
            <div style="position: absolute; left: 1080px; top: 900px; width: 150px; height: 30px; display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 20px;">
              <span (click)="currentPage = 1" 
                    [style.color]="currentPage === 1 ? 'rgba(0, 0, 0, 0.30)' : 'black'"
                    [style.pointer-events]="currentPage === 1 ? 'none' : 'auto'"
                    style="cursor: pointer; font-size: 24px; font-family: Afacad; font-weight: 500;">&lt;</span>
              
              <span (click)="currentPage = 1" 
                    [style.color]="currentPage === 1 ? 'black' : 'rgba(0, 0, 0, 0.50)'" 
                    [style.fontWeight]="currentPage === 1 ? '700' : '400'"
                    style="cursor: pointer; font-size: 24px; font-family: Afacad;">1</span>
              
              <span (click)="currentPage = 2" 
                    [style.color]="currentPage === 2 ? 'black' : 'rgba(0, 0, 0, 0.50)'" 
                    [style.fontWeight]="currentPage === 2 ? '700' : '400'"
                    style="cursor: pointer; font-size: 24px; font-family: Afacad;">2</span>
                    
              <span (click)="currentPage = 2" 
                    [style.color]="currentPage === 2 ? 'rgba(0, 0, 0, 0.30)' : 'black'"
                    [style.pointer-events]="currentPage === 2 ? 'none' : 'auto'"
                    style="cursor: pointer; font-size: 24px; font-family: Afacad; font-weight: 500;">&gt;</span>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class NewBookingComponent implements OnInit {
  authService = inject(AuthService);
  bookingForm!: FormGroup;
  preSelectedRoomId: string | null = null;
  preSelectedBedId: string | null = null;
  currentPage = 1;
  isSubmitting = false;
  
  // Variables cho menu popup
  isUserMenuOpen = false;
  isAuthenticated = false;
  user: User | null = null;

  // Variables for Map API
  branchIdMap: { [key: string]: string } = {};

  // Variables for File Upload
  selectedFile: File | null = null;
  selectedFileName: string = '';
  selectedFilePreview: string | null = null;
  isImageLoading = false;
  
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private rentalRequestService: RentalRequestService,
    private branchService: BranchService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    // Cấu hình ngôn ngữ mặc định từ module Translate
    this.translate.addLangs(['en', 'vi']);
    this.translate.setDefaultLang('vi');
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|vi/) ? browserLang : 'vi');
  }

  scaleFactor = 1;
  @HostListener('window:resize')
  onResize() {
    this.scaleFactor = window.innerWidth / 1920;
  }
  
  ngOnInit(): void {
    this.onResize();
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.user = this.authService.getCurrentUser();
    }
    this.bookingForm = this.fb.group({
      branch: ['Tô Hiến Thành', Validators.required],
      room_category: ['Twin Room (2)', Validators.required],
      expected_move_in_date: ['', Validators.required],
      rental_duration_months: [6, [Validators.required, Validators.min(1)]],
      people_count: [2, [Validators.required, Validators.min(1)]],
      note: [''],
      // UC1 §3.1.1 explicit rental mode + matching criteria
      rental_mode: ['shared_bed' as 'whole_room' | 'shared_bed', Validators.required],
      preferred_gender: [''],
      prefers_quiet: [false],
      needs_parking: [false],
      needs_air_conditioner: [false],
      viewing_date: [this.getTomorrowDateString(), Validators.required],
      viewing_time: ['09:00', Validators.required]
    });

    // 1. NHẬN DỮ LIỆU TRUYỀN TỪ TRANG ROOMS (Nếu có)
    const stateData = window.history.state?.data;
    if (stateData) {
      this.bookingForm.patchValue({
        branch: stateData.branch_name,
        room_category: stateData.room_category
      });
      this.preSelectedRoomId = stateData.room_id;
      this.preSelectedBedId = stateData.bed_id;
    }

    // 2. NHẬN DỮ LIỆU TỪ QUERY PARAMS (Giữ nguyên logic cũ của bạn)[cite: 4]
    this.route.queryParams.subscribe(params => {
      if (params['roomId']) {
        this.preSelectedRoomId = params['roomId'];
      }
    });

    // 3. TẢI DANH SÁCH CHI NHÁNH (Giữ nguyên logic cũ của bạn)[cite: 4]
    this.branchService.getBranches().subscribe({
      next: (branches: { id: string; name: string }[]) => {
        branches.forEach(b => {
          if (b.name.includes('Tô Hiến Thành')) this.branchIdMap['Tô Hiến Thành'] = b.id;
          if (b.name.includes('Trần Não')) this.branchIdMap['Trần Não'] = b.id;
          if (b.name.includes('Nguyễn Cửu Vân')) this.branchIdMap['Nguyễn Cửu Vân'] = b.id;
        });
      },
      error: (err: unknown) => console.error('Failed to load branches', err)
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.isAuthenticated = false;
      this.isUserMenuOpen = false;
      this.router.navigate(['/login']);
    });
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  // Điều hướng Navbar/Sidebar
  navigate(path: string): void {
    this.router.navigate([path]);
  }

  // Tương tác giả lập Radio Button
  selectBranch(branch: string): void {
    this.bookingForm.patchValue({ branch: branch });
  }

  selectRoom(room: string): void {
    this.bookingForm.patchValue({ room_category: room });
  }

  // Tương tác File Upload
  async onFileSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file: File | undefined = target.files?.[0];
    if (file) {
      this.isImageLoading = true;
      this.selectedFilePreview = null;
      this.cdr.detectChanges();
      
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.selectedFilePreview = await this.toBase64(file);
      
      this.isImageLoading = false;
      this.cdr.detectChanges();
    }
  }

  private toBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  private getTomorrowDateString(): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  }

  // Gọi API khi người dùng nhấn "Confirm Attendance" trên Trang 3
  async onSubmit(): Promise<void> { // <-- Thêm chữ async
    if (this.bookingForm.invalid || !this.selectedFile) {
      this.currentPage = 1;
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValues = this.bookingForm.value;
    const selectedBranchName = formValues.branch;
    const mappedBranchId = this.branchIdMap[selectedBranchName];

    const formattedViewingTime = `${formValues.viewing_date} lúc ${formValues.viewing_time}`;
    const scheduledAt = new Date(`${formValues.viewing_date}T${formValues.viewing_time}`).toISOString();

    // GIỮ NGUYÊN 100% NHƯ BẠN YÊU CẦU
    const payload: RentalPayload & { scheduled_at?: string; bed_id?: string } = {
      expected_move_in_date: formValues.expected_move_in_date,
      rental_duration_months: Number(formValues.rental_duration_months),
      people_count: Number(formValues.people_count),
      preferred_room_type: formValues.room_category,
      note: `Hẹn xem phòng: ${formattedViewingTime} | Branch: ${formValues.branch} | Notes: ${formValues.note}`,
      full_name: this.user?.full_name,
      phone_number: this.user?.phone_number,
      gender: this.user?.gender,
      identity_number: this.user?.identity_number,
      // UC1 §3.1.1 fields
      rental_mode: formValues.rental_mode,
      preferred_gender: formValues.preferred_gender || undefined,
      prefers_quiet: !!formValues.prefers_quiet,
      needs_parking: !!formValues.needs_parking,
      needs_air_conditioner: !!formValues.needs_air_conditioner,
      schedule_note: formValues.note || undefined,
      scheduled_at: scheduledAt
    };

    if (mappedBranchId) {
       payload.branch_id = mappedBranchId;
    }

    if (this.preSelectedRoomId) {
      payload.room_id = this.preSelectedRoomId;
    }

    if (this.preSelectedBedId) {
      payload.bed_id = this.preSelectedBedId;
    }

    // NÂNG CẤP: Chuyển ảnh thành chuỗi ký tự Base64 và gắn vào JSON
    if (this.selectedFile) {
      payload.identity_card_base64 = await this.toBase64(this.selectedFile);
    }

    this.rentalRequestService.createRentalRequest(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.currentPage = 4;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        this.isSubmitting = false;
        const errObj = err as { error?: { message?: string } };
        this.errorMessage = '* ' + (errObj.error?.message || 'Error occurred. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }
}
