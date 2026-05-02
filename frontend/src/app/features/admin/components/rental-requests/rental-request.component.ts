import {
  Component,
  OnInit,
  ChangeDetectorRef,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { RentalRequestService } from "@core/services/rental-request.service";
import {
  StaffRentalRequestResponse,
  UpdateRentalStatusPayload,
} from "@shared/models/rental-request.model";
import { inject } from "@angular/core";
import { AuthService } from "@core/services/auth.service";

@Component({
  selector: "app-rental-requests",
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  styles: [`
    .hover-effect {
      transition: all 0.2s ease-in-out;
    }
    .hover-effect:hover {
      opacity: 0.9;
    }
  `],
  template: `
    <div
      [style.height.px]="1080 * scaleFactor"
      style="width: 100%; overflow: hidden; position: relative; background: #FEF4DF;"
    >
      <div
        *ngIf="isLoading"
        class="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6"
        style="background: #fef4df;"
      >
        <img
          src="assets/icons/logo.svg"
          alt="HomeStay Dorm"
          class="h-28 w-auto object-contain"
        />
        <p
          class="text-[1.05rem] italic tracking-wide text-[#264893]/70"
          style="font-family: 'Afacad', sans-serif;"
        >
          Nurturing Your Journey, Building Your Home.
        </p>
        <span
          class="h-9 w-9 animate-spin rounded-full border-[3px] border-[#264893]/20 border-t-[#264893]"
        ></span>
      </div>

      <div
        [style.transform]="'scale(' + scaleFactor + ')'"
        style="position: absolute; top: 0; left: 0; transform-origin: top left; width: 1920px; height: 1080px;"
      >
        <ng-container *ngIf="currentScreen === 1">
          <div
            style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden"
          >
            <div
              style="width: 1920px; height: 644px; left: 0px; top: -5px; position: absolute; background: #503D2E"
            ></div>
            <img
              style="width: 1133px; height: 638px; left: 552px; top: 0px; position: absolute"
              src="assets/pictures/Background.png"
            />
            <div
              style="width: 2000px; height: 622px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"
            ></div>
            <div
              style="width: 1920px; height: 698px; left: 0px; top: 393px; position: absolute; background: #FEF4DF"
            ></div>
            <div
              style="width: 1317px; height: 730px; left: 500px; top: 252px; position: absolute; background: rgba(246.42, 246.42, 246.42, 0.70); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px"
            ></div>

            <div
              style="width: 684px; height: 30px; left: 593px; top: 338px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.TITLE" | translate }}
            </div>
            <div
              style="width: 994px; height: 30px; left: 593px; top: 395px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.SUBTITLE" | translate }}
            </div>

            <div
              style="width: 118.32px; height: 40px; left: 720.35px; top: 513px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.TABLE.GUESS_NAME" | translate }}
            </div>
            <div
              style="width: 103.07px; height: 40px; left: 879.42px; top: 513px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.TABLE.GENDER" | translate }}
            </div>
            <div
              style="width: 99.18px; height: 40px; left: 577px; top: 514px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.TABLE.GUESS_ID" | translate }}
            </div>
            <div
              style="width: 99.45px; height: 40px; left: 1041.62px; top: 513px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.TABLE.BRANCH" | translate }}
            </div>
            <div
              style="width: 143.97px; height: 40px; left: 1181.32px; top: 513px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.TABLE.ROOM_CATEGORY" | translate }}
            </div>
            <div
              style="width: 157.18px; height: 40px; left: 1351.67px; top: 515px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.TABLE.REQUEST_DATE" | translate }}
            </div>
            <div
              style="width: 93.90px; height: 40px; left: 1557.04px; top: 515px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.TABLE.STATUS" | translate }}
            </div>
            <div
              style="width: 73.90px; height: 40px; left: 1668px; top: 513px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.TABLE.DETAIL" | translate }}
            </div>

            <ng-container *ngFor="let req of paginatedRequests; let i = index">
              <div
                [style.top.px]="558 + i * 33"
                style="width: 79.74px; height: 32px; left: 590.46px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word"
              >
                {{ formatId((currentPage - 1) * itemsPerPage + i + 1) }}
              </div>
              <div
                [style.top.px]="558 + i * 33"
                style="width: 168.23px; height: 32px; left: 705.36px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word"
              >
                {{ req.users?.full_name || "N/A" }}
              </div>
              <div
                [style.top.px]="558 + i * 33"
                style="width: 102.77px; height: 32px; left: 890.11px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word"
              >
                {{ req.users?.gender || "N/A" }}
              </div>
              <div
                [style.top.px]="558 + i * 33"
                style="width: 152.86px; height: 32px; left: 1015.55px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word"
              >
                {{ req.branches?.name || "N/A" }}
              </div>
              <div
                [style.top.px]="558 + i * 33"
                style="width: 143.92px; height: 32px; left: 1191.56px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word"
              >
                {{ req.preferred_room_type || "N/A" }}
              </div>
              <div
                [style.top.px]="560 + i * 33"
                style="width: 199.34px; height: 32px; left: 1340px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word"
              >
                {{ req.created_at | date: "MMM dd, yyyy - HH:mm" }}
              </div>
              <div
                [style.top.px]="559 + i * 33"
                style="width: 89px; height: 32px; left: 1569px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word"
              >
                {{ req.status | titlecase }}
              </div>
              <img
                (click)="openDetail(req)"
                [style.top.px]="567 + i * 33"
                class="hover-effect"
                src="assets/icons/Details.png"
                style="width: 14px; height: 14px; left: 1698px; position: absolute; cursor: pointer;"
              />
            </ng-container>

            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch()"
              [placeholder]="'ADMIN_RENTAL.SEARCH_PLACEHOLDER' | translate"
              style="width: 147px; height: 25.96px; left: 1402px; top: 455.50px; position: absolute; background: transparent; border: none; outline: none; color: black; font-size: 20px; font-family: Afacad; font-weight: 400;"
            />
            <div
              style="width: 246px; height: 46px; left: 1332px; top: 446px; position: absolute; background: rgba(38, 72, 147, 0); border-radius: 50px; border: 2px black solid; pointer-events: none;"
            ></div>
            <img
              src="assets/icons/Search.png"
              style="width: 24px; height: 24px; left: 1360px; top: 457px; position: absolute; pointer-events: none;"
            />

            <div
              style="width: 52px; height: 25px; left: 1650px; top: 457px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 400; word-wrap: break-word; cursor: pointer;"
            >
              {{ "ADMIN_RENTAL.FILTER" | translate }}
            </div>
            <div
              style="width: 129px; height: 46px; left: 1593px; top: 446px; position: absolute; background: rgba(38, 72, 147, 0); border-radius: 50px; border: 2px black solid; pointer-events: none;"
            ></div>
            <img
              src="assets/icons/BlackFilter.png"
              style="width: 24px; height: 24px; left: 1612px; top: 457px; position: absolute; pointer-events: none;"
            />

            <div
              style="width: 235px; height: 38px; left: 1042px; top: 870px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: row; gap: 12px; align-items: center;"
            >
              <span
                (click)="changePage(currentPage - 1)"
                [style.opacity]="currentPage === 1 ? '0.3' : '1'"
                style="color: black; font-size: 20px; font-family: Afacad; font-weight: 400; cursor: pointer;"
                >&lt;</span
              >
              <ng-container *ngFor="let page of getPages()">
                <span
                  (click)="changePage(page)"
                  [style.font-weight]="currentPage === page ? '700' : '400'"
                  style="color: black; font-size: 20px; font-family: Afacad; cursor: pointer;"
                >
                  {{ page }}
                </span>
              </ng-container>
              <span
                (click)="changePage(currentPage + 1)"
                [style.opacity]="currentPage === totalPages ? '0.3' : '1'"
                style="color: black; font-size: 20px; font-family: Afacad; font-weight: 400; cursor: pointer;"
                >&gt;</span
              >
            </div>

            <ng-container *ngTemplateOutlet="sidebarAndMenus"></ng-container>
          </div>
        </ng-container>

        <ng-container *ngIf="currentScreen === 2">
          <div
            style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden"
          >
            <div
              style="width: 1920px; height: 644px; left: 0px; top: -5px; position: absolute; background: #503D2E"
            ></div>
            <img
              style="width: 1133px; height: 638px; left: 552px; top: 0px; position: absolute"
              src="assets/pictures/Background.png"
            />
            <div
              style="width: 2000px; height: 619px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"
            ></div>
            <div
              style="width: 1920px; height: 698px; left: 0px; top: 393px; position: absolute; background: #FEF4DF"
            ></div>
            <div
              style="width: 1317px; height: 730px; left: 500px; top: 252px; position: absolute; background: rgba(246.42, 246.42, 246.42, 0.70); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px"
            ></div>

            <div
              style="width: 684px; height: 30px; left: 593px; top: 338px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.TITLE" | translate }}
            </div>
            <div
              style="width: 994px; height: 30px; left: 593px; top: 395px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.SUBTITLE" | translate }}
            </div>

            <div
              style="width: 343.17px; height: 27px; left: 595px; top: 487px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 28px; font-family: Big Shoulders Text; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.CORE_REQS" | translate }}
            </div>

            <div
              style="width: 220.81px; height: 30px; left: 595px; top: 533px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.TARGET_BRANCH" | translate }}
            </div>
            <div
              style="width: 308.75px; height: 42px; left: 824.41px; top: 527px; position: absolute; background: #D9D9D9; border-radius: 10px; display: flex; align-items: center; padding-left: 15px; font-size: 20px; font-family: Afacad;"
            >
              {{ selectedRequest?.branches?.name || "N/A" }}
            </div>

            <div
              style="width: 220.81px; height: 30px; left: 595px; top: 588px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.ROOM_CATEGORY" | translate }}
            </div>
            <div
              style="width: 308.75px; height: 42px; left: 824.41px; top: 582px; position: absolute; background: #D9D9D9; border-radius: 10px; display: flex; align-items: center; padding-left: 15px; font-size: 20px; font-family: Afacad;"
            >
              {{ selectedRequest?.preferred_room_type || "N/A" }}
            </div>

            <div
              style="width: 220.81px; height: 30px; left: 595px; top: 643px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.RENTAL_TYPE" | translate }}
            </div>
            <div
              style="width: 308.75px; height: 42px; left: 824.41px; top: 637px; position: absolute; background: #D9D9D9; border-radius: 10px; display: flex; align-items: center; padding-left: 15px; font-size: 20px; font-family: Afacad;"
            >
              {{ extractNote(selectedRequest?.note) }}
            </div>

            <div
              style="width: 220.81px; height: 30px; left: 595px; top: 698px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.MOVE_IN_DATE" | translate }}
            </div>
            <div
              style="width: 308.75px; height: 42px; left: 824.41px; top: 692px; position: absolute; background: #D9D9D9; border-radius: 10px; display: flex; align-items: center; padding-left: 15px; font-size: 20px; font-family: Afacad;"
            >
              {{ selectedRequest?.expected_move_in_date | date: "dd-MM-yyyy" }}
            </div>

            <div
              style="width: 220.81px; height: 30px; left: 595px; top: 753px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.OCCUPANCY" | translate }}
            </div>
            <div
              style="width: 308.75px; height: 42px; left: 824.41px; top: 747px; position: absolute; background: #D9D9D9; border-radius: 10px; display: flex; align-items: center; padding-left: 15px; font-size: 20px; font-family: Afacad;"
            >
              {{ selectedRequest?.people_count }}
              {{ "ADMIN_RENTAL.PROFILE.PERSONS" | translate }}
            </div>

            <div
              style="width: 233.24px; height: 27px; left: 1183.83px; top: 487px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 28px; font-family: Big Shoulders Text; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.CONTACT_INFO" | translate }}
            </div>

            <div
              style="width: 220.81px; height: 30px; left: 1183.83px; top: 533px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.FULL_NAME" | translate }}
            </div>
            <div
              style="width: 308.75px; height: 42px; left: 1413.25px; top: 527px; position: absolute; background: #D9D9D9; border-radius: 10px; display: flex; align-items: center; padding-left: 15px; font-size: 20px; font-family: Afacad;"
            >
              {{ selectedRequest?.users?.full_name || "N/A" }}
            </div>

            <div
              style="width: 220.81px; height: 30px; left: 1183.83px; top: 588px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.GENDER" | translate }}
            </div>
            <div
              style="width: 308.75px; height: 42px; left: 1413.25px; top: 582px; position: absolute; background: #D9D9D9; border-radius: 10px; display: flex; align-items: center; padding-left: 15px; font-size: 20px; font-family: Afacad;"
            >
              {{ selectedRequest?.users?.gender || "N/A" }}
            </div>

            <div
              style="width: 220.81px; height: 30px; left: 1183.83px; top: 643px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.PHONE" | translate }}
            </div>
            <div
              style="width: 308.75px; height: 42px; left: 1413.25px; top: 637px; position: absolute; background: #D9D9D9; border-radius: 10px; display: flex; align-items: center; padding-left: 15px; font-size: 20px; font-family: Afacad;"
            >
              {{ selectedRequest?.users?.phone_number || "N/A" }}
            </div>

            <div
              style="width: 220.81px; height: 30px; left: 1183.83px; top: 698px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.EMAIL" | translate }}
            </div>
            <div
              style="width: 308.75px; height: 42px; left: 1413.25px; top: 692px; position: absolute; background: #D9D9D9; border-radius: 10px; display: flex; align-items: center; padding-left: 15px; font-size: 20px; font-family: Afacad;"
            >
              {{ selectedRequest?.users?.email || "N/A" }}
            </div>

            <div
              style="width: 220.81px; height: 30px; left: 1183.83px; top: 753px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.PROFILE.ID_NUMBER" | translate }}
            </div>
            <div
              style="width: 308.75px; height: 42px; left: 1413.25px; top: 747px; position: absolute; background: #D9D9D9; border-radius: 10px; display: flex; align-items: center; padding-left: 15px; font-size: 20px; font-family: Afacad;"
            >
              {{ selectedRequest?.users?.identity_number || "N/A" }}
            </div>

            <div
              (click)="currentScreen = 1"
              class="hover-effect"
              style="width: 198.87px; height: 70px; left: 576px; top: 835px; position: absolute; border-radius: 40px; border: 3px #264893 solid; cursor: pointer;"
            ></div>
            <div
              style="width: 180.37px; height: 54px; left: 585.25px; top: 843px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 28px; font-family: Afacad; font-weight: 600; pointer-events: none;"
            >
              {{ "ADMIN_RENTAL.PROFILE.RETURN" | translate }}
            </div>

            <div
              (click)="goToVerification()"
              class="hover-effect"
              style="width: 266px; height: 70px; left: 1454px; top: 835px; position: absolute; background: #264893; border-radius: 40px; cursor: pointer;"
            ></div>
            <div
              style="width: 266px; height: 54px; left: 1454px; top: 843px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; pointer-events: none;"
            >
              {{ "ADMIN_RENTAL.PROFILE.REVIEW_QUALIFY" | translate }}
            </div>

            <ng-container *ngTemplateOutlet="sidebarAndMenus"></ng-container>
          </div>
        </ng-container>

        <ng-container *ngIf="currentScreen === 3">
          <div
            style="width: 1920px; height: 1080px; position: relative; background: #FEF4DF; overflow: hidden"
          >
            <div
              style="width: 1920px; height: 644px; left: 0px; top: -5px; position: absolute; background: #503D2E"
            ></div>
            <img
              style="width: 1133px; height: 638px; left: 552px; top: 0px; position: absolute"
              src="assets/pictures/Background.png"
            />
            <div
              style="width: 2000px; height: 619px; left: -40px; top: -226px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0.10) 0%, #FEF4DF 100%)"
            ></div>
            <div
              style="width: 1920px; height: 698px; left: 0px; top: 393px; position: absolute; background: #FEF4DF"
            ></div>
            <div
              style="width: 1317px; height: 730px; left: 500px; top: 252px; position: absolute; background: rgba(246.42, 246.42, 246.42, 0.70); box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 25px"
            ></div>

            <div
              style="width: 684px; height: 30px; left: 593px; top: 338px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 48px; font-family: Big Shoulders Text; font-weight: 900; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.VERIFICATION.TITLE" | translate }}
            </div>
            <div
              style="width: 994px; height: 30px; left: 593px; top: 395px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 24px; font-family: Big Shoulders Text; font-weight: 600; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.VERIFICATION.SUBTITLE" | translate }}
            </div>

            <div
              style="width: 343.17px; height: 27px; left: 688px; top: 483px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 28px; font-family: Big Shoulders Text; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.VERIFICATION.CHECKLIST_TITLE" | translate }}
            </div>

            <div
              style="width: 656px; height: 30px; left: 791px; top: 521px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.VERIFICATION.CHECK_1" | translate }}
            </div>
            <div
              (click)="check1 = !check1"
              style="width: 20px; height: 20px; left: 751px; top: 526px; position: absolute; cursor: pointer;"
            >
              <div
                [style.background]="check1 ? '#264893' : '#D9D9D9'"
                style="width: 20px; height: 20px; left: 0px; top: 0px; position: absolute; border-radius: 5px; transition: 0.2s;"
              ></div>
            </div>

            <div
              style="width: 656px; height: 30px; left: 791px; top: 555px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.VERIFICATION.CHECK_2" | translate }}
            </div>
            <div
              (click)="check2 = !check2"
              style="width: 20px; height: 20px; left: 751px; top: 560px; position: absolute; cursor: pointer;"
            >
              <div
                [style.background]="check2 ? '#264893' : '#D9D9D9'"
                style="width: 20px; height: 20px; left: 0px; top: 0px; position: absolute; border-radius: 5px; transition: 0.2s;"
              ></div>
            </div>

            <div
              style="width: 656px; height: 30px; left: 791px; top: 589px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.VERIFICATION.CHECK_3" | translate }}
            </div>
            <div
              (click)="check3 = !check3"
              style="width: 20px; height: 20px; left: 751px; top: 594px; position: absolute; cursor: pointer;"
            >
              <div
                [style.background]="check3 ? '#264893' : '#D9D9D9'"
                style="width: 20px; height: 20px; left: 0px; top: 0px; position: absolute; border-radius: 5px; transition: 0.2s;"
              ></div>
            </div>

            <div
              style="width: 343.17px; height: 27px; left: 688px; top: 646px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 28px; font-family: Big Shoulders Text; font-weight: 700; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.VERIFICATION.RESULTS_TITLE" | translate }}
            </div>
            <div
              style="width: 152px; height: 30px; left: 751px; top: 713px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: black; font-size: 20px; font-family: Afacad; font-weight: 500; word-wrap: break-word"
            >
              {{ "ADMIN_RENTAL.VERIFICATION.REVIEWER_NOTE" | translate }}
            </div>

            <textarea
              [(ngModel)]="reviewerNote"
              [placeholder]="
                'ADMIN_RENTAL.VERIFICATION.NOTE_PLACEHOLDER' | translate
              "
              style="width: 726px; height: 100px; left: 903px; top: 677px; position: absolute; background: #D9D9D9; border-radius: 10px; border: none; outline: none; padding: 15px; font-family: Afacad; font-size: 18px; resize: none;"
            ></textarea>

            <div
              (click)="updateStatus('reviewing')"
              class="hover-effect"
              style="width: 266px; height: 70px; left: 876px; top: 835px; position: absolute; background: #264893; border-radius: 40px; cursor: pointer;"
            ></div>
            <div
              style="width: 266px; height: 54px; left: 876px; top: 843px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; pointer-events: none;"
            >
              {{ "ADMIN_RENTAL.VERIFICATION.REQ_MORE_INFO" | translate }}
            </div>

            <div
              (click)="updateStatus('rejected')"
              class="hover-effect"
              style="width: 266px; height: 70px; left: 1165px; top: 835px; position: absolute; background: #D32F2F; border-radius: 40px; cursor: pointer;"
            ></div>
            <div
              style="width: 266px; height: 54px; left: 1165px; top: 843px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; pointer-events: none;"
            >
              {{ "ADMIN_RENTAL.VERIFICATION.REJECT_LEAD" | translate }}
            </div>

            <div
              (click)="updateStatus('viewing_scheduled')"
              [style.pointer-events]="
                check1 && check2 && check3 ? 'auto' : 'none'
              "
              [style.opacity]="check1 && check2 && check3 ? '1' : '0.5'"
              class="hover-effect"
              style="width: 266px; height: 70px; left: 1454px; top: 835px; position: absolute; background: #2E7D32; border-radius: 40px; cursor: pointer;"
            ></div>
            <div
              style="width: 266px; height: 54px; left: 1454px; top: 843px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 28px; font-family: Afacad; font-weight: 600; pointer-events: none;"
            >
              {{ "ADMIN_RENTAL.VERIFICATION.APPROVE_PROCEED" | translate }}
            </div>

            <div
              (click)="currentScreen = 2"
              style="position: absolute; top: 275px; left: 540px; cursor: pointer; color: #264893; font-size: 32px; font-family: Afacad; font-weight: bold;"
            >
              {{ "ADMIN_RENTAL.PROFILE.BACK" | translate }}
            </div>

            <ng-container *ngTemplateOutlet="sidebarAndMenus"></ng-container>
          </div>
        </ng-container>

        <ng-template #sidebarAndMenus>
          <div
            (click)="navigate('/guidelines')"
            style="width: 152px; height: 53px; left: 1238px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;"
          >
            {{ "COMMON.GUIDELINES" | translate }}
          </div>
          <div
            (click)="navigate('/about')"
            style="width: 126px; height: 53px; left: 1071px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;"
          >
            {{ "COMMON.ABOUT_US" | translate }}
          </div>
          <div
            (click)="navigate('/contact')"
            style="width: 135px; height: 53px; left: 1431px; top: 110px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 600; word-wrap: break-word; cursor: pointer;"
          >
            {{ "COMMON.CONTACT" | translate }}
          </div>

          <img
            (click)="toggleLangMenu()"
            style="width: 75px; height: 75px; left: 1620px; top: 95px; position: absolute; cursor: pointer; z-index: 50;"
            src="assets/icons/Globe.png"
          />
          <div
            *ngIf="isLangMenuOpen"
            style="position: absolute; left: 1550px; top: 180px; width: 192px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;"
          >
            <div
              (click)="changeLang('en')"
              style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;"
            >
              {{ "COMMON.ENGLISH" | translate }}
            </div>
            <div
              (click)="changeLang('vi')"
              style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;"
            >
              {{ "COMMON.VIETNAMESE" | translate }}
            </div>
          </div>

          <img
            (click)="toggleUserMenu()"
            style="width: 70px; height: 70px; left: 1750px; top: 100px; position: absolute; cursor: pointer; z-index: 50;"
            src="assets/icons/Account.png"
          />
          <div
            *ngIf="isUserMenuOpen"
            style="position: absolute; left: 1680px; top: 180px; width: 150px; background: white; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; padding: 8px 0; z-index: 100;"
          >
            <div
              (mousedown)="logout()"
              style="padding: 8px 16px; font-family: Afacad; font-style: italic; color: #264893; font-size: 24px; cursor: pointer;"
            >
              {{ "COMMON.LOGOUT" | translate }}
            </div>
          </div>

          <img
            style="width: 405px; height: 1080px; left: 0px; top: 0px; position: absolute;"
            src="assets/pictures/Union 1.png"
          />
          <img
            (click)="navigate('/')"
            style="width: 185px; height: 165px; left: 107px; top: 81px; position: absolute; cursor: pointer;"
            src="assets/icons/BookingLogo.png"
          />

          <div
            (click)="navigate('/admin/rental-requests')"
            style="cursor: pointer; width: 196px; height: 54.75px; left: 166px; top: 331px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word"
          >
            {{ "ADMIN_RENTAL.SIDEBAR.INQUIRIES" | translate }}
          </div>
          <img
            (click)="navigate('/admin/rental-requests')"
            src="assets/icons/Inquiries.png"
            style="cursor: pointer; width: 32px; height: 29px; left: 107px; top: 344px; position: absolute;"
          />

          <div
            (click)="navigate('/admin/schedules-management')"
            style="cursor: pointer; width: 126px; height: 54.75px; left: 166px; top: 417.54px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word"
          >
            {{ "ADMIN_RENTAL.SIDEBAR.SCHEDULES" | translate }}
          </div>
          <img
            (click)="navigate('/admin/schedules-management')"
            src="assets/icons/Schedules.png"
            style="cursor: pointer; width: 40px; height: 35px; left: 107px; top: 427px; position: absolute;"
          />

          <div
            (click)="navigate('/admin/rooms-management')"
            style="cursor: pointer; width: 195px; height: 54.75px; left: 161px; top: 504.07px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word"
          >
            {{ "ADMIN_RENTAL.SIDEBAR.ROOMS" | translate }}
          </div>
          <img
            (click)="navigate('/admin/rooms-management')"
            src="assets/icons/Rooms.png"
            style="cursor: pointer; width: 36px; height: 32px; left: 107px; top: 515px; position: absolute;"
          />

          <div
            (click)="navigate('/admin/payments')"
            style="cursor: pointer; width: 175px; height: 54.75px; left: 166px; top: 589.72px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word"
          >
            {{ "ADMIN_RENTAL.SIDEBAR.RESERVATIONS" | translate }}
          </div>
          <img
            (click)="navigate('/admin/payments')"
            src="assets/icons/Reservation.png"
            style="cursor: pointer; width: 30px; height: 30px; left: 107px; top: 600px; position: absolute;"
          />

          <div
            (click)="navigate('/admin/contracts')"
            style="cursor: pointer; width: 168px; height: 54.75px; left: 163px; top: 676.25px; position: absolute; justify-content: center; display: flex; flex-direction: column; color: #FEF4DF; font-size: 32px; font-family: Afacad; font-weight: 500; word-wrap: break-word"
          >
            {{ "ADMIN_RENTAL.SIDEBAR.CONTRACTS" | translate }}
          </div>
          <img
            (click)="navigate('/admin/contracts')"
            src="assets/icons/Contract.png"
            style="cursor: pointer; width: 38px; height: 38px; left: 107px; top: 684px; position: absolute;"
          />

          <div
            style="width: 400px; height: 209px; left: 0px; top: 870px; position: absolute; text-align: center"
          >
            <span
              style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word"
              >{{ "CONTACT_INFO.TITLE" | translate }}<br /><br
            /></span>
            <span
              style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word"
              >{{ "CONTACT_INFO.HEADQUARTERS" | translate }} </span
            ><span
              style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word"
              >{{ "CONTACT_INFO.ADDRESS_1" | translate }}<br />{{
                "CONTACT_INFO.ADDRESS_2" | translate
              }}<br
            /></span>
            <span
              style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word"
              >{{ "CONTACT_INFO.PHONE_LABEL" | translate }} </span
            ><span
              style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word"
              >{{ "CONTACT_INFO.PHONE" | translate }}<br
            /></span>
            <span
              style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word"
              >{{ "CONTACT_INFO.EMAIL_LABEL" | translate }}</span
            ><span
              style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word"
              >{{ "CONTACT_INFO.EMAIL" | translate }}<br
            /></span>
            <span
              style="color: white; font-size: 15px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word"
              >{{ "CONTACT_INFO.HOURS_LABEL" | translate }}</span
            ><span
              style="color: white; font-size: 15px; font-family: Afacad; font-weight: 400; word-wrap: break-word"
              >{{ "CONTACT_INFO.HOURS" | translate }}</span
            >
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class RentalRequestsComponent implements OnInit {
  currentScreen = 1;
  authService = inject(AuthService);
  isAuthenticated = false;
  isLoading = false;
  scaleFactor = 1;
  // Data State
  requests: StaffRentalRequestResponse[] = [];
  filteredRequests: StaffRentalRequestResponse[] = [];
  paginatedRequests: StaffRentalRequestResponse[] = [];
  selectedRequest: StaffRentalRequestResponse | null = null;
  searchQuery: string = "";

  // LOGIC PHÂN TRANG THỰC TẾ
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  // Verification UI State
  check1 = false;
  check2 = false;
  check3 = false;
  reviewerNote = "";

  // Menu State
  isLangMenuOpen = false;
  isUserMenuOpen = false;

  constructor(
    private router: Router,
    private rentalService: RentalRequestService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {
    this.translate.addLangs(["en", "vi"]);
    this.translate.setDefaultLang("vi");
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|vi/) ? browserLang : "vi");
  }

  @HostListener("window:resize")
  onResize() {
    this.scaleFactor = window.innerWidth / 1920;
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.onResize();
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.rentalService.getAllRentalRequests().subscribe({
      next: (res) => {
        this.requests = res.data || [];
        this.isLoading = false;
        this.onSearch(); // Triggers change detection
      },
      error: (err) => {
        console.error("Failed to load requests from API:", err);
        window.alert("Lỗi: " + (err.error?.message || err.message));
        this.requests = [];
        this.isLoading = false;
        this.onSearch(); // Triggers change detection
      },
    });
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase();
    this.filteredRequests = this.requests.filter(
      (req) =>
        req.users?.full_name?.toLowerCase().includes(q) ||
        req.branches?.name?.toLowerCase().includes(q) ||
        req.preferred_room_type?.toLowerCase().includes(q),
    );

    // Tính toán số trang thực tế
    this.totalPages =
      Math.ceil(this.filteredRequests.length / this.itemsPerPage) || 1;
    this.currentPage = 1;
    this.updatePagination();
  }

  // --- HÀM XỬ LÝ PHÂN TRANG ---
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedRequests = this.filteredRequests.slice(
      startIndex,
      startIndex + this.itemsPerPage,
    );
    this.cdr.detectChanges();
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  // -----------------------------

  extractNote(fullNote: string | undefined): string {
    if (!fullNote) return "N/A";
    const noteParts = fullNote.split("| Notes:");
    return noteParts.length > 1 ? noteParts[1].trim() : fullNote;
  }

  formatId(index: number): string {
    return index.toString().padStart(3, "0");
  }

  openDetail(req: StaffRentalRequestResponse) {
    this.selectedRequest = req;
    this.currentScreen = 2;
  }

  goToVerification() {
    this.currentScreen = 3;
  }

  updateStatus(newStatus: string) {
    if (!this.selectedRequest) return;
    const payload: UpdateRentalStatusPayload = { status: newStatus };
    this.isLoading = true;

    this.rentalService
      .updateRentalRequestStatus(this.selectedRequest.id, payload)
      .subscribe({
        next: () => {
          window.alert(`Cập nhật thành công: ${newStatus}`);
          this.loadRequests();
          this.currentScreen = 1;
          this.check1 = this.check2 = this.check3 = false;
          this.reviewerNote = "";
          this.isLoading = false;
        },
        error: (err) => {
          window.alert(
            "Lỗi cập nhật API: " + (err.error?.message || err.message),
          );
          this.isLoading = false;
        },
      });
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
  }

  navigate(path: string) {
    this.router.navigate([path]);
    this.isUserMenuOpen = false;
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/login"]);
    });
  }
}
