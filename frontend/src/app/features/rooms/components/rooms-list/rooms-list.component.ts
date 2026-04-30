import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { inject } from '@angular/core';

// Nâng cấp: Import các Services thực tế từ Backend
import { AuthService } from '@core/services/auth.service';
import { RoomService } from '@core/services/room.service';
import { BranchService } from '@core/services/branch.service';
import { RentalRequestService } from '@core/services/rental-request.service';
import { ZoneService } from '@core/services/zone.service';

@Component({
  selector: 'app-rooms-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, FormsModule],
  template: `
    <div [style.height.px]="1080 * scaleFactor" style="width: 100%; overflow: hidden; position: relative; background: #FEF4DF;">
      <div [style.transform]="'scale(' + scaleFactor + ')'" style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 1080px;">
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
          <div *ngIf="isUserMenuOpen" style="position: absolute; left: 1680px; top: 180px; width: 200px; height: 150px; z-index: 100;">
            <div style="width: 200px; height: 150px; left: 0px; top: 0px; position: absolute; background: #D9D9D9; border-radius: 25px"></div>
            <ng-container *ngIf="!isAuthenticated">
              <div (mousedown)="navigate('/register')" style="width: 129px; height: 46px; left: 35px; top: 19px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 32px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word; cursor: pointer; z-index: 101;">
                {{ 'AUTH.REGISTER.TITLE' | translate }}
              </div>
              <div (mousedown)="navigate('/login')" style="width: 129px; height: 46px; left: 35px; top: 85px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 32px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word; cursor: pointer; z-index: 101;">
                {{ 'AUTH.LOGIN.TITLE' | translate }}
              </div>
            </ng-container>
            <ng-container *ngIf="isAuthenticated">
              <div (mousedown)="navigate('/profile')" style="width: 129px; height: 46px; left: 35px; top: 19px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 32px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word; cursor: pointer; z-index: 101;">
                {{ 'COMMON.PROFILE' | translate }}
              </div>
              <div (mousedown)="logout()" style="width: 129px; height: 46px; left: 35px; top: 85px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #ff4d4f; font-size: 32px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word; cursor: pointer; z-index: 101;">
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
          <img style="width: 40px; height: 40px; left: 132px; top: 538px; position: absolute; pointer-events: none;" src="assets/icons/Contract.png" />

          <div style="width: 400px; height: 209px; left: 0px; top: 870px; position: absolute; text-align: center">
            <span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.TITLE' | translate }}<br/><br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.HEADQUARTERS' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.ADDRESS_1' | translate }}<br/>{{ 'CONTACT_INFO.ADDRESS_2' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.PHONE_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.PHONE' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.EMAIL_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.EMAIL' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.HOURS_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.HOURS' | translate }}</span>
          </div>

          <ng-container *ngIf="step === 'room'">
            <div style="width: 1317px; height: 730px; left: 500px; top: 250px; position: absolute; background: rgba(246.42, 246.42, 246.42, 0.70); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px"></div>
            <div style="width: 701px; height: 30px; left: 576px; top: 336px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.TITLE' | translate }}</div>
            <div style="width: 643px; height: 30px; left: 576px; top: 393px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.SUBTITLE' | translate }}</div>

            <div (click)="goToBedStep()" style="cursor: pointer; width: 88px; height: 87px; left: 1636px; top: 341px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 24px; font-family: Afacad; font-weight: 400; line-height: 40px; word-wrap: break-word; z-index: 10;">{{ 'ROOM_BED_SEARCH.BUTTONS.NEXT' | translate }}</div>
            <div style="width: 88px; height: 87px; left: 1527px; top: 341px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 24px; font-family: Afacad; font-weight: 400; line-height: 40px; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.BUTTONS.BACK' | translate }}</div>

            <div style="width: 147px; height: 25.96px; left: 1402px; top: 469.50px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word; pointer-events: none; z-index: 10;">{{ (searchText ? '' : ('ROOM_BED_SEARCH.SEARCH_PLACEHOLDER' | translate)) }}</div>
            <input type="text" [(ngModel)]="searchText" (ngModelChange)="loadRooms()" style="width: 246px; height: 46px; left: 1332px; top: 460px; position: absolute; background: rgba(38, 72, 147, 0); border-radius: 50px; border: 2px black solid; padding-left: 50px; font-family: Afacad; font-size: 20px; outline: none; z-index: 5;">
            <div style="width: 25px; height: 25.96px; left: 1356px; top: 469.50px; position: absolute; z-index: 10;">
              <img src="assets/icons/Search.png" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;">
            </div>
            
            <div (click)="toggleFilter()" style="cursor: pointer; width: 52px; height: 25px; left: 1650px; top: 471px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word; z-index: 10;">{{ 'ROOM_BED_SEARCH.FILTER' | translate }}</div>
            <div (click)="toggleFilter()" style="cursor: pointer; width: 129px; height: 46px; left: 1593px; top: 460px; position: absolute; background: rgba(38, 72, 147, 0); border-radius: 50px; border: 2px black solid; z-index: 5;"></div>
            <div (click)="toggleFilter()" style="cursor: pointer; width: 28px; height: 28px; left: 1612px; top: 469px; position: absolute; overflow: hidden; z-index: 10;">
              <img src="assets/icons/Filter.png" style="width: 23.33px; height: 21px; left: 2.33px; top: 3.50px; position: absolute; pointer-events: none;">
            </div>

            <div *ngIf="isFilterOpen" style="position: absolute; left: 1593px; top: 510px; width: 250px; background: white; border: 2px solid black; border-radius: 15px; padding: 15px; z-index: 100; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="margin-bottom: 10px;">
                    <label style="font-family: Afacad; font-weight: 600; color: #264893;">{{ 'ROOM_BED_SEARCH.FILTERS.ROOM_TYPE' | translate }}</label>
                    <select [(ngModel)]="filterType" (ngModelChange)="loadRooms()" style="width: 100%; border: 1px solid #ccc; border-radius: 5px; padding: 5px; outline: none; font-family: Afacad;">
                        <option value="">{{ 'ROOM_BED_SEARCH.FILTERS.ALL' | translate }}</option>
                        <option value="twin">{{ 'ROOM_BED_SEARCH.FILTERS.TWIN' | translate }}</option>
                        <option value="quad">{{ 'ROOM_BED_SEARCH.FILTERS.QUAD' | translate }}</option>
                    </select>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-family: Afacad; font-weight: 600; color: #264893;">{{ 'ROOM_BED_SEARCH.FILTERS.STATUS' | translate }}</label>
                    <select [(ngModel)]="filterStatus" (ngModelChange)="loadRooms()" style="width: 100%; border: 1px solid #ccc; border-radius: 5px; padding: 5px; outline: none; font-family: Afacad;">
                        <option value="">{{ 'ROOM_BED_SEARCH.FILTERS.ALL' | translate }}</option>
                        <option value="available">{{ 'ROOM_BED_SEARCH.FILTERS.STATUS_AVAILABLE' | translate }}</option>
                        <option value="full">{{ 'ROOM_BED_SEARCH.FILTERS.STATUS_FULL' | translate }}</option>
                    </select>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-family: Afacad; font-weight: 600; color: #264893;">{{ 'ROOM_BED_SEARCH.FILTERS.CAPACITY' | translate }}</label>
                    <input type="number" [(ngModel)]="filterCapacity" (ngModelChange)="loadRooms()" [placeholder]="'ROOM_BED_SEARCH.FILTERS.CAPACITY_PLACEHOLDER' | translate" style="width: 100%; border: 1px solid #ccc; border-radius: 5px; padding: 5px; outline: none; font-family: Afacad;">
                </div>

                <div>
                    <label style="font-family: Afacad; font-weight: 600; color: #264893;">{{ 'ROOM_BED_SEARCH.FILTERS.MAX_PRICE' | translate }}</label>
                    <input type="number" [(ngModel)]="filterMaxPrice" (ngModelChange)="loadRooms()" [placeholder]="'ROOM_BED_SEARCH.FILTERS.PRICE_PLACEHOLDER' | translate" style="width: 100%; border: 1px solid #ccc; border-radius: 5px; padding: 5px; outline: none; font-family: Afacad;">
                </div>
            </div>

            <ng-container *ngFor="let room of getFilteredRoomsByZone(); let i = index">
                <div (click)="selectRoom(room)" [style.left.px]="576 + (i % 2 === 1 ? 389.74 : 0)" [style.top.px]="549 + (floor(i/2) * 105)" style="cursor: pointer; width: 366.26px; height: 90.09px; position: absolute; background: #F6F6F6; box-shadow: 2px 2px 10px 5px rgba(0, 0, 0, 0.10); border-radius: 25px; transition: transform 0.2s;" [style.border]="selectedRoomId === room.id ? '3px solid #264893' : 'none'">
                    <div style="width: 120.73px; height: 53.65px; left: 48.7px; top: 19.23px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 24px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ room.roomNumber }}</div>
                    <div style="width: 138px; height: 54px; left: 176px; top: 20.62px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 24px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ room.availableBeds }}/{{ room.totalBeds }} {{ 'ROOM_BED_SEARCH.STATUS.AVAILABLE_COUNT' | translate }}</div>
                    <div [style.background]="getStatusColor(room.status)" style="width: 14.33px; height: 14.33px; left: 27.33px; top: 38.38px; position: absolute; border-radius: 9999px"></div>
                    <div style="width: 59.67px; height: 0px; left: 154.72px; top: 75.38px; position: absolute; transform: rotate(-90deg); transform-origin: top left; outline: 2.50px black solid; outline-offset: -1.25px"></div>
                </div>
            </ng-container>

            <div data-property-1="Variant3" style="width: 194px; height: 236px; left: 576px; top: 454px; position: absolute; z-index: 50;">
              <div (click)="toggleBranchMenu()" style="cursor: pointer; width: 214px; height: 54px; left: 0px; top: 0px; position: absolute; background: #264893; border-radius: 10px"></div>
              <div (click)="toggleBranchMenu()" style="cursor: pointer; left: 58px; top: 14px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 20px; font-family: Afacad; font-weight: 600; word-wrap: break-word; pointer-events: none;">{{ filterBranchName }}</div>
              
              <div *ngIf="isBranchMenuOpen" [style.height.px]="branches.length * 38 + 27" style="width: 194px; left: 0px; top: 61px; position: absolute; background: rgba(255, 255, 255, 1); border-radius: 10px; box-shadow: 0px 4px 6px rgba(0,0,0,0.1);"></div>
              
              <ng-container *ngIf="isBranchMenuOpen">
                 <div *ngFor="let branch of branches; let i = index" (click)="selectBranchFilter(branch.id, branch.name)" [style.top.px]="81 + (i * 38)" style="cursor: pointer; left: 27px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 600; word-wrap: break-word">{{ branch.name }}</div>
              </ng-container>

              <div style="width: 24px; height: 24px; left: 27px; top: 15px; position: absolute; overflow: hidden; pointer-events: none; z-index: 55;">
                <img src="assets/icons/Filter.png" style="width: 20px; height: 18px; left: 2px; top: 3px; position: absolute; filter: brightness(0) invert(1);">
              </div>
            </div>

            <div style="width: 353px; height: 53px; left: 1401px; top: 619px; position: absolute; justify-content: center; display: flex; flex-direction: column"><span style="color: black; font-size: 24px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.STATUS.OCCUPIED' | translate }}<br/></span><span style="color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.STATUS.OCCUPIED_DESC' | translate }}</span></div>
            <div style="width: 20px; height: 20px; left: 1361px; top: 624px; position: absolute; background: #7199FE; border-radius: 9999px"></div>
            <div style="width: 328px; height: 83px; left: 1401px; top: 690px; position: absolute; justify-content: center; display: flex; flex-direction: column"><span style="color: black; font-size: 24px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.STATUS.RESERVED' | translate }}<br/></span><span style="color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.STATUS.RESERVED_DESC' | translate }}</span></div>
            <div style="width: 20px; height: 20px; left: 1361px; top: 695px; position: absolute; background: #FFA786; border-radius: 9999px"></div>
            <div style="width: 328px; height: 53px; left: 1401px; top: 791px; position: absolute; justify-content: center; display: flex; flex-direction: column"><span style="color: black; font-size: 24px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.STATUS.AVAILABLE' | translate }}<br/></span><span style="color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.STATUS.AVAILABLE_DESC' | translate }}</span></div>
            <div style="width: 20px; height: 20px; left: 1361px; top: 796px; position: absolute; background: #92DD9D; border-radius: 9999px"></div>

            <div style="width: 254px; height: 54px; left: 1421px; top: 551px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 28px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">{{ zones.length > 0 ? zones[currentZoneIndex]?.name : '' }}</div>
            
            <div style="width: 35px; height: 35px; left: 1660px; top: 550px; position: absolute; overflow: hidden">
              <img src="assets/icons/FloorNext.png" (click)="nextZone()" style="width: 25.83px; height: 31.67px; left: 16px; top: 11.67px; position: absolute; cursor: pointer; z-index: 10;">
            </div>
            
            <div style="width: 35px; height: 35px; left: 1370px; top: 550px; position: absolute; overflow: hidden">
              <img src="assets/icons/FloorBack.png" (click)="prevZone()" style="width: 25.83px; height: 31.67px; left: 16px; top: 11.67px; position: absolute; cursor: pointer; z-index: 10;">
            </div>
          </ng-container>

          <ng-container *ngIf="step === 'bed'">
            <div style="width: 1920px; height: 1080px; left: 0px; top: 0px; position: absolute; background: rgba(0, 0, 0, 0.50)"></div>

            <div style="width: 695px; height: 640px; left: 661px; top: 209px; position: absolute; background: #F6F6F6; box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px"></div>

            <div (click)="goToRoomStep()" style="cursor: pointer; width: 88px; height: 87px; left: 680px; top: 230px; position: absolute; display: flex; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 600;">
              {{ 'ROOM_BED_SEARCH.BUTTONS.BACK_VN' | translate }}
            </div>

            <div style="width: 350.26px; height: 30px; left: 754px; top: 290px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.ROOM.ROOM_LABEL' | translate }} {{ selectedRoom?.roomNumber || 'THT.204' }}</div>
            <div style="width: 509px; height: 30px; left: 754px; top: 347px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.ROOM.BRANCH_LABEL' | translate }} {{ filterBranchName }} | {{ 'ROOM_BED_SEARCH.ROOM.ZONE_LABEL' | translate }}: {{ zones.length > 0 ? zones[currentZoneIndex]?.name : '' }} | {{ 'ROOM_BED_SEARCH.ROOM.TYPE_LABEL' | translate }}: {{ selectedRoom?.roomType | titlecase }} {{ 'ROOM_BED_SEARCH.ROOM.ROOM_LABEL' | translate }}</div>

            <ng-container *ngFor="let bed of selectedRoom?.beds; let i = index">
               <div (click)="bed.status === 'available' ? selectBed(bed.id) : null" [style.top.px]="440 + i * 111" style="width: 463px; height: 94.99px; left: 803px; position: absolute; background: #F6F6F6; box-shadow: 2px 2px 10px 5px rgba(0, 0, 0, 0.10); border-radius: 25px; cursor: pointer;" [style.border]="selectedBedId === bed.id ? '3px solid #264893' : 'none'" [style.opacity]="bed.status === 'available' ? '1' : '0.7'"></div>
               
               <div [style.top.px]="460.93 + i * 111" style="width: 57.31px; height: 57px; left: 864.56px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 24px; font-family: Afacad; font-weight: 700; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.ROOM.BED' | translate:{ number: (bed.bedNumber || i+1) } }}</div>
               
               <div [style.top.px]="461 + i * 111" style="width: 216.75px; height: 56.99px; left: 1024.88px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word">{{ bed.status === 'available' ? ('ROOM_BED_SEARCH.ROOM.VACANT' | translate) : ('ROOM_BED_SEARCH.ROOM.OCCUPIED_BED' | translate) }}</div>
               
               <div [style.top.px]="479.76 + i * 111" [style.background]="getStatusColor(bed.status)" style="width: 16.55px; height: 16.55px; left: 838.33px; position: absolute; border-radius: 9999px"></div>
               
               <div [style.top.px]="519.49 + i * 111" style="width: 62.93px; height: 0px; left: 998.59px; position: absolute; transform: rotate(-90deg); transform-origin: top left; outline: 2.50px black solid; outline-offset: -1.25px"></div>
               
               <div [style.top.px]="477 + i * 111" [style.background]="bed.status === 'available' ? '#373737' : '#ADADAD'" style="width: 20px; height: 20px; left: 752px; position: absolute; border-radius: 9999px; border: 1px #ADADAD solid"></div>
               <div [style.top.px]="473 + i * 111" style="width: 28px; height: 28px; left: 748px; position: absolute; border-radius: 9999px; border: 2px #ADADAD solid"></div>
            </ng-container>

            <div (click)="goToDetail()" style="cursor: pointer; left: 754px; top: 380px; position: absolute; color: #264893; font-size: 20px; text-decoration: underline; font-family: Afacad;">{{ 'ROOM_BED_SEARCH.ROOM.VIEW_DETAIL' | translate }}</div>

            <div (click)="confirmAction()" style="cursor: pointer; width: 215px; height: 70px; left: 901px; top: 715px; position: absolute; background: #264893; border-radius: 40px"></div>
            <div (click)="confirmAction()" style="cursor: pointer; width: 195px; height: 54px; left: 911px; top: 723px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; word-wrap: break-word">{{ 'ROOM_BED_SEARCH.BUTTONS.CONFIRM' | translate }}</div>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class RoomsListComponent implements OnInit {
  authService = inject(AuthService);
  roomService = inject(RoomService);
  branchService = inject(BranchService);
  rentalRequestService = inject(RentalRequestService);
  zoneService = inject(ZoneService);

  step: 'room' | 'bed' = 'room';

  // Menu state
  isLangMenuOpen = false;
  isUserMenuOpen = false;
  isAuthenticated = false;
  
  // Interactive UI States
  isFilterOpen = false;
  isBranchMenuOpen = false;

  
  branches: any[] = [];
  rooms: any[] = [];

  // Search & Filter state
  searchText = '';
  filterType = '';
  filterCapacity: number | null = null;
  filterBranchId = '';
  filterBranchName = 'Tô Hiến Thành'; 
  filterStatus = '';
  filterMaxPrice: number | null = null;
  
  zones: any[] = []; // Thay đổi kiểu dữ liệu thành Object
  currentZoneIndex = 0; 

  // Selection state
  selectedRoomId: string | null = null;
  selectedRoom: any = null;
  selectedBedId: string | null = null;

  // Responsive scaling
  scaleFactor = 1;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.translate.addLangs(['en', 'vi']);
    this.translate.setDefaultLang('vi');
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|vi/) ? browserLang : 'vi');
  }

  @HostListener('window:resize')
  onResize() {
    this.scaleFactor = window.innerWidth / 1920;
  }

  ngOnInit(): void {
    this.onResize();
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadBranchesAndRooms();
  }

  loadBranchesAndRooms() {
    console.log("--- BẮT ĐẦU TẢI DỮ LIỆU TỪ BACKEND ---");
    
    this.branchService.getBranches().subscribe({
      next: (res: any) => {
        console.log("1. Kết quả API Branches:", res);
        
        // Trích xuất mảng dữ liệu (Hỗ trợ cả trường hợp bọc trong res.data)
        const branchData = res.data || res;
        this.branches = branchData || []; 

        if (this.branches.length > 0) {
          const defaultBranch = this.branches.find(b => b.name === 'Tô Hiến Thành') || this.branches[0];
          this.filterBranchId = defaultBranch.id;
          this.filterBranchName = defaultBranch.name;
          
          console.log("=> Đã chọn chi nhánh:", this.filterBranchName);
          // Gọi tiếp API lấy Zone
          this.loadZonesForBranch(this.filterBranchId);
        } else {
          console.warn("=> CẢNH BÁO: API Branches trả về mảng rỗng!");
        }
        
        // Ép Angular vẽ lại giao diện ngay lập tức
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("❌ LỖI GỌI API BRANCHES:", err);
      }
    });
  }

  loadZonesForBranch(branchId: string) {
    if (!branchId) return;
    
    this.zoneService.getZones(branchId).subscribe({
      next: (res: any) => {
        console.log("2. Kết quả API Zones:", res);
        const zoneData = res.data || res;
        
        // Map dữ liệu thành object {id, name}
        this.zones = (zoneData || []).map((z: any) => ({ id: z.id, name: z.name }));
        this.currentZoneIndex = 0;
        
        this.cdr.detectChanges(); // Ép Angular cập nhật
        
        // Sau khi có Zone mới gọi tiếp API lấy Phòng
        this.loadRooms();
      },
      error: (err) => {
        console.error("❌ LỖI GỌI API ZONES:", err);
      }
    });
  }

  loadRooms() {
    if (this.zones.length === 0) {
      console.warn("=> Không có Zone nào, tạm dừng gọi API Rooms.");
      this.rooms = [];
      this.cdr.detectChanges();
      return;
    }

    const currentZoneId = this.zones[this.currentZoneIndex].id;
    const params: any = { zone_id: currentZoneId };

    if (this.searchText) params.search = this.searchText;
    if (this.filterType) params.room_type = this.filterType;
    if (this.filterCapacity) params.capacity = this.filterCapacity;
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterMaxPrice) params.max_price = this.filterMaxPrice;

    this.roomService.getRooms(params).subscribe({
      next: (res: any) => {
        console.log("3. Kết quả API Rooms:", res);
        const roomData = res.data || res;

        this.rooms = (roomData || []).map((r: any) => ({
          id: r.id,
          roomNumber: r.roomNumber,
          availableBeds: r.beds?.filter((b: any) => b.status === 'available').length || 0,
          totalBeds: r.beds?.length || 0,
          status: r.status,
          roomType: r.roomType,
          capacity: r.maxCapacity,
          price: r.pricePerMonth,
          branchId: r.branch?.id || this.filterBranchId,
          zone: r.zone?.name || this.zones[this.currentZoneIndex]?.name, 
          beds: r.beds || [] 
        }));
        
        this.cdr.detectChanges(); // Ép Angular cập nhật danh sách phòng
      },
      error: (err) => {
        console.error("❌ LỖI GỌI API ROOMS:", err);
      }
    });
  }

  floor(val: number) { return Math.floor(val); }

  getFilteredRoomsByZone() {
    return this.rooms; // Rooms đã được lọc qua API theo zone_id
  }

  // Zone Switching Logic
  nextZone() {
    if (this.zones.length > 0) {
      this.currentZoneIndex = (this.currentZoneIndex + 1) % this.zones.length;
      this.resetSelection();
      this.loadRooms();
    }
  }

  prevZone() {
    if (this.zones.length > 0) {
      this.currentZoneIndex = (this.currentZoneIndex - 1 + this.zones.length) % this.zones.length;
      this.resetSelection();
      this.loadRooms();
    }
  }

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
    if(this.isBranchMenuOpen) this.isBranchMenuOpen = false;
  }

  toggleBranchMenu() {
    this.isBranchMenuOpen = !this.isBranchMenuOpen;
    if(this.isFilterOpen) this.isFilterOpen = false;
  }

  selectBranchFilter(branchId: string, branchName: string) {
    this.filterBranchId = branchId;
    this.filterBranchName = branchName;
    this.isBranchMenuOpen = false;
    this.resetSelection();
    this.loadZonesForBranch(branchId);
  }

  resetSelection() {
    this.selectedRoomId = null;
    this.selectedRoom = null;
    this.selectedBedId = null;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  selectRoom(room: any) {
    this.selectedRoomId = room.id;
    this.selectedRoom = room;
  }

  selectBed(bedId: string) {
    this.selectedBedId = bedId;
  }

  goToDetail() {
    if (this.selectedRoom && this.selectedRoom.branchId) {
    this.router.navigate(['/rooms', this.selectedRoom.branchId]);
  } else {
    alert('Vui lòng chọn một phòng để xem chi tiết.');
  }
  }

  goToBedStep(): void {
    if (this.selectedRoomId) {
      this.step = 'bed';
    } else {
      alert('Vui lòng chọn một phòng trước khi tiếp tục.');
    }
  }

  goToRoomStep(): void {
    this.step = 'room';
  }

  confirmAction(): void {
    if (!this.selectedBedId) {
      this.translate.get('ROOM_BED_SEARCH.MESSAGES.SELECT_BED').subscribe(msg => alert(msg));
      return;
    }
    if (!this.isAuthenticated) {
      this.translate.get('ROOM_BED_SEARCH.MESSAGES.LOGIN_REQUIRED').subscribe(msg => {
        alert(msg);
        this.router.navigate(['/login']);
      });
      return;
    }

    // Chuẩn bị dữ liệu theo đúng "ngôn ngữ" của trang NewBookingComponent
    const bookingData = {
      branch_name: this.filterBranchName,
      // Map giá trị backend sang giá trị của radio button ở trang NewBooking
      room_category: this.selectedRoom.roomType === 'twin' ? 'Twin Room (2)' : 'Quad Room (4)',
      room_id: this.selectedRoom.id,
      bed_id: this.selectedBedId
    };

    this.router.navigate(['/bookings/new'], { state: { data: bookingData } });
  }

  getStatusColor(status: string): string {
    const normalizedStatus = status ? status.toLowerCase() : '';
    
    if (normalizedStatus.includes('occupied') || normalizedStatus === 'full') {
      return '#7199FE'; 
    }
    if (normalizedStatus.includes('reserved')) {
      return '#FFA786'; 
    }
    
    return '#92DD9D'; 
  }

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

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.isAuthenticated = false;
      this.isUserMenuOpen = false;
      this.router.navigate(['/login']);
    });
  }
}