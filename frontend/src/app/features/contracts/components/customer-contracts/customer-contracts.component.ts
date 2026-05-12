import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as QRCode from 'qrcode';
import { AuthService } from '@core/services/auth.service';
import { CheckoutService, SettlementDTO } from '@core/services/checkout.service';
import { ContractsService, ContractListItem } from '@core/services/contracts.service';

type ContractScreen =
  | 'residency'
  | 'handover'
  | 'checkout-registration'
  | 'checkout-summary'
  | 'checkout-detail'
  | 'dispute'
  | 'payment-success'
  | 'payment-fail';

type PaymentMethod = 'vietqr' | 'momo' | 'visa';

interface AssetGroup {
  label: string;
  items: string[];
}

@Component({
  selector: 'app-customer-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  styles: [`
    :host { display: block; }
    .page-text { font-family: Afacad, Arial, sans-serif; letter-spacing: 0; }
    .title-text { font-family: 'Big Shoulders Text', Impact, sans-serif; letter-spacing: 0; }
    .clickable { cursor: pointer; user-select: none; }
    .field {
      background: #d9d9d9;
      border: 0;
      border-radius: 8px;
      color: #111;
      font-family: Afacad, Arial, sans-serif;
      font-size: 18px;
      outline: none;
      padding: 0 24px;
      box-sizing: border-box;
    }
    textarea.field {
      padding-top: 18px;
      resize: none;
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
      height: 70px;
      padding: 0 42px;
      min-width: 215px;
      box-sizing: border-box;
    }
    .primary-btn:disabled {
      background: #8a96b8;
      cursor: not-allowed;
    }
    .secondary-btn {
      background: transparent;
      border: 3px solid #264893;
      border-radius: 40px;
      color: #264893;
      cursor: pointer;
      font-family: Afacad, Arial, sans-serif;
      font-size: 24px;
      font-weight: 700;
      height: 70px;
      padding: 0 42px;
      min-width: 195px;
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
    .payment-card {
      width: 166px;
      height: 68px;
      background: #d9d9d9;
      border-radius: 8px;
      border: 3px solid transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-sizing: border-box;
    }
    .payment-card.active { border-color: #264893; }
    .payment-logo {
      max-width: 124px;
      max-height: 54px;
      object-fit: contain;
      display: block;
    }
    .payment-logo.square {
      max-width: 56px;
      max-height: 56px;
    }
    .radio-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #aaa;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 12px auto 0;
      box-sizing: border-box;
    }
    .radio-dot span {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #777;
      display: block;
    }
    .qr-svg-box svg { width: 100%; height: 100%; display: block; }
  `],
  template: `
    <div [style.height.px]="1080 * scaleFactor" style="width: 100%; overflow: hidden; position: relative; background: #FEF4DF;">
      <div [style.transform]="'scale(' + scaleFactor + ')'" style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 1080px;">
        <div style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden">
          <div style="width: 1920px; height: 644px; left: 0; top: -5px; position: absolute; background: #503D2E"></div>
          <img style="width: 1133px; height: 638px; left: 552px; top: 0; position: absolute; object-fit: cover" src="assets/pictures/Background.png" alt="" />
          <div style="width: 2000px; height: 622px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1920px; height: 698px; left: 0; top: 393px; position: absolute; background: #FEF4DF"></div>
          <div style="position: absolute; left: 0; top: 0; width: 405px; height: 1080px; background: #264893; pointer-events: none;"></div>

          <div (click)="navigate('/about')" class="page-text clickable" style="width: 126px; height: 53px; left: 1071px; top: 110px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #264893; font-size: 32px; font-weight: 600; z-index: 50;">{{ 'COMMON.ABOUT_US' | translate }}</div>
          <div (click)="navigate('/guidelines')" class="page-text clickable" style="width: 152px; height: 53px; left: 1238px; top: 110px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #264893; font-size: 32px; font-weight: 600; z-index: 50;">{{ 'COMMON.GUIDELINES' | translate }}</div>
          <div (click)="navigate('/contact')" class="page-text clickable" style="width: 135px; height: 53px; left: 1431px; top: 110px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #264893; font-size: 32px; font-weight: 600; z-index: 50;">{{ 'COMMON.CONTACT' | translate }}</div>

          <img (click)="toggleLangMenu()" class="clickable" style="width: 75px; height: 75px; left: 1620px; top: 95px; position: absolute; z-index: 50;" src="assets/icons/Globe.png" alt="" />
          <div *ngIf="isLangMenuOpen" style="position: absolute; left: 1550px; top: 180px; width: 192px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
            <div (click)="changeLang('en')" class="page-text clickable" style="padding: 8px 16px; font-style: italic; color: #264893; font-size: 24px;">{{ 'COMMON.ENGLISH' | translate }}</div>
            <div (click)="changeLang('vi')" class="page-text clickable" style="padding: 8px 16px; font-style: italic; color: #264893; font-size: 24px;">{{ 'COMMON.VIETNAMESE' | translate }}</div>
          </div>

          <img (click)="toggleUserMenu()" class="clickable" style="width: 70px; height: 70px; left: 1750px; top: 100px; position: absolute; z-index: 50;" src="assets/icons/Account.png" alt="" />
          <div *ngIf="isUserMenuOpen" style="position: absolute; left: 1680px; top: 180px; width: 150px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;">
            <div (click)="navigate('/profile')" class="page-text clickable" style="padding: 8px 16px; font-style: italic; color: #264893; font-size: 24px;">{{ 'COMMON.PROFILE' | translate }}</div>
            <div (click)="logout()" class="page-text clickable" style="padding: 8px 16px; font-style: italic; color: #ff4d4f; font-size: 24px;">{{ 'COMMON.LOGOUT' | translate }}</div>
          </div>

          <img (click)="navigate('/')" class="clickable" style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; object-fit: contain; z-index: 50;" src="assets/icons/FooterLogo.png" alt="HomeStay Dorm" />

          <div (click)="navigate('/profile')" class="page-text clickable" style="width: 126px; height: 62px; left: 191px; top: 331px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #FEF4DF; font-size: 32px; font-weight: 500; z-index: 50;">{{ 'COMMON.PROFILE' | translate }}</div>
          <img src="assets/icons/Group 22.png" style="width: 40px; height: 40px; left: 132px; top: 342px; position: absolute; object-fit: contain; z-index: 50;" alt="" />

          <div (click)="navigate('/bookings')" class="page-text clickable" style="width: 156px; height: 61px; left: 191px; top: 424px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #FEF4DF; font-size: 32px; font-weight: 500; z-index: 50;">{{ 'COMMON.BOOKING' | translate }}</div>
          <img src="assets/icons/Group 23.png" style="width: 40px; height: 40px; left: 132px; top: 435px; position: absolute; object-fit: contain; z-index: 50; filter: brightness(0) invert(1);" alt="" />

          <div style="width: 307px; height: 78px; left: 98px; top: 490px; position: absolute; background: #264893; border-bottom-right-radius: 31px; z-index: 43;"></div>
          <div style="width: 307px; height: 78px; left: 98px; top: 569px; position: absolute; background: #264893; border-top-right-radius: 31px; z-index: 43;"></div>
          <div (click)="goResidency()" class="clickable" style="width: 335px; height: 62px; left: 98px; top: 520px; position: absolute; background: #FEF4DF; border-radius: 31px 0 0 31px; z-index: 45;"></div>
          <img src="assets/icons/Contract.png" style="width: 40px; height: 40px; left: 132px; top: 531px; position: absolute; object-fit: contain; z-index: 50; filter: brightness(0) saturate(100%) invert(24%) sepia(34%) saturate(1800%) hue-rotate(199deg) brightness(92%) contrast(93%);" alt="" />
          <div (click)="goResidency()" class="page-text clickable" style="width: 156px; height: 61px; left: 191px; top: 520px; position: absolute; display: flex; flex-direction: column; justify-content: center; color: #264893; font-size: 32px; font-weight: 600; z-index: 50;">{{ 'COMMON.CONTRACT' | translate }}</div>

          <div class="page-text" style="width: 400px; height: 209px; left: 0; top: 870px; position: absolute; text-align: center; z-index: 50;">
            <span style="color: white; font-size: 24px; font-style: italic; font-weight: 700;">{{ 'CONTACT_INFO.TITLE' | translate }}<br/><br/></span>
            <span style="color: white; font-size: 15px; font-style: italic; font-weight: 700;">{{ 'CONTACT_INFO.HEADQUARTERS' | translate }}: </span><span style="color: white; font-size: 15px;">{{ 'CONTACT_INFO.ADDRESS_1' | translate }}<br/>{{ 'CONTACT_INFO.ADDRESS_2' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-style: italic; font-weight: 700;">{{ 'CONTACT_INFO.PHONE_LABEL' | translate }}: </span><span style="color: white; font-size: 15px;">{{ 'CONTACT_INFO.PHONE' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-style: italic; font-weight: 700;">{{ 'CONTACT_INFO.EMAIL_LABEL' | translate }}: </span><span style="color: white; font-size: 15px;">{{ 'CONTACT_INFO.EMAIL' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-style: italic; font-weight: 700;">{{ 'CONTACT_INFO.HOURS_LABEL' | translate }}: </span><span style="color: white; font-size: 15px;">{{ 'CONTACT_INFO.HOURS' | translate }}</span>
          </div>

          <div (click)="goResidency()" class="title-text clickable" [style.text-decoration]="isResidencyScreen ? 'underline' : 'none'" style="width: 291px; height: 58px; left: 500px; top: 220px; position: absolute; background: rgba(246, 246, 246, 0.78); border-radius: 22px; display: flex; align-items: center; justify-content: center; color: #264893; font-size: 34px; font-weight: 900; z-index: 20;">Residency</div>
          <div (click)="goCheckout()" class="title-text clickable" [style.text-decoration]="isCheckoutScreen ? 'underline' : 'none'" style="width: 291px; height: 58px; left: 828px; top: 220px; position: absolute; background: rgba(246, 246, 246, 0.78); border-radius: 22px; display: flex; align-items: center; justify-content: center; color: #264893; font-size: 34px; font-weight: 900; z-index: 20;">Checkout</div>

          <div style="width: 1317px; height: 687px; left: 500px; top: 293px; position: absolute; background: rgba(246, 246, 246, 0.84); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px; z-index: 10;">
            <ng-container [ngSwitch]="screen">
              <ng-container *ngSwitchCase="'residency'">
                <div class="title-text" style="left: 79px; top: 60px; position: absolute; color: #264893; font-size: 52px; font-weight: 900;">My Residency & Contract</div>
                <div class="title-text" style="left: 80px; top: 132px; position: absolute; color: #264893; font-size: 25px; font-weight: 600;">Review your active rental agreement, room assignments, and official stay duration at HomeStay Dorm.</div>

                <div class="title-text" style="left: 262px; top: 237px; position: absolute; color: #264893; font-size: 30px; font-weight: 900;">Stay Information</div>
                <div class="page-text" style="left: 564px; top: 205px; position: absolute; color: #111; font-size: 21px; line-height: 32px;">
                  <strong>Current Branch:</strong><br/>
                  <strong>Room & Bed ID:</strong><br/>
                  <strong>Move-in Date:</strong>
                </div>
                <div class="page-text" style="left: 846px; top: 205px; position: absolute; color: #111; font-size: 21px; line-height: 32px;">
                  {{ residency.branch }}.<br/>{{ residency.roomBed }}.<br/>{{ residency.moveInDate }}.
                </div>

                <div class="title-text" style="left: 262px; top: 378px; position: absolute; color: #264893; font-size: 30px; font-weight: 900;">Financial Summary</div>
                <div class="page-text" style="left: 564px; top: 366px; position: absolute; color: #111; font-size: 21px; line-height: 32px;">
                  <strong>Monthly Rent:</strong><br/>
                  <strong>Security Deposit Held:</strong>
                </div>
                <div class="page-text" style="left: 846px; top: 366px; position: absolute; color: #111; font-size: 21px; line-height: 32px;">
                  {{ formatCurrency(residency.monthlyRent) }}<br/>{{ formatCurrency(residency.deposit) }}
                </div>

                <div class="title-text" style="left: 262px; top: 500px; position: absolute; color: #264893; font-size: 30px; font-weight: 900;">Contract Details</div>
                <div class="page-text" style="left: 564px; top: 487px; position: absolute; color: #111; font-size: 21px; line-height: 32px;">
                  <strong>Contract Status:</strong><br/>
                  <strong>Contract Term:</strong>
                </div>
                <div class="page-text" style="left: 846px; top: 487px; position: absolute; color: #111; font-size: 21px; line-height: 32px;">
                  {{ residency.status }}<br/>{{ residency.term }}
                </div>

                <button (click)="goHandover()" class="secondary-btn" style="position: absolute; left: 795px; top: 582px; width: 250px; padding: 0;">View E-Contract</button>
                <button (click)="goCheckout()" class="primary-btn" style="position: absolute; left: 1064px; top: 582px; width: 215px; padding: 0;">Checkout</button>
              </ng-container>

              <ng-container *ngSwitchCase="'handover'">
                <div class="title-text" style="left: 77px; top: 60px; position: absolute; color: #264893; font-size: 52px; font-weight: 900;">My Contract</div>
                <div class="title-text" style="left: 77px; top: 171px; position: absolute; color: #264893; font-size: 31px; font-weight: 900;">Assets Retrieved</div>

                <div *ngFor="let group of assetGroups; let groupIndex = index" class="page-text" [style.left.px]="110 + groupIndex * 360" style="top: 230px; position: absolute; color: #111; font-size: 18px; line-height: 35px;">
                  <div *ngFor="let asset of group.items" style="display: grid; grid-template-columns: 155px 32px 1fr; align-items: center; width: 340px;">
                    <strong *ngIf="asset === group.items[0]">{{ group.label }}</strong>
                    <span *ngIf="asset !== group.items[0]"></span>
                    <span style="color: #0b9b4b; font-size: 24px;">&#10003;</span>
                    <span>{{ asset }}</span>
                  </div>
                </div>

                <div (click)="showImageModal = true" class="clickable" style="width: 1164px; height: 112px; left: 77px; top: 383px; position: absolute; border: 3px dashed #9eb1d6; display: flex; align-items: center; justify-content: center;">
                  <span class="page-text" style="font-size: 18px; font-weight: 700; color: #111;">Room204_BedA.png</span>
                </div>

                <label class="page-text clickable" style="left: 110px; top: 552px; position: absolute; display: flex; align-items: flex-start; gap: 16px; color: #111;">
                  <input type="checkbox" [(ngModel)]="signatureAcknowledged" style="width: 20px; height: 20px; margin-top: 3px; accent-color: #264893;" />
                  <span style="font-size: 18px;"><strong>Resident Signature</strong><br/><span style="color: #777;">I acknowledge receipt of room in stated condition</span></span>
                </label>

                <button (click)="openSignatureConfirm()" [disabled]="!signatureAcknowledged" class="primary-btn" style="position: absolute; left: 1025px; top: 553px;">Confirm</button>
              </ng-container>

              <ng-container *ngSwitchCase="'checkout-registration'">
                <div class="title-text" style="left: 79px; top: 50px; position: absolute; color: #264893; font-size: 52px; font-weight: 900;">Checkout Registation</div>
                <div class="title-text" style="left: 80px; top: 120px; position: absolute; color: #264893; font-size: 25px; font-weight: 600;">Schedule your departure date and initiate the asset inspection process to begin your deposit refund .</div>

                <label class="page-text" style="left: 220px; top: 211px; position: absolute; color: #111; font-size: 18px; font-weight: 700;">Proposed Checkout Date</label>
                <input [(ngModel)]="checkoutDate" type="date" class="field" style="width: 638px; height: 42px; left: 460px; top: 202px; position: absolute;" />

                <label class="page-text" style="left: 220px; top: 282px; position: absolute; color: #111; font-size: 18px; font-weight: 700;">Reason for Moving Out</label>
                <textarea [(ngModel)]="checkoutReason" class="field" style="width: 638px; height: 100px; left: 460px; top: 272px; position: absolute;"></textarea>

                <div class="page-text" style="left: 220px; top: 403px; position: absolute; color: #111; font-size: 18px; line-height: 28px;">
                  <strong>Terms & Conditions for Checkout:</strong>
                  <ul style="margin-top: 12px;">
                    <li>Residents must return all keys/cards and ensure the room is in its original condition.</li>
                    <li>Final utility bills and any asset damages will be deducted from the security deposit.</li>
                  </ul>
                </div>
                <div *ngIf="checkoutError" class="page-text" style="left: 460px; top: 386px; position: absolute; color: #b91c1c; font-size: 16px; font-weight: 700;">{{ checkoutError }}</div>
                <button (click)="submitCheckoutRequest()" [disabled]="isSubmitting" class="primary-btn" style="position: absolute; left: 984px; top: 543px; min-width: 238px;">{{ isSubmitting ? 'Submitting…' : 'Submit Request' }}</button>
              </ng-container>

              <ng-container *ngSwitchCase="'checkout-summary'">
                <div class="title-text" style="left: 79px; top: 50px; position: absolute; color: #264893; font-size: 52px; font-weight: 900;">Checkout Confirmation</div>
                <div class="title-text" style="left: 80px; top: 120px; position: absolute; color: #264893; font-size: 25px; font-weight: 600;">Carefully review the transparent breakdown of your deposit refund.</div>
                <div (click)="goCheckout()" class="page-text clickable" style="left: 1123px; top: 91px; position: absolute; color: #111; font-size: 21px;">&lt;&nbsp;&nbsp;&nbsp; Back</div>

                <div (click)="screen = 'checkout-detail'" class="clickable" style="width: 1180px; height: 150px; left: 78px; top: 170px; position: absolute; border-radius: 10px; border: 2px solid #d9d9d9;">
                  <div class="page-text" style="left: 42px; top: 45px; position: absolute; color: #111; font-size: 26px; font-weight: 800;">{{ residency.customerName }}</div>
                  <div class="page-text" style="left: 42px; top: 88px; position: absolute; color: #777; font-size: 18px;">{{ residency.roomShort }} - Tra phong: {{ formattedCheckoutDate }}</div>
                  <div class="page-text" style="right: 42px; top: 45px; position: absolute; color: #777; font-size: 22px;">Final Balance</div>
                  <div class="page-text" style="right: 42px; top: 88px; position: absolute; color: #0087b8; font-size: 22px;">{{ formatCurrency(finalBalance) }}</div>
                </div>

                <div class="page-text" style="left: 120px; top: 410px; position: absolute; color: #111; font-size: 26px; font-weight: 800;">Payment Method</div>
                <div style="position: absolute; left: 695px; top: 395px; display: flex; gap: 32px;">
                  <div>
                    <div (click)="selectedPayment = 'vietqr'" class="payment-card" [class.active]="selectedPayment === 'vietqr'"><img class="payment-logo" src="assets/icons/Icon-VNPAY-QR 1.svg" alt="VNPAY" /></div>
                    <div class="radio-dot"><span *ngIf="selectedPayment === 'vietqr'"></span></div>
                  </div>
                  <div>
                    <div (click)="selectedPayment = 'momo'" class="payment-card" [class.active]="selectedPayment === 'momo'"><img class="payment-logo square" src="assets/icons/MoMo_Logo_App.svg 1.svg" alt="MoMo" /></div>
                    <div class="radio-dot"><span *ngIf="selectedPayment === 'momo'"></span></div>
                  </div>
                  <div>
                    <div (click)="selectedPayment = 'visa'" class="payment-card" [class.active]="selectedPayment === 'visa'"><img class="payment-logo" src="assets/icons/Visa-Logo 1.svg" alt="Visa" /></div>
                    <div class="radio-dot"><span *ngIf="selectedPayment === 'visa'"></span></div>
                  </div>
                </div>
                <button (click)="screen = 'dispute'" class="secondary-btn" style="position: absolute; left: 847px; top: 543px;">Dispute</button>
                <button (click)="confirmRefundPayment()" class="primary-btn" style="position: absolute; left: 1064px; top: 543px;">Confirm</button>
              </ng-container>

              <ng-container *ngSwitchCase="'checkout-detail'">
                <div class="title-text" style="left: 79px; top: 50px; position: absolute; color: #264893; font-size: 52px; font-weight: 900;">Checkout Confirmation</div>
                <div class="title-text" style="left: 80px; top: 120px; position: absolute; color: #264893; font-size: 25px; font-weight: 600;">Carefully review the transparent breakdown of your deposit refund.</div>
                <div (click)="screen = 'checkout-summary'" class="page-text clickable" style="left: 1123px; top: 91px; position: absolute; color: #111; font-size: 21px;">&lt;&nbsp;&nbsp;&nbsp; Back</div>

                <div style="width: 1163px; height: 404px; left: 78px; top: 187px; position: absolute; border-radius: 10px; border: 2px solid #d9d9d9;">
                  <div class="page-text" style="left: 42px; top: 44px; position: absolute; color: #111; font-size: 26px; font-weight: 800;">{{ residency.customerName }}</div>
                  <div class="page-text" style="left: 42px; top: 84px; position: absolute; color: #777; font-size: 18px;">{{ residency.roomShort }} - Tra phong: {{ formattedCheckoutDate }}</div>

                  <div class="page-text" style="left: 42px; top: 162px; position: absolute; color: #777; font-size: 18px; line-height: 44px;">
                    Refund Rate<br/>Deposit<br/>Refundable Deposit<br/>Damage/Maintenance Fee
                  </div>
                  <div class="page-text" style="left: 230px; top: 162px; position: absolute; color: #111; font-size: 18px; line-height: 44px;">
                    {{ refundRate }}%<br/>{{ formatCurrency(residency.deposit) }}<br/>{{ formatCurrency(refundableDeposit) }}
                  </div>
                  <input [(ngModel)]="damageFee" type="number" class="field" style="width: 498px; height: 50px; left: 40px; top: 340px; position: absolute; border: 1px solid #aaa; background: #eee;" />

                  <div class="page-text" style="right: 42px; top: 48px; position: absolute; color: #777; font-size: 22px;">Final Balance</div>
                  <div class="page-text" style="right: 42px; top: 87px; position: absolute; color: #0087b8; font-size: 22px;">{{ formatCurrency(finalBalance) }}</div>

                  <div style="width: 538px; height: 257px; right: 40px; top: 130px; position: absolute; background: #d9d9d9; border-radius: 8px;">
                    <div class="page-text" style="left: 36px; top: 30px; position: absolute; color: #777; font-size: 18px; line-height: 34px;">Refundable deposit<br/>Outstanding rent<br/>Damage fee</div>
                    <div class="page-text" style="right: 34px; top: 30px; position: absolute; text-align: right; color: #111; font-size: 18px; line-height: 34px;">{{ formatCurrency(refundableDeposit) }}<br/><span style="color: red;">-{{ formatCurrency(outstandingRent) }}</span><br/><span style="color: red;">-{{ formatCurrency(damageFeeNumber) }}</span></div>
                    <div style="width: 466px; height: 1px; left: 36px; top: 135px; position: absolute; background: #8a8a8a;"></div>
                    <div class="page-text" style="left: 36px; top: 153px; position: absolute; color: #111; font-size: 18px;">Total deductions</div>
                    <div class="page-text" style="right: 34px; top: 153px; position: absolute; color: red; font-size: 18px;">-{{ formatCurrency(totalDeductions) }}</div>
                    <div style="width: 466px; height: 1px; left: 36px; top: 193px; position: absolute; background: #8a8a8a;"></div>
                    <div class="page-text" style="left: 36px; top: 215px; position: absolute; color: #111; font-size: 18px;">Final Balance</div>
                    <div class="page-text" style="right: 34px; top: 215px; position: absolute; color: #0087b8; font-size: 18px;">{{ formatCurrency(finalBalance) }}</div>
                  </div>
                </div>
                <button (click)="screen = 'dispute'" class="secondary-btn" style="position: absolute; left: 847px; top: 603px;">Dispute</button>
                <button (click)="screen = 'checkout-summary'" class="primary-btn" style="position: absolute; left: 1064px; top: 603px;">Confirm</button>
              </ng-container>

              <ng-container *ngSwitchCase="'dispute'">
                <div class="title-text" style="left: 79px; top: 48px; position: absolute; color: #264893; font-size: 42px; font-weight: 900;">Refund Dispute</div>
                <div class="title-text" style="width: 1000px; left: 80px; top: 104px; position: absolute; color: #264893; font-size: 18px; font-weight: 600; line-height: 22px;">If you find any discrepancies in the deduction amounts or utility calculations, please submit your evidence for management review before confirming the final settlement.</div>

                <div (click)="evidenceFileInput.click()" class="clickable" style="width: 424px; height: 263px; left: 80px; top: 218px; position: absolute; border: 3px dashed #9eb1d6; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
                  <img src="assets/icons/Browse.png" style="width: 86px; height: 86px; object-fit: contain;" alt="" />
                  <button class="primary-btn" style="height: 34px; min-width: 142px; font-size: 16px; padding: 0 24px; border-radius: 8px;">Browse</button>
                  <span class="page-text" style="color: #264893; font-size: 13px; font-weight: 700;">{{ evidenceFileName || 'Upload Your Evidence' }}</span>
                  <input #evidenceFileInput type="file" (change)="onEvidenceSelected($event)" style="display: none;" />
                </div>

                <div class="title-text" style="left: 578px; top: 217px; position: absolute; color: #264893; font-size: 22px; font-weight: 900;">Detailed Dispute</div>
                <label class="page-text" style="left: 578px; top: 275px; position: absolute; color: #111; font-size: 15px; font-weight: 700;">Name</label>
                <input [(ngModel)]="disputeName" class="field" style="width: 426px; height: 42px; left: 818px; top: 259px; position: absolute;" />
                <label class="page-text" style="left: 578px; top: 329px; position: absolute; color: #111; font-size: 15px; font-weight: 700;">Branch</label>
                <input [(ngModel)]="disputeBranch" class="field" style="width: 426px; height: 42px; left: 818px; top: 314px; position: absolute;" />
                <label class="page-text" style="left: 578px; top: 384px; position: absolute; color: #111; font-size: 15px; font-weight: 700;">Reasons for Dispute</label>
                <textarea [(ngModel)]="disputeReason" class="field" style="width: 426px; height: 116px; left: 818px; top: 368px; position: absolute;"></textarea>
                <button (click)="submitDispute()" class="primary-btn" style="position: absolute; left: 1050px; top: 545px; height: 60px; min-width: 168px; font-size: 21px;">Submit</button>
              </ng-container>

              <ng-container *ngSwitchCase="'payment-success'">
                <div style="position: absolute; left: 0; top: 0; width: 1317px; height: 687px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                  <div style="width: 200px; height: 200px; border: 8px solid #264893; border-radius: 50%; position: relative;">
                    <div style="position: absolute; width: 110px; height: 60px; border-left: 8px solid #264893; border-bottom: 8px solid #264893; transform: rotate(-50deg); left: 45px; top: 55px;"></div>
                  </div>
                  <div class="title-text" style="margin-top: 42px; color: #264893; font-size: 52px; font-weight: 900;">Payment Confirmed!</div>
                  <div class="title-text" style="margin-top: 22px; color: #264893; font-size: 24px; font-weight: 600;">Your room is now reserved.</div>
                </div>
              </ng-container>

              <ng-container *ngSwitchCase="'payment-fail'">
                <div style="position: absolute; left: 0; top: 0; width: 1317px; height: 687px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                  <div style="width: 200px; height: 200px; border: 8px solid #264893; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #264893; font-size: 90px; font-weight: 900;">X</div>
                  <div class="title-text" style="margin-top: 42px; color: #264893; font-size: 52px; font-weight: 900;">Payment Failed</div>
                  <div class="title-text" style="margin-top: 22px; color: #264893; font-size: 24px; font-weight: 600;">Please check your balance or try another method</div>
                </div>
              </ng-container>
            </ng-container>
          </div>

          <div *ngIf="showSignatureModal" class="modal-backdrop">
            <div class="modal" style="width: 826px; height: 524px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <div class="title-text" style="color: #264893; font-size: 52px; font-weight: 900;">Confirm E-Contract</div>
              <div class="page-text" style="width: 640px; margin-top: 36px; text-align: center; color: #6e85bd; font-size: 28px; font-weight: 700; line-height: 44px;">You are about to submit your digital signature to formalize this lease agreement.</div>
              <div style="display: flex; gap: 22px; margin-top: 82px;">
                <button (click)="showSignatureModal = false" class="secondary-btn">Cancel</button>
                <button (click)="confirmSignature()" class="primary-btn">Confirm</button>
              </div>
            </div>
          </div>

          <div *ngIf="showImageModal" class="modal-backdrop">
            <div class="modal" style="width: 826px; height: 620px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <div style="width: 635px; height: 362px; border: 3px dashed #9eb1d6; border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                <div style="width: 580px; height: 312px; border-radius: 16px; background: #d9d9d9; display: flex; align-items: center; justify-content: center; color: #9eb1d6; font-size: 120px;">&#9633;</div>
              </div>
              <button (click)="showImageModal = false" class="primary-btn" style="margin-top: 44px;">Close</button>
            </div>
          </div>

          <div *ngIf="showQrModal" class="modal-backdrop">
            <div class="modal" style="width: 880px; height: 610px; background: #f6f6f6; display: flex; align-items: stretch; overflow: hidden;">
              <div style="width: 474px; background: white; display: flex; align-items: center; justify-content: center;">
                <div class="qr-svg-box" style="width: 396px; height: 396px; position: relative; background: white; padding: 18px; box-sizing: border-box;">
                  <div [innerHTML]="qrCodeSvg" style="width: 360px; height: 360px;"></div>
                  <div style="position: absolute; left: 164px; top: 164px; width: 68px; height: 68px; background: white; border-radius: 14px; border: 6px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);">
                    <img [src]="selectedPaymentIcon" style="max-width: 58px; max-height: 58px; object-fit: contain;" alt="" />
                  </div>
                </div>
              </div>
              <div style="width: 406px; padding: 58px 54px; box-sizing: border-box; display: flex; flex-direction: column;">
                <div class="title-text" style="color: #264893; font-size: 48px; font-weight: 900;">Scan to Pay</div>
                <div class="page-text" style="margin-top: 12px; color: #6b7280; font-size: 20px; line-height: 28px;">Use your banking app to scan this QR code and confirm the refund settlement.</div>
                <div style="height: 1px; background: #d9d9d9; margin: 34px 0;"></div>
                <div class="page-text" style="display: flex; justify-content: space-between; align-items: center; color: #111; font-size: 20px;">
                  <span>Payment method</span>
                  <img [src]="selectedPaymentIcon" style="max-width: 92px; max-height: 42px; object-fit: contain;" alt="" />
                </div>
                <div class="page-text" style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; color: #111; font-size: 20px;">
                  <span>Final balance</span>
                  <strong style="color: #0087b8;">{{ formatCurrency(finalBalance) }}</strong>
                </div>
                <div class="page-text" style="margin-top: 22px; color: #777; font-size: 17px;">Resident: {{ residency.customerName }}</div>
                <div style="flex: 1;"></div>
                <div style="display: flex; gap: 16px;">
                  <button (click)="showQrModal = false" class="secondary-btn" style="height: 58px; min-width: 128px; font-size: 21px; padding: 0 26px;">Cancel</button>
                  <button (click)="finishQrPayment()" class="primary-btn" style="height: 58px; min-width: 136px; font-size: 21px; padding: 0 28px;">I Paid</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerContractsComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly checkoutSvc = inject(CheckoutService);
  private readonly contractsSvc = inject(ContractsService);
  private readonly destroy$ = new Subject<void>();

  activeContractId: string | null = null;
  activeCheckoutId: string | null = null;
  settlementData: SettlementDTO | null = null;
  isSubmitting = false;
  loadingContract = true;

  scaleFactor = 1;
  screen: ContractScreen = 'residency';
  isLangMenuOpen = false;
  isUserMenuOpen = false;
  showSignatureModal = false;
  showImageModal = false;
  showQrModal = false;
  qrCodeSvg: SafeHtml = '';
  signatureAcknowledged = false;
  checkoutDate = '';
  checkoutReason = '';
  checkoutError = '';
  selectedPayment: PaymentMethod = 'momo';
  damageFee = 0;
  outstandingRent = 0;
  refundRate = 100;
  evidenceFileName = '';
  disputeName = '';
  disputeBranch = '';
  disputeReason = '';

  residency = {
    customerName: '—',
    branch: '—',
    roomBed: '—',
    roomShort: '—',
    moveInDate: '—',
    monthlyRent: 0,
    deposit: 0,
    status: 'Loading...',
    term: '—',
  };

  readonly assetGroups: AssetGroup[] = [
    { label: 'Electric', items: ['Lighting fixtures', 'Bed Frame & Mattress', 'Door & Lock'] },
    { label: 'Furniture', items: ['Air Conditioning', 'Desk & Chair', 'Windows & Curtains'] },
    { label: 'Structure', items: ['Ceiling Fan', 'Personal Locker', 'Wall Condition'] },
  ];

  constructor() {
    this.translate.addLangs(['en', 'vi']);
    const browserLang = this.translate.getBrowserLang();
    const fallbackLang = browserLang?.match(/en|vi/) ? browserLang : 'vi';
    this.translate.setDefaultLang(fallbackLang);
    this.translate.use(fallbackLang);
    this.onResize();
  }

  ngOnInit(): void {
    this.loadActiveContract();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.scaleFactor = window.innerWidth / 1920;
  }

  get isResidencyScreen(): boolean {
    return this.screen === 'residency' || this.screen === 'handover';
  }

  get isCheckoutScreen(): boolean {
    return !this.isResidencyScreen;
  }

  get damageFeeNumber(): number {
    return Number(this.damageFee) || 0;
  }

  get refundableDeposit(): number {
    if (this.settlementData) {
      return this.settlementData.depositTotal * this.settlementData.refundRate;
    }
    return this.residency.deposit * this.refundRate / 100;
  }

  get totalDeductions(): number {
    if (this.settlementData) {
      return this.settlementData.deduction;
    }
    return this.outstandingRent + this.damageFeeNumber;
  }

  get finalBalance(): number {
    if (this.settlementData) {
      return this.settlementData.finalAmount;
    }
    return this.refundableDeposit - this.totalDeductions;
  }

  get formattedCheckoutDate(): string {
    if (!this.checkoutDate) return '15/04/2026';
    const [year, month, day] = this.checkoutDate.split('-');
    return `${day}/${month}/${year}`;
  }

  get selectedPaymentIcon(): string {
    if (this.selectedPayment === 'visa') return 'assets/icons/Visa-Logo 1.svg';
    if (this.selectedPayment === 'momo') return 'assets/icons/MoMo_Logo_App.svg 1.svg';
    return 'assets/icons/Icon-VNPAY-QR 1.svg';
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
      const result = this.authService.logout() as { subscribe?: (callback: () => void) => void } | null | undefined;
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

  goResidency(): void {
    this.screen = 'residency';
  }

  goHandover(): void {
    this.screen = 'handover';
  }

  goCheckout(): void {
    this.screen = 'checkout-registration';
    this.checkoutError = '';
  }

  openSignatureConfirm(): void {
    if (!this.signatureAcknowledged) return;
    this.showSignatureModal = true;
  }

  confirmSignature(): void {
    this.showSignatureModal = false;
    this.screen = 'residency';
  }

  submitCheckoutRequest(): void {
    if (!this.checkoutDate) {
      this.checkoutError = 'Please choose a proposed checkout date.';
      return;
    }
    if (!this.activeContractId) {
      this.checkoutError = 'No active contract found. Please contact staff.';
      return;
    }
    this.checkoutError = '';
    this.isSubmitting = true;
    const user = this.authService.getCurrentUser();
    this.checkoutSvc.createCheckoutRequest({
      contract_id: this.activeContractId,
      customer_id: user?.id ?? '',
      requested_checkout_date: this.checkoutDate,
      reason: this.checkoutReason || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.activeCheckoutId = res.data.id;
        this.isSubmitting = false;
        this.screen = 'checkout-detail';
      },
      error: (err) => {
        this.checkoutError = err?.error?.message ?? 'Failed to submit request. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  async confirmRefundPayment(): Promise<void> {
    if (this.selectedPayment === 'visa') {
      this.screen = 'payment-fail';
      return;
    }
    await this.generatePaymentQr();
    this.showQrModal = true;
  }

  finishQrPayment(): void {
    this.showQrModal = false;
    this.screen = 'payment-success';
  }

  onEvidenceSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.evidenceFileName = input.files?.[0]?.name ?? '';
  }

  submitDispute(): void {
    this.screen = 'checkout-detail';
  }

  formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('en-US').format(value)}VND`;
  }

  private loadActiveContract(): void {
    this.loadingContract = true;
    this.contractsSvc.listContracts({ status: 'active', limit: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const contract = res.data.data[0] ?? null;
          if (contract) {
            this.activeContractId = contract.id;
            this.populateResidency(contract);
            this.loadExistingCheckout();
          }
          this.loadingContract = false;
        },
        error: () => { this.loadingContract = false; },
      });
  }

  private populateResidency(contract: ContractListItem): void {
    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    const roomBed = contract.room?.roomNumber
      ? (contract.bed?.bedNumber
          ? `${contract.room.roomNumber} - Bed ${contract.bed.bedNumber}`
          : contract.room.roomNumber)
      : '—';
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    this.residency = {
      customerName: contract.customer?.fullName ?? contract.customer?.email ?? '—',
      branch: 'HomeStay Dorm',
      roomBed,
      roomShort: contract.room?.roomNumber ?? '—',
      moveInDate: this.formatIsoDate(contract.startDate),
      monthlyRent: contract.monthlyPrice,
      deposit: contract.deposit?.amount ?? 0,
      status: contract.status.charAt(0).toUpperCase() + contract.status.slice(1),
      term: `${monthsDiff} months`,
    };

    const now = new Date();
    if (end <= now) {
      this.refundRate = 100;
    } else {
      const monthsStayed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      this.refundRate = monthsStayed < 6 ? 50 : 70;
    }
  }

  private loadExistingCheckout(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !this.activeContractId) return;
    this.checkoutSvc.listCheckoutRequests({ customerId: user.id, limit: 10 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const existing = res.data.data.find(
            r => r.contractId === this.activeContractId && r.status !== 'cancelled'
          );
          if (existing) {
            this.activeCheckoutId = existing.id;
            if (existing.settlement) {
              this.settlementData = existing.settlement;
              this.refundRate = Math.round(existing.settlement.refundRate * 100);
              this.damageFee = existing.settlement.deduction;
            }
          }
        },
        error: () => {},
      });
  }

  private formatIsoDate(isoDate: string): string {
    const d = new Date(isoDate);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  private async generatePaymentQr(): Promise<void> {
    const payload = [
      'HOMESTAY_DORM_REFUND',
      `resident=${this.residency.customerName}`,
      `room=${this.residency.roomShort}`,
      `method=${this.selectedPayment.toUpperCase()}`,
      `amount=${this.finalBalance}`,
      `checkout=${this.formattedCheckoutDate}`,
    ].join('|');

    const svg = await QRCode.toString(payload, {
      type: 'svg',
      width: 360,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    this.qrCodeSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
