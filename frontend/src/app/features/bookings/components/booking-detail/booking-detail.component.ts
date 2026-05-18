import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MyBookingService } from '../../../../core/services/my-booking.service';
import { AuthService } from '../../../../core/services/auth.service';

interface DepositInfo {
  id: string;
  amount: number;
  due_at: string;
  status: string;
  paid_at: string | null;
  notes: string | null;
}

interface BookingDetail {
  id: string;
  status: string;
  preferred_room_type: string | null;
  expected_move_in_date: string | null;
  move_out_date: string | null;
  rental_duration_months?: number | null;
  people_count: number | null;
  notes: string | null;
  note: string | null;
  created_at: string;
  branches?: { id: string; name: string; address: string; phone: string };
  rooms?: { id: string; room_number: string; room_type: string; price_per_month: number };
  beds?: { id: string; bed_number: string; price_per_month: number };
  deposit_requests?: DepositInfo[];
}

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  template: `
    <div [style.height.px]="1080 * scaleFactor" style="width: 100%; overflow: hidden; position: relative; background: #FEF4DF;">
      <div [style.transform]="'scale(' + scaleFactor + ')'" style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 1080px;">
        <div style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden">

          <div style="width: 1920px; height: 644px; left: 0px; top: -5px; position: absolute; background: #503D2E"></div>
          <img style="width: 1133px; height: 638px; left: 552px; top: 0px; position: absolute; object-fit: cover" src="assets/pictures/Background.png" alt="Background" />
          <div style="width: 2000px; height: 622px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"></div>
          <div style="width: 1920px; height: 698px; left: 0px; top: 393px; position: absolute; background: #FEF4DF"></div>
          <img src="assets/pictures/Union.png" style="position: absolute; left: 0px; top: 0px; height: 1080px; object-fit: cover; pointer-events: none" alt="Sidebar Background" />

          <!-- Nav -->
          <div (click)="navigate('/guidelines')" style="width: 152px; height: 53px; left: 1238px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.GUIDELINES' | translate }}</div>
          <div (click)="navigate('/about')" style="width: 126px; height: 53px; left: 1071px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.ABOUT_US' | translate }}</div>
          <div (click)="navigate('/contact')" style="width: 135px; height: 53px; left: 1431px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.CONTACT' | translate }}</div>

          <img (click)="navigate('/')" style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; object-fit: contain; cursor: pointer; z-index: 50;" src="assets/icons/FooterLogo.png" alt="Homestay Dorm Logo" />

          <div (click)="navigate('/profile')" style="width: 126px; height: 62px; left: 191px; top: 331px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.PROFILE' | translate }}</div>
          <img src="assets/icons/Group 22.png" style="width: 40px; height: 40px; left: 132px; top: 342px; position: absolute; object-fit: contain; z-index: 50;" alt="Profile Icon" />

          <div (click)="navigate('/bookings')" style="width: 156px; height: 61px; left: 191px; top: 424px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.BOOKING' | translate }}</div>
          <img src="assets/icons/Group 23.png" style="width: 40px; height: 40px; left: 132px; top: 435px; position: absolute; object-fit: contain; z-index: 50;" alt="Booking Icon" />

          <div (click)="navigate('/contracts')" style="width: 126px; height: 62px; left: 188px; top: 527px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word; cursor: pointer; z-index: 50;">{{ 'COMMON.CONTRACT' | translate }}</div>
          <img src="assets/icons/Contracts.png" style="width: 40px; height: 40px; left: 132px; top: 538px; position: absolute; object-fit: contain; z-index: 50;" alt="Contract Icon" />

          <!-- Contact footer -->
          <div style="width: 400px; height: 209px; left: 0px; top: 870px; position: absolute; text-align: center">
            <span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.TITLE' | translate }}<br/><br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.HEADQUARTERS' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.ADDRESS_1' | translate }}<br/>{{ 'CONTACT_INFO.ADDRESS_2' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.PHONE_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.PHONE' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.EMAIL_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.EMAIL' | translate }}<br/></span>
            <span style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word">{{ 'CONTACT_INFO.HOURS_LABEL' | translate }}</span><span style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word">{{ 'CONTACT_INFO.HOURS' | translate }}</span>
          </div>

          <!-- Loading -->
          <div *ngIf="isLoading" style="position: absolute; left: 500px; top: 400px; width: 1317px; display: flex; justify-content: center; align-items: center; z-index: 50;">
            <span style="color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600;">Loading...</span>
          </div>

          <!-- Error -->
          <div *ngIf="errorMsg && !isLoading" style="position: absolute; left: 500px; top: 400px; width: 1317px; display: flex; justify-content: center; align-items: center; z-index: 50;">
            <span style="color: #ff4d4f; font-size: 28px; font-family: Afacad; font-weight: 600;">{{ errorMsg }}</span>
          </div>

          <!-- Main content -->
          <div *ngIf="booking && !isLoading" style="position: absolute; left: 500px; top: 180px; width: 1317px; height: 860px; overflow-y: auto; z-index: 10; padding-right: 15px;">

            <!-- Back link + title -->
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
              <button (click)="navigate('/bookings')" style="padding: 8px 20px; background: white; color: #264893; border: 2px solid #264893; border-radius: 12px; font-family: Afacad; font-size: 22px; font-weight: 600; cursor: pointer;">
                ← Back
              </button>
              <div style="color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900;">
                Booking Detail
                <span *ngIf="booking.rooms?.room_number"> — Room {{ booking.rooms?.room_number }}</span>
              </div>
            </div>

            <!-- Progress tracker card -->
            <div style="width: 100%; background: rgba(246,246,246,0.70); box-shadow: 5px 5px 50px 5px rgba(0,0,0,0.15); border-radius: 25px; padding: 40px 50px; margin-bottom: 24px; position: relative;">
              <div style="color: #264893; font-size: 32px; font-family: Big Shoulders Text; font-weight: 700; margin-bottom: 8px;">Request Status</div>
              <div style="color: #595959; font-size: 20px; font-family: Big Shoulders Text; font-weight: 600; margin-bottom: 40px;">Track your booking progress</div>

              <!-- Track line -->
              <div style="position: relative; width: 100%; height: 120px; display: flex;">
                <!-- Grey base line -->
                <div style="position: absolute; left: 60px; right: 60px; height: 4px; background: #D9D9D9; top: 30px;"></div>
                <!-- Blue progress line -->
                <div [style.width]="getLinePercent()" style="position: absolute; left: 60px; height: 4px; background: #264893; top: 30px; transition: width 0.3s ease;"></div>

                <!-- Step 1 -->
                <div style="position: absolute; left: -10px; top: 0; display: flex; flex-direction: column; align-items: center; width: 160px;">
                  <div [style.background]="getStepBg(1)" style="width: 60px; height: 60px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-family: Big Shoulders Text; font-weight: 900; margin-bottom: 8px;" [style.color]="getStepColor(1)">1</div>
                  <div style="text-align: center; color: #264893; font-size: 20px; font-family: Big Shoulders Text; font-weight: 700;">Under Review</div>
                </div>
                <!-- Step 2 -->
                <div style="position: absolute; left: calc(33% - 50px); top: 0; display: flex; flex-direction: column; align-items: center; width: 160px;">
                  <div [style.background]="getStepBg(2)" style="width: 60px; height: 60px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-family: Big Shoulders Text; font-weight: 900; margin-bottom: 8px;" [style.color]="getStepColor(2)">2</div>
                  <div style="text-align: center; color: #264893; font-size: 20px; font-family: Big Shoulders Text; font-weight: 700;">Viewing Scheduled</div>
                </div>
                <!-- Step 3 -->
                <div style="position: absolute; left: calc(66% - 50px); top: 0; display: flex; flex-direction: column; align-items: center; width: 160px;">
                  <div [style.background]="getStepBg(3)" style="width: 60px; height: 60px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-family: Big Shoulders Text; font-weight: 900; margin-bottom: 8px;" [style.color]="getStepColor(3)">3</div>
                  <div style="text-align: center; color: #264893; font-size: 20px; font-family: Big Shoulders Text; font-weight: 700;">Awaiting Deposit</div>
                </div>
                <!-- Step 4 -->
                <div style="position: absolute; right: -10px; top: 0; display: flex; flex-direction: column; align-items: center; width: 160px;">
                  <div [style.background]="getStepBg(4)" style="width: 60px; height: 60px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-family: Big Shoulders Text; font-weight: 900; margin-bottom: 8px;" [style.color]="getStepColor(4)">4</div>
                  <div style="text-align: center; color: #264893; font-size: 20px; font-family: Big Shoulders Text; font-weight: 700;">Confirmed</div>
                </div>
              </div>

              <!-- Terminal banner — rejected/cancelled are end states, not progressions -->
              <div *ngIf="isTerminal()" style="margin-top: 20px; padding: 14px 20px; background: #fee2e2; border: 2px solid #fca5a5; border-radius: 14px; display: flex; align-items: center; gap: 12px;">
                <span style="display: inline-flex; width: 28px; height: 28px; align-items: center; justify-content: center; border-radius: 9999px; background: #b91c1c; color: white; font-weight: 900;">!</span>
                <div>
                  <div style="color: #991b1b; font-size: 20px; font-family: Big Shoulders Text; font-weight: 900;">
                    {{ booking?.status === 'cancelled' ? 'You cancelled this request' : 'This request was declined' }}
                  </div>
                  <div style="color: #7f1d1d; font-size: 14px; font-family: Big Shoulders Text;">
                    {{ booking?.status === 'cancelled' ? 'Feel free to submit a new request anytime.' : 'The room is no longer available or the application criteria were not met.' }}
                  </div>
                </div>
              </div>

              <!-- Deposit Instructions CTA — shown whenever awaiting deposit -->
              <div *ngIf="booking.status === 'deposit_pending'"
                   style="margin-top: 24px; display: flex; align-items: center; justify-content: space-between;
                          background: #e8edf8; border-radius: 16px; padding: 18px 28px;">
                <div>
                  <div style="color: #264893; font-size: 22px; font-family: 'Big Shoulders Text', sans-serif; font-weight: 700;">
                    Ready to secure your room?
                  </div>
                  <div style="color: #595959; font-size: 16px; font-family: Afacad;">
                    Learn how to calculate and submit your deposit payment.
                  </div>
                </div>
                <button (click)="openDepositModal()"
                        style="padding: 12px 28px; background: #264893; color: white; border: none;
                               border-radius: 20px; font-family: 'Big Shoulders Text', sans-serif;
                               font-size: 20px; font-weight: 700; cursor: pointer; white-space: nowrap;
                               box-shadow: 0 4px 14px rgba(38,72,147,0.3);"
                        onmouseover="this.style.opacity='0.88'" onmouseout="this.style.opacity='1'">
                  Deposit Instructions
                </button>
              </div>

            </div>

            <!-- Booking info card -->
            <div style="width: 100%; background: rgba(246,246,246,0.70); box-shadow: 5px 5px 50px 5px rgba(0,0,0,0.15); border-radius: 25px; padding: 40px 50px; margin-bottom: 24px;">
              <div style="color: #264893; font-size: 32px; font-family: Big Shoulders Text; font-weight: 700; margin-bottom: 24px;">Booking Information</div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Branch</div>
                  <div style="color: #264893; font-size: 24px; font-family: Afacad; font-weight: 700;">{{ booking.branches?.name || '—' }}</div>
                  <div style="color: #595959; font-size: 18px; font-family: Afacad;">{{ booking.branches?.address || '' }}</div>
                </div>
                <div>
                  <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Room</div>
                  <div style="color: #264893; font-size: 24px; font-family: Afacad; font-weight: 700;">
                    {{ booking.rooms?.room_number ? 'Room ' + booking.rooms?.room_number : '—' }}
                    <span *ngIf="booking.beds?.bed_number"> / Bed {{ booking.beds?.bed_number }}</span>
                  </div>
                  <div style="color: #595959; font-size: 18px; font-family: Afacad;">{{ booking.rooms?.room_type || booking.preferred_room_type || '—' }}</div>
                </div>
                <div>
                  <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Move-in Date</div>
                  <div style="color: #264893; font-size: 24px; font-family: Afacad; font-weight: 700;">{{ formatDate(booking.expected_move_in_date) }}</div>
                </div>
                <div>
                  <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Move-out Date</div>
                  <div style="color: #264893; font-size: 24px; font-family: Afacad; font-weight: 700;">{{ calculateMoveOutDate(booking.expected_move_in_date, booking.rental_duration_months) }}</div>
                </div>
                <div>
                  <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Occupants</div>
                  <div style="color: #264893; font-size: 24px; font-family: Afacad; font-weight: 700;">{{ booking.people_count || 1 }}</div>
                </div>
                <div>
                  <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Submitted</div>
                  <div style="color: #264893; font-size: 24px; font-family: Afacad; font-weight: 700;">{{ formatDate(booking.created_at) }}</div>
                </div>
              </div>

              <div *ngIf="booking.notes" style="margin-top: 20px;">
                <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Notes</div>
                <div style="color: #595959; font-size: 20px; font-family: Afacad;">{{ booking.notes }}</div>
              </div>
            </div>

            <!-- Deposit info card (shown when deposit_pending or later) -->
            <div *ngIf="deposit" style="width: 100%; background: rgba(246,246,246,0.70); box-shadow: 5px 5px 50px 5px rgba(0,0,0,0.15); border-radius: 25px; padding: 40px 50px; margin-bottom: 24px;">
              <div style="color: #264893; font-size: 32px; font-family: Big Shoulders Text; font-weight: 700; margin-bottom: 24px;">Deposit Information</div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                <div>
                  <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Amount</div>
                  <div style="color: #264893; font-size: 32px; font-family: Big Shoulders Text; font-weight: 900;">{{ formatAmount(deposit.amount) }} VND</div>
                </div>
                <div>
                  <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Due Date</div>
                  <div style="color: #264893; font-size: 24px; font-family: Afacad; font-weight: 700;">{{ formatDate(deposit.due_at) }}</div>
                </div>
                <div>
                  <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Deposit Status</div>
                  <span [style.background]="depositBadgeBg(deposit.status)" [style.color]="depositBadgeColor(deposit.status)" style="display: inline-block; padding: 4px 16px; border-radius: 9999px; font-size: 20px; font-family: Afacad; font-weight: 700;">
                    {{ deposit.status | titlecase }}
                  </span>
                </div>
                <div *ngIf="deposit.paid_at">
                  <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Paid At</div>
                  <div style="color: #264893; font-size: 24px; font-family: Afacad; font-weight: 700;">{{ formatDate(deposit.paid_at) }}</div>
                </div>
              </div>

              <!-- Payment instructions for pending deposit -->
              <div *ngIf="deposit.status === 'pending'" style="background: #fffbf0; border: 2px solid #f0d080; border-radius: 16px; padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                  <div style="color: #264893; font-size: 26px; font-family: Big Shoulders Text; font-weight: 700;">Payment Instructions</div>
                  <button (click)="openDepositModal()" style="padding: 10px 24px; background: #264893; color: white; border: none; border-radius: 20px; font-family: 'Big Shoulders Text', sans-serif; font-size: 20px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(38,72,147,0.25); transition: opacity 0.2s;" onmouseover="this.style.opacity='0.88'" onmouseout="this.style.opacity='1'">
                    Deposit Instructions
                  </button>
                </div>
                <div style="color: #595959; font-size: 20px; font-family: Afacad; line-height: 1.6;">
                  Please transfer <strong style="color:#264893">{{ formatAmount(deposit.amount) }} VND</strong> to our bank account below. Include your booking ID in the transfer description.
                </div>
                <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div>
                    <div style="color: #8a8a8a; font-size: 16px; font-family: Afacad; font-weight: 600;">Bank</div>
                    <div style="color: #264893; font-size: 22px; font-family: Afacad; font-weight: 700;">Vietcombank</div>
                  </div>
                  <div>
                    <div style="color: #8a8a8a; font-size: 16px; font-family: Afacad; font-weight: 600;">Account Number</div>
                    <div style="color: #264893; font-size: 22px; font-family: Afacad; font-weight: 700;">1234567890</div>
                  </div>
                  <div>
                    <div style="color: #8a8a8a; font-size: 16px; font-family: Afacad; font-weight: 600;">Account Name</div>
                    <div style="color: #264893; font-size: 22px; font-family: Afacad; font-weight: 700;">HOMESTAY DORM CO LTD</div>
                  </div>
                  <div>
                    <div style="color: #8a8a8a; font-size: 16px; font-family: Afacad; font-weight: 600;">Transfer Description</div>
                    <div style="color: #264893; font-size: 18px; font-family: Afacad; font-weight: 700; word-break: break-all;">DEPOSIT {{ booking.id }}</div>
                  </div>
                </div>
                <div style="margin-top: 16px; padding: 12px 16px; background: #fff3cd; border-radius: 10px; color: #856404; font-size: 18px; font-family: Afacad;">
                  After transferring, please contact our Sales team with your proof of payment. Your booking will be confirmed once payment is verified.
                </div>
              </div>

              <!-- Paid confirmation -->
              <div *ngIf="deposit.status === 'paid'" style="background: #f0fff4; border: 2px solid #86efac; border-radius: 16px; padding: 24px;">
                <div style="color: #166534; font-size: 24px; font-family: Big Shoulders Text; font-weight: 700;">Deposit Confirmed</div>
                <div style="color: #595959; font-size: 20px; font-family: Afacad; margin-top: 8px;">Your deposit has been received and confirmed. Our team will contact you shortly for the next steps.</div>
              </div>

              <div *ngIf="deposit.notes" style="margin-top: 16px;">
                <div style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">Notes from Staff</div>
                <div style="color: #595959; font-size: 20px; font-family: Afacad;">{{ deposit.notes }}</div>
              </div>
            </div>


          <!-- ══════════════════════════════════════════════════ -->
          <!-- Deposit Instructions Modal                        -->
          <!-- ══════════════════════════════════════════════════ -->
          <div *ngIf="showDepositInstructions"
               style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000;
                      display: flex; align-items: center; justify-content: center;"
               (click)="showDepositInstructions = false">
            <div (click)="$event.stopPropagation()"
                 style="background: #f6f6f6; border-radius: 25px; width: 780px; max-height: 88vh;
                        overflow-y: auto; padding: 48px 52px; position: relative;
                        box-shadow: 0 20px 60px rgba(38,72,147,0.22);">

              <!-- Close button -->
              <button (click)="showDepositInstructions = false"
                      style="position: absolute; top: 20px; right: 24px; background: none; border: none;
                             font-size: 28px; color: #8a8a8a; cursor: pointer; line-height: 1;">&#10005;</button>

              <!-- Title -->
              <div style="color: #264893; font-size: 38px; font-family: 'Big Shoulders Text', sans-serif;
                          font-weight: 900; margin-bottom: 4px; letter-spacing: 1px;">
                Deposit Instructions
              </div>
              <div style="width: 56px; height: 4px; background: #264893; border-radius: 4px; margin-bottom: 28px;"></div>

              <!-- Step 1 -->
              <div style="display: flex; gap: 18px; margin-bottom: 24px;">
                <div style="min-width: 40px; height: 40px; border-radius: 50%; background: #264893; color: white;
                            display: flex; align-items: center; justify-content: center;
                            font-family: 'Big Shoulders Text', sans-serif; font-size: 20px; font-weight: 900;">1</div>
                <div>
                  <div style="color: #264893; font-size: 22px; font-family: 'Big Shoulders Text', sans-serif; font-weight: 700; margin-bottom: 4px;">Eligibility Check</div>
                  <div style="color: #595959; font-size: 17px; font-family: Afacad; line-height: 1.65;">
                    Our sales team will review your profile and verify you meet the dormitory requirements — including gender policy, nationality, required documents, and financial capacity. They will also confirm the room or bed is still available at this time.
                  </div>
                </div>
              </div>

              <!-- Step 2 -->
              <div style="display: flex; gap: 18px; margin-bottom: 24px;">
                <div style="min-width: 40px; height: 40px; border-radius: 50%; background: #264893; color: white;
                            display: flex; align-items: center; justify-content: center;
                            font-family: 'Big Shoulders Text', sans-serif; font-size: 20px; font-weight: 900;">2</div>
                <div>
                  <div style="color: #264893; font-size: 22px; font-family: 'Big Shoulders Text', sans-serif; font-weight: 700; margin-bottom: 4px;">Deposit Amount Calculation</div>
                  <div style="color: #595959; font-size: 17px; font-family: Afacad; line-height: 1.65;">
                    The deposit is calculated as:<br/>
                    <div style="margin: 10px 0 10px 0; padding: 14px 20px; background: #e8edf8; border-radius: 12px; border-left: 4px solid #264893;">
                      <span style="color: #264893; font-family: 'Big Shoulders Text', sans-serif; font-size: 19px; font-weight: 900;">
                        Deposit = (2 months rent) &times; (number of beds rented)
                      </span>
                    </div>
                    For a <strong>whole room</strong>, the number of beds equals the room's full capacity (e.g. a 4-person room = 4 beds).
                    The accountant department will calculate the exact amount and send you a payment request.
                  </div>
                </div>
              </div>

              <!-- Step 3 -->
              <div style="display: flex; gap: 18px; margin-bottom: 24px;">
                <div style="min-width: 40px; height: 40px; border-radius: 50%; background: #264893; color: white;
                            display: flex; align-items: center; justify-content: center;
                            font-family: 'Big Shoulders Text', sans-serif; font-size: 20px; font-weight: 900;">3</div>
                <div>
                  <div style="color: #264893; font-size: 22px; font-family: 'Big Shoulders Text', sans-serif; font-weight: 700; margin-bottom: 4px;">Make Payment</div>
                  <div style="color: #595959; font-size: 17px; font-family: Afacad; line-height: 1.65;">
                    You may pay your deposit by <strong>cash</strong> or <strong>bank transfer</strong>.
                  </div>
                  <div *ngIf="deposit" style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div style="background: white; border-radius: 14px; padding: 14px 16px; border: 1.5px solid #e0e7ff;">
                      <div style="color: #8a8a8a; font-size: 14px; font-family: Afacad; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Amount Due</div>
                      <div style="color: #264893; font-size: 22px; font-family: 'Big Shoulders Text', sans-serif; font-weight: 900; margin-top: 2px;">{{ formatAmount(deposit.amount) }} VND</div>
                    </div>
                    <div style="background: white; border-radius: 14px; padding: 14px 16px; border: 1.5px solid #e0e7ff;">
                      <div style="color: #8a8a8a; font-size: 14px; font-family: Afacad; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Payment Deadline</div>
                      <div style="color: #264893; font-size: 20px; font-family: 'Big Shoulders Text', sans-serif; font-weight: 900; margin-top: 2px;">{{ formatDate(deposit.due_at) }}</div>
                    </div>
                  </div>
                  <!-- 24h warning -->
                  <div style="margin-top: 12px; padding: 12px 16px; background: #fff3cd; border-radius: 12px;
                              border-left: 4px solid #f59e0b;">
                    <span style="color: #92400e; font-size: 16px; font-family: Afacad; font-weight: 700;">
                      You have 24 hours from receiving the payment request to complete your deposit.
                      If payment is not received within this window, your deposit request will be automatically cancelled.
                    </span>
                  </div>
                </div>
              </div>

              <!-- Step 4 -->
              <div style="display: flex; gap: 18px; margin-bottom: 32px;">
                <div style="min-width: 40px; height: 40px; border-radius: 50%; background: #264893; color: white;
                            display: flex; align-items: center; justify-content: center;
                            font-family: 'Big Shoulders Text', sans-serif; font-size: 20px; font-weight: 900;">4</div>
                <div>
                  <div style="color: #264893; font-size: 22px; font-family: 'Big Shoulders Text', sans-serif; font-weight: 700; margin-bottom: 4px;">Submit Proof of Payment</div>
                  <div style="color: #595959; font-size: 17px; font-family: Afacad; line-height: 1.65;">
                    After completing your transfer, send a screenshot or photo of the transaction receipt to our Sales team.
                    The manager will verify the payment. Once confirmed, your deposit is complete and your room/bed is officially secured — no other tenants will be able to deposit on it.
                  </div>
                </div>
              </div>

              <!-- Step 5 -->
              <div style="display: flex; gap: 18px; margin-bottom: 32px;">
                <div style="min-width: 40px; height: 40px; border-radius: 50%; background: #264893; color: white;
                            display: flex; align-items: center; justify-content: center;
                            font-family: 'Big Shoulders Text', sans-serif; font-size: 20px; font-weight: 900;">5</div>
                <div>
                  <div style="color: #264893; font-size: 22px; font-family: 'Big Shoulders Text', sans-serif; font-weight: 700; margin-bottom: 4px;">Check-In Scheduling</div>
                  <div style="color: #595959; font-size: 17px; font-family: Afacad; line-height: 1.65;">
                    After the deposit is confirmed, our Sales team will contact you to arrange the move-in date and check-in procedures according to your rental agreement.
                  </div>
                </div>
              </div>

              <!-- Term Checkbox -->
              <div *ngIf="!showPaymentScreen" style="margin-top: 16px; margin-bottom: 24px;">
                <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                  <input type="checkbox" [(ngModel)]="termsAccepted"
                         style="width: 24px; height: 24px; cursor: pointer; accent-color: #264893;">
                  <span style="color: #264893; font-size: 20px; font-family: Afacad; font-weight: 700;">
                    I have read and agree to the Dormitory Terms and Conditions
                  </span>
                </label>
              </div>

              <!-- CTA / Submit Proof Action -->
              <div *ngIf="!showPaymentScreen">
                <button (click)="proceedToPayment()"
                        [disabled]="!termsAccepted || isCheckingAvailability"
                        [style.opacity]="(!termsAccepted || isCheckingAvailability) ? '0.5' : '1'"
                        [style.cursor]="(!termsAccepted || isCheckingAvailability) ? 'not-allowed' : 'pointer'"
                        style="width: 100%; padding: 16px; background: #264893; color: white;
                               border: none; border-radius: 20px; font-family: 'Big Shoulders Text', sans-serif;
                               font-size: 24px; font-weight: 700; letter-spacing: 1px;
                               transition: opacity 0.2s;">
                  {{ isCheckingAvailability ? 'Checking Availability...' : 'Agree on term' }}
                </button>
              </div>

              <!-- Payment Screen Section -->
              <div *ngIf="showPaymentScreen" style="margin-top: 32px; border-top: 2px solid #e0e7ff; padding-top: 32px;">
                <div style="color: #264893; font-size: 28px; font-family: 'Big Shoulders Text', sans-serif; font-weight: 900; margin-bottom: 16px;">
                  Upload Proof of Payment
                </div>
                
                <!-- QR Code Placeholder -->
                <div style="display: flex; gap: 24px; margin-bottom: 24px;">
                  <div style="background: white; padding: 16px; border-radius: 16px; border: 2px solid #e0e7ff; text-align: center;">
                    <!-- Placeholder QR (dynamic if needed) -->
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=banktransfer:1234567890" width="150" height="150" alt="QR Code" style="border-radius: 8px;">
                    <div style="color: #595959; font-size: 14px; font-family: Afacad; font-weight: 700; margin-top: 8px;">Scan to Pay</div>
                    <div style="margin-top: 10px; padding: 8px 12px; background: #e8edf8; border-radius: 10px; text-align: center;">
                      <div style="color: #8a8a8a; font-size: 12px; font-family: Afacad; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Amount Due</div>
                      <div style="color: #264893; font-size: 20px; font-family: 'Big Shoulders Text', sans-serif; font-weight: 900; margin-top: 2px;">
                        {{ displayDepositAmount }}
                      </div>
                    </div>
                  </div>
                  
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
                    <!-- File Upload Input -->
                    <div style="background: white; padding: 24px; border-radius: 16px; border: 2px dashed #a5b4fc; text-align: center; cursor: pointer; position: relative;"
                         onmouseover="this.style.borderColor='#264893'" onmouseout="this.style.borderColor='#a5b4fc'">
                      <input type="file" accept="image/*" (change)="onFileSelected($event)"
                             style="position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
                      
                      <div *ngIf="!proofFilePreview" style="color: #8a8a8a; font-size: 18px; font-family: Afacad; font-weight: 600;">
                        Click or drag image here to upload
                      </div>
                      
                      <div *ngIf="proofFilePreview" style="display: flex; flex-direction: column; align-items: center;">
                        <img [src]="proofFilePreview" style="max-height: 120px; border-radius: 8px; border: 1px solid #e5eaf5;">
                        <div style="color: #264893; font-size: 14px; font-family: Afacad; font-weight: 700; margin-top: 8px;">Image Selected</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 16px;">
                  <button (click)="showPaymentScreen = false; termsAccepted = false"
                          [disabled]="isSubmittingProof"
                          style="flex: 1; padding: 16px; background: white; color: #264893; border: 2px solid #264893;
                                 border-radius: 20px; font-family: 'Big Shoulders Text', sans-serif;
                                 font-size: 20px; font-weight: 700; cursor: pointer;">
                    Back
                  </button>
                  <button (click)="submitProof()"
                          [disabled]="!proofFilePreview || isSubmittingProof"
                          [style.opacity]="(!proofFilePreview || isSubmittingProof) ? '0.5' : '1'"
                          style="flex: 2; padding: 16px; background: #264893; color: white;
                                 border: none; border-radius: 20px; font-family: 'Big Shoulders Text', sans-serif;
                                 font-size: 20px; font-weight: 700; cursor: pointer;">
                    {{ isSubmittingProof ? 'Uploading...' : 'Submit Proof' }}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class BookingDetailComponent implements OnInit {
  scaleFactor = 1;
  isLoading = true;
  errorMsg = '';
  booking: BookingDetail | null = null;
  showDepositInstructions = false;
  termsAccepted = false;
  showPaymentScreen = false;
  proofFilePreview: string | null = null;
  isCheckingAvailability = false;
  isSubmittingProof = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private myBookingService: MyBookingService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
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
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMsg = 'Invalid booking ID';
      this.isLoading = false;
      return;
    }
    this.myBookingService.getBookingById(id).subscribe({
      next: (res: { data?: unknown }) => {
        this.booking = res.data as BookingDetail;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Could not load booking details.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  get deposit(): DepositInfo | null {
    const deposits = this.booking?.deposit_requests;
    if (!deposits || deposits.length === 0) return null;
    return deposits[0];
  }

  /** Amount to show in payment screen: from deposit row if it exists, else compute from room price. */
  get displayDepositAmount(): string {
    if (this.deposit) return this.formatAmount(this.deposit.amount) + ' VND';
    const room = (this.booking as any)?.rooms;
    if (!room?.price_per_month) return 'Contact staff';
    const bedsCount = (this.booking as any)?.beds ? 1 : (room.max_capacity ?? 1);
    const amount = room.price_per_month * 2 * bedsCount;
    return this.formatAmount(amount) + ' VND';
  }

  isTerminal(): boolean {
    const status = this.booking?.status ?? '';
    return status === 'rejected' || status === 'cancelled';
  }

  /**
   * 4-step happy path: Under Review → Viewing Scheduled → Awaiting Deposit → Confirmed.
   * Terminal statuses (rejected / cancelled) freeze the bar and are explained
   * via the separate terminal banner.
   */
  getStepLevel(): number {
    const status = this.booking?.status ?? '';
    if (['requested', 'reviewing'].includes(status)) return 1;
    if (status === 'viewing_scheduled') return 2;
    if (status === 'deposit_pending') return 3;
    if (['accepted', 'completed'].includes(status)) return 4;
    return 1;
  }

  getLinePercent(): string {
    if (this.isTerminal()) return '0%';
    const level = this.getStepLevel();
    if (level <= 1) return '0%';
    if (level === 2) return 'calc(33% - 10px)';
    if (level === 3) return 'calc(66% - 10px)';
    return 'calc(100% - 120px)';
  }

  getStepBg(step: number): string {
    if (this.isTerminal()) return '#D9D9D9';
    return step <= this.getStepLevel() ? '#264893' : '#D9D9D9';
  }

  getStepColor(step: number): string {
    if (this.isTerminal()) return '#595959';
    return step <= this.getStepLevel() ? 'white' : '#595959';
  }

  statusLabel(): string {
    const map: Record<string, string> = {
      requested: 'Submitted',
      reviewing: 'Under Review',
      viewing_scheduled: 'Viewing Scheduled',
      accepted: 'Approved',
      rejected: 'Declined',
      cancelled: 'Cancelled',
      deposit_pending: 'Awaiting Deposit',
      completed: 'Completed',
    };
    return map[this.booking?.status ?? ''] ?? this.booking?.status ?? '';
  }

  statusBadgeBg(): string {
    const s = this.booking?.status ?? '';
    if (['requested', 'reviewing', 'viewing_scheduled'].includes(s)) return '#e0e7ff';
    if (s === 'accepted') return '#d1fae5';
    if (['rejected', 'cancelled'].includes(s)) return '#fee2e2';
    if (s === 'deposit_pending') return '#fef3c7';
    if (s === 'completed') return '#d1fae5';
    return '#f3f4f6';
  }

  statusBadgeColor(): string {
    const s = this.booking?.status ?? '';
    if (['requested', 'reviewing', 'viewing_scheduled'].includes(s)) return '#3730a3';
    if (s === 'accepted') return '#065f46';
    if (['rejected', 'cancelled'].includes(s)) return '#991b1b';
    if (s === 'deposit_pending') return '#92400e';
    if (s === 'completed') return '#065f46';
    return '#374151';
  }

  depositBadgeBg(status: string): string {
    if (status === 'pending') return '#fef3c7';
    if (status === 'paid') return '#d1fae5';
    if (status === 'cancelled' || status === 'expired') return '#fee2e2';
    return '#f3f4f6';
  }

  depositBadgeColor(status: string): string {
    if (status === 'pending') return '#92400e';
    if (status === 'paid') return '#065f46';
    if (status === 'cancelled' || status === 'expired') return '#991b1b';
    return '#374151';
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '—';
    }
  }

  calculateMoveOutDate(moveInDateStr: string | null | undefined, durationMonths: number | null | undefined): string {
    if (!moveInDateStr || !durationMonths) return '—';
    try {
      const d = new Date(moveInDateStr);
      if (isNaN(d.getTime())) return '—';
      d.setMonth(d.getMonth() + durationMonths);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '—';
    }
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('vi-VN');
  }

  openDepositModal() {
    this.showDepositInstructions = true;
    this.termsAccepted = false;
    this.showPaymentScreen = false;
    this.proofFilePreview = null;
  }

  proceedToPayment() {
    if (!this.booking?.id || !this.termsAccepted) return;

    this.isCheckingAvailability = true;
    this.cdr.detectChanges();

    this.myBookingService.checkAvailability(this.booking.id).subscribe({
      next: (res: any) => {
        this.isCheckingAvailability = false;
        if (res.isAvailable) {
          this.showPaymentScreen = true;
        } else {
          this.showDepositInstructions = false;
          this.cdr.detectChanges();
          window.alert('Sorry, the room/bed is no longer available. Your request has been cancelled.');
          this.ngOnInit();
        }
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        this.isCheckingAvailability = false;
        this.cdr.detectChanges();
        window.alert('Failed to check availability. Please try again.');
        console.error(err);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.proofFilePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submitProof() {
    if (!this.booking?.id || !this.proofFilePreview) return;
    
    this.isSubmittingProof = true;
    this.myBookingService.submitProof(this.booking.id, this.proofFilePreview).subscribe({
      next: () => {
        this.isSubmittingProof = false;
        window.alert('Proof of payment submitted successfully! The admin will review it shortly.');
        this.showDepositInstructions = false;
        this.ngOnInit(); // Refresh to get the updated proof image and notes
      },
      error: (err) => {
        this.isSubmittingProof = false;
        window.alert('Failed to submit proof. Please try again.');
        console.error(err);
      }
    });
  }
}
