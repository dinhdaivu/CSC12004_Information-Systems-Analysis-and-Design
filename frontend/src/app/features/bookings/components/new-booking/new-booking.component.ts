import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RentalRequestService } from '@core/services/rental-request.service';
import { BranchService } from '@core/services/branch.service'; 
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-new-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden">
      <div style="width: 1920px; height: 644px; left: 0px; top: -5px; position: absolute; background: #503D2E"></div>
      
      <img style="width: 1133px; height: 638px; left: 552px; top: 0px; position: absolute" src="assets/pictures/Background.png" />
      
      <div style="width: 2000px; height: 619px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"></div>
      <div style="width: 1920px; height: 698px; left: 0px; top: 393px; position: absolute; background: #FEF4DF"></div>
      
      <div (click)="navigate('/guidelines')" style="width: 152px; height: 53px; left: 1238px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.GUIDELINES' | translate }}</div>
      <div (click)="navigate('/about-us')" style="width: 126px; height: 53px; left: 1071px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.ABOUT_US' | translate }}</div>
      <div (click)="navigate('/contact')" style="width: 135px; height: 53px; left: 1431px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.CONTACT' | translate }}</div>
      
      <img (click)="toggleLangMenu()" style="width: 75px; height: 75px; left: 1620px; top: 95px; position: absolute; cursor: pointer; z-index: 50;" src="assets/icons/Globe.png" />
      <div *ngIf="isLangMenuOpen" style="position: absolute; left: 1550px; top: 180px; width: 192px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
        <div (click)="changeLang('en')" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ 'COMMON.ENGLISH' | translate }}</div>
        <div (click)="changeLang('vi')" style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ 'COMMON.VIETNAMESE' | translate }}</div>
      </div>
      
      <img (click)="toggleUserMenu()" style="width: 70px; height: 70px; left: 1750px; top: 100px; position: absolute; cursor: pointer; z-index: 50;" src="assets/icons/Account.png" />
      <div *ngIf="isUserMenuOpen" style="position: absolute; left: 1680px; top: 180px; width: 150px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
        <div style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ 'AUTH.LOGIN.REGISTER' | translate }}</div>
        <div style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;">{{ 'AUTH.REGISTER.LOGIN_ACTION' | translate }}</div>
      </div>
      
      <img style="width: 405px; height: 1080px; left: 0px; top: 0px; position: absolute;" src="assets/pictures/Union.png" />
      
      <img (click)="navigate('/')" style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; cursor: pointer;" src="assets/icons/BookingLogo.png" />
      
      <div (click)="navigate('/profile')" style="width: 126px; height: 62px; left: 191px; top: 331px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.PROFILE' | translate }}</div>
      <img style="width: 35px; height: 35px; left: 132px; top: 345px; position: absolute; pointer-events: none;" src="assets/icons/Group 22.png" />
      
      <div (click)="navigate('/bookings')" style="width: 140px; height: 61px; left: 191px; top: 424px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.BOOKING' | translate }}</div>
      <img style="width: 37px; height: 35px; left: 131px; top: 438px; position: absolute; pointer-events: none;" src="assets/icons/Group 23.png" />
      
      <div (click)="navigate('/contracts')" style="width: 126px; height: 62px; left: 188px; top: 527px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">{{ 'COMMON.CONTRACT' | translate }}</div>
      <img style="width: 40px; height: 40px; left: 132px; top: 538px; position: absolute; pointer-events: none;" src="assets/icons/Frame.png" />
      
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
        <div style="width: 627px; height: 30px; left: 593px; top: 393px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">{{ 'BOOKING.SUBTITLE' | translate }}</div>
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
            
            <div (click)="selectRoom('Twin Room (2)')" style="width: 116px; height: 30px; left: 225px; top: 0px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">{{ 'BOOKING.ROOM_TWIN' | translate }}</div>
            <div (click)="selectRoom('Twin Room (2)')" [style.background]="bookingForm.get('room_category')?.value === 'Twin Room (2)' ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; left: 190px; top: 5px; position: absolute; border-radius: 9999px; cursor: pointer; transition: 0.3s;"></div>
            
            <div (click)="selectRoom('Quad Room (4)')" style="width: 141px; height: 30px; left: 399px; top: 0px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer;">{{ 'BOOKING.ROOM_QUAD' | translate }}</div>
            <div (click)="selectRoom('Quad Room (4)')" [style.background]="bookingForm.get('room_category')?.value === 'Quad Room (4)' ? '#264893' : '#D9D9D9'" style="width: 20px; height: 20px; left: 364px; top: 5px; position: absolute; border-radius: 9999px; cursor: pointer; transition: 0.3s;"></div>
          </div>

          <div style="width: 220px; height: 30px; left: 888px; top: 644px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'BOOKING.MOVE_IN_DATE' | translate }}</div>
          <input type="date" formControlName="expected_move_in_date" style="width: 247px; height: 50px; left: 887px; top: 674px; position: absolute; background: #D9D9D9; border-radius: 10px; border: none; padding: 0 22px; color: black; font-size: 20px; font-family: Afacad; outline: none; z-index: 10;">
          
          <div style="width: 248px; height: 30px; left: 593px; top: 644px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'BOOKING.OCCUPANTS' | translate }}</div>
          <input type="number" formControlName="people_count" placeholder="2" style="width: 250px; height: 50px; left: 593px; top: 674px; position: absolute; background: #D9D9D9; border-radius: 10px; border: none; padding: 0 25px; color: black; font-size: 20px; font-family: Afacad; outline: none; z-index: 10;">
          
          <div style="width: 247px; height: 30px; left: 1178px; top: 644px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'BOOKING.DURATION' | translate }}</div>
          <input type="number" formControlName="rental_duration_months" placeholder="6" style="width: 250px; height: 50px; left: 1178px; top: 674px; position: absolute; background: #D9D9D9; border-radius: 10px; border: none; padding: 0 25px; color: black; font-size: 20px; font-family: Afacad; outline: none; z-index: 10;">
          
          <div style="width: 247px; height: 30px; left: 1474px; top: 644px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ 'BOOKING.RENTAL_TYPE' | translate }}</div>
          <input type="text" formControlName="note" [placeholder]="'BOOKING.SHARED_FULL' | translate" style="width: 250px; height: 50px; left: 1474px; top: 674px; position: absolute; background: #D9D9D9; border-radius: 10px; border: none; padding: 0 25px; color: black; font-size: 20px; font-family: Afacad; outline: none; z-index: 10;">
          
          <div (click)="currentPage = 2" style="width: 215px; height: 70px; left: 1470px; top: 824px; position: absolute; background: #264893; border-radius: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; z-index: 10;">{{ 'BOOKING.NEXT' | translate }}</div>
        </ng-container>

        <ng-container *ngIf="currentPage === 2">
          <div style="width: 104px; height: 105px; left: 1107px; top: 523px; position: absolute; overflow: hidden">
            <div style="width: 78px; height: 78.75px; left: 13px; top: 13.13px; position: absolute; outline: 4px rgba(38, 72, 147, 0.40) solid; outline-offset: -2px"></div>
          </div>
          <div style="width: 607px; height: 266px; left: 855px; top: 489px; position: absolute; border-radius: 30px; border: 3px rgba(38, 72, 147, 0.40) solid"></div>
          
          <input type="file" #fileInput (change)="onFileSelected($event)" style="display: none;" accept="image/*">
          
          <div (click)="fileInput.click()" style="width: 158px; height: 38px; left: 1080px; top: 644px; position: absolute; background: #264893; border-radius: 10px; cursor: pointer;"></div>
          <div style="width: 158px; height: 38px; left: 1080px; top: 644px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word; pointer-events: none;">{{ 'BOOKING.BROWSE' | translate }}</div>
          
          <div style="width: 224px; height: 38px; left: 1047px; top: 682px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 16px; font-family: Afacad; font-weight: 500; word-wrap: break-word">{{ selectedFileName || ('BOOKING.UPLOAD_ID' | translate) }}</div>
          
          <button type="button" (click)="currentPage = 3" [disabled]="bookingForm.invalid || !selectedFile" style="all: unset; position: absolute; left: 1470px; top: 824px; cursor: pointer; z-index: 10;" [style.opacity]="(bookingForm.invalid || !selectedFile) ? '0.5' : '1'">
            <div style="width: 215px; height: 70px; background: #264893; border-radius: 40px"></div>
            <div style="width: 195px; height: 54px; left: 10px; top: 8px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; word-wrap: break-word">{{ 'BOOKING.SUBMIT' | translate }}</div>
          </button>
        </ng-container>
      </form>

      <ng-container *ngIf="currentPage === 3">
        <button type="button" (click)="onSubmit()" [disabled]="isSubmitting" style="all: unset; position: absolute; left: 1462px; top: 800px; cursor: pointer; z-index: 10;" [style.opacity]="isSubmitting ? '0.5' : '1'">
          <div style="width: 285px; height: 70px; background: #264893; border-radius: 40px"></div>
          <div style="width: 231px; height: 44px; left: 27px; top: 13px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; word-wrap: break-word">{{ 'BOOKING.CONFIRM_ATTENDANCE' | translate }}</div>
        </button>
        
        <div style="width: 107px; height: 30px; left: 791px; top: 490px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'BOOKING.DATE' | translate }}</div>
        <div style="width: 678px; height: 42px; left: 924px; top: 484px; position: absolute; background: #D9D9D9; border-radius: 10px"></div>
        <div style="width: 200px; height: 30px; left: 960px; top: 490px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #747474; font-size: 20px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ bookingForm.get('expected_move_in_date')?.value | date:'dd-MM-yyyy' }}</div>
        
        <div style="width: 107px; height: 30px; left: 791px; top: 562px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'BOOKING.TIME' | translate }}</div>
        <div style="width: 678px; height: 42px; left: 924px; top: 556px; position: absolute; background: #D9D9D9; border-radius: 10px"></div>
        <div style="width: 107px; height: 30px; left: 960px; top: 562px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #747474; font-size: 20px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ 'BOOKING.TIME_VALUE' | translate }}</div>
        
        <div style="width: 107px; height: 30px; left: 791px; top: 634px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'BOOKING.LOCATION' | translate }}</div>
        <div style="width: 678px; height: 42px; left: 924px; top: 628px; position: absolute; background: #D9D9D9; border-radius: 10px"></div>
        <div style="width: 300px; height: 30px; left: 960px; top: 634px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #747474; font-size: 20px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ bookingForm.get('branch')?.value }}</div>
        
        <div style="width: 133px; height: 30px; left: 791px; top: 703px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'BOOKING.ROOM_INTEREST' | translate }}</div>
        <div style="width: 678px; height: 42px; left: 924px; top: 697px; position: absolute; background: #D9D9D9; border-radius: 10px"></div>
        <div style="width: 381px; height: 30px; left: 960px; top: 703px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #747474; font-size: 20px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ bookingForm.get('room_category')?.value | translate }}</div>

        <div *ngIf="isSubmitting" style="position: absolute; left: 855px; top: 810px; width: 600px; height: 50px;">
          <div style="width: 100%; height: 100%; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 600; word-wrap: break-word">{{ 'BOOKING.PROCESSING' | translate }}</div>
        </div>
        <div *ngIf="errorMessage" style="width: 600px; height: 50px; position: absolute; left: 855px; top: 810px; justify-content: center; display: flex; flex-direction: column; color: #991B1B; font-size: 24px; font-family: Afacad; font-weight: 600; word-wrap: break-word">{{ errorMessage }}</div>
      </ng-container>

      <ng-container *ngIf="currentPage < 3">
        <div style="position: absolute; left: 1100px; top: 900px; width: 100px; height: 30px; text-align: center; justify-content: center; display: flex; flex-direction: row; gap: 10px;">
          <span (click)="currentPage = 1" 
                [style.color]="currentPage === 1 ? 'black' : 'rgba(0, 0, 0, 0.50)'" 
                [style.fontWeight]="currentPage === 1 ? '700' : '400'"
                style="cursor: pointer; font-size: 20px; font-family: Afacad; word-wrap: break-word">&lt;&nbsp;&nbsp;1&nbsp;&nbsp;</span>
          
          <span (click)="currentPage = 2" 
                [style.color]="currentPage === 2 ? 'black' : 'rgba(0, 0, 0, 0.50)'" 
                [style.fontWeight]="currentPage === 2 ? '700' : '400'"
                style="cursor: pointer; font-size: 20px; font-family: Afacad; word-wrap: break-word">2</span>
                
          <span style="color: rgba(0, 0, 0, 0.30); font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word">&nbsp;&nbsp;</span>
          <span (click)="currentPage = 2" style="cursor: pointer; color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word">&nbsp;&gt;</span>
        </div>
      </ng-container>

    </div>
  `
})
export class NewBookingComponent implements OnInit {
  bookingForm!: FormGroup;
  preSelectedRoomId: string | null = null;
  currentPage = 1;
  isSubmitting = false;
  
  // Variables cho menu popup
  isLangMenuOpen = false;
  isUserMenuOpen = false;
  
  // Variables for Map API
  branchIdMap: { [key: string]: string } = {};

  // Variables for File Upload
  selectedFile: File | null = null;
  selectedFileName: string = '';
  
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

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      branch: ['Tô Hiến Thành', Validators.required],
      room_category: ['Twin Room (2)', Validators.required],
      expected_move_in_date: ['', Validators.required],
      rental_duration_months: [6, [Validators.required, Validators.min(1)]],
      people_count: [2, [Validators.required, Validators.min(1)]],
      note: ['']
    });

    // Gọi API lấy Branch ID
    this.branchService.getBranches().subscribe({
      next: (branches: any[]) => {
        branches.forEach(b => {
          if (b.name.includes('Tô Hiến Thành')) this.branchIdMap['Tô Hiến Thành'] = b.id;
          if (b.name.includes('Trần Não')) this.branchIdMap['Trần Não'] = b.id;
          if (b.name.includes('Nguyễn Cửu Vân')) this.branchIdMap['Nguyễn Cửu Vân'] = b.id;
        });
      },
      error: (err) => console.error('Failed to load branches', err)
    });

    this.route.queryParams.subscribe(params => {
      if (params['roomId']) {
        this.preSelectedRoomId = params['roomId'];
      }
    });
  }

  // Hàm bật tắt menu ngôn ngữ và user
  toggleLangMenu() {
    this.isLangMenuOpen = !this.isLangMenuOpen;
    this.isUserMenuOpen = false;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isLangMenuOpen = false;
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    this.isLangMenuOpen = false;
    this.cdr.detectChanges();
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
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  // Gọi API khi người dùng nhấn "Confirm Attendance" trên Trang 3
  onSubmit(): void {
    if (this.bookingForm.invalid || !this.selectedFile) {
      this.currentPage = 1;
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Lấy dữ liệu Form
    const formValues = this.bookingForm.value;
    const selectedBranchName = formValues.branch;
    const mappedBranchId = this.branchIdMap[selectedBranchName];
    
    const payload: any = {
      expected_move_in_date: formValues.expected_move_in_date,
      rental_duration_months: Number(formValues.rental_duration_months),
      people_count: Number(formValues.people_count),
      preferred_room_type: formValues.room_category,
      note: `Branch: ${formValues.branch} | Notes: ${formValues.note}`
    };

    if (mappedBranchId) {
       payload.branch_id = mappedBranchId;
    }

    if (this.preSelectedRoomId) {
      payload.room_id = this.preSelectedRoomId;
    }

    this.rentalRequestService.createRentalRequest(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Attendance Confirmed! Thank you.');
        
        // Reset form và quay lại trang 1
        this.bookingForm.reset({ 
          branch: 'Tô Hiến Thành', 
          room_category: 'Twin Room (2)', 
          rental_duration_months: 6, 
          people_count: 2 
        });
        this.selectedFile = null;
        this.selectedFileName = '';
        this.currentPage = 1;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = '* ' + (err.error?.message || 'Error occurred. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }
}