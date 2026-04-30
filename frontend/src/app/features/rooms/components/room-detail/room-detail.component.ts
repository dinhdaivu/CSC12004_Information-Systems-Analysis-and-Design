import { Component, OnInit, OnDestroy, HostListener, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedFacility, RoomData, RoomType, BranchDetail } from '../../../../shared/models/branch.model';
import { BranchService } from '../../../../core/services/branch.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="relative w-full overflow-hidden bg-white" [style.height.px]="4913 * scaleFactor" *ngIf="!isLoading && branchDetail; else loadingOrError">
      
      <div class="absolute top-0 left-0 origin-top-left w-[1920px] h-[4913px]" [style.transform]="'scale(' + scaleFactor + ')'">
        
        <img style="width: 1920px; height: 1080px; left: 0px; top: -225px; position: absolute; object-fit: cover;" [src]="getSafeUrl(branchDetail.heroImage)" (error)="onImageError($event, 'assets/pictures/Homepage Tô Hiến Thành.png')" />
        
        <div style="width: 505px; height: 2106px; left: -93px; top: 384px; position: absolute; transform: rotate(-90deg); transform-origin: top left; background: linear-gradient(270deg, rgba(0, 0, 0, 0.80) 0%, rgba(0, 0, 0, 0) 100%);"></div>
        <div style="width: 2000px; height: 1593px; left: -53px; top: -938px; position: absolute; background: linear-gradient(180deg, rgba(254, 244, 223, 0) 0%, #FEF4DF 100%);"></div>
        <div style="width: 2096px; height: 5075px; left: -83px; top: 655px; position: absolute; background: #FEF4DF;"></div>
        
        <div style="width: 1920px; height: 400px; left: 0px; top: 4513px; position: absolute; background: #264893;"></div>
        <div style="left: 263px; top: 4763px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column;">
          <span style="color: #FEF4DF; font-size: 28px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word;">{{ 'ROOM_DETAIL.FOOTER_SLOGAN' | translate }}<br/></span>
          <span style="color: #FEF4DF; font-size: 20px; font-family: Afacad; font-style: italic; font-weight: 400; word-wrap: break-word;"><br/>{{ 'ROOM_DETAIL.FOOTER_COPYRIGHT' | translate }}</span>
        </div>
        <img style="width: 200px; height: 178px; left: 406px; top: 4572px; position: absolute; object-fit: contain;" src="assets/icons/FooterLogo.png" (error)="onImageError($event, 'assets/icons/Logo.png')" />
        
        <div style="width: 684px; height: 209px; left: 1047px; top: 4608px; position: absolute;">
          <span style="color: white; font-size: 40px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word;">{{ 'ROOM_DETAIL.CONTACT_INFO' | translate }}<br/></span>
          <span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word;"><br/>{{ 'ROOM_DETAIL.HEADQUARTERS' | translate }}: </span>
          <span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word;">
            {{ 'ROOM_DETAIL.ADDRESS_FOOTER' | translate }}<br/>
          </span>

          <span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word;">{{ 'ROOM_DETAIL.PHONE' | translate }}: </span>
          <span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word;">(08) 18.276.266.<br/></span>
          <span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word;">{{ 'ROOM_DETAIL.EMAIL' | translate }}:</span>
          <span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word;"> contact@homestaydorm.vn<br/></span>
          <span style="color: white; font-size: 24px; font-family: Afacad; font-style: italic; font-weight: 700; word-wrap: break-word;">{{ 'ROOM_DETAIL.OFFICE_HOURS' | translate }}:</span>
          <span style="color: white; font-size: 24px; font-family: Afacad; font-weight: 400; word-wrap: break-word;">
            {{ 'ROOM_DETAIL.OFFICE_TIME' | translate }}
          </span>
        </div>
        
        <div (click)="onContactAction()" class="hover-scale" style="cursor: pointer; width: 480px; height: 135px; left: 720px; top: 4153px; position: absolute; background: #264893; box-shadow: 5px 5px 50px 5px rgba(0, 0, 0, 0.25); border-radius: 100px;"></div>
        <div (click)="onContactAction()" class="hover-scale" style="cursor: pointer; width: 393px; height: 46px; left: 763px; top: 4198px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: white; font-size: 48px; font-family: Afacad; font-weight: 600; pointer-events: none;">{{ 'ROOM_DETAIL.CONTACT_US' | translate }}</div>
        
        <div style="
          width: 1500px;
          left: 210px;
          top: 3448px;
          position: absolute;
          color: #264893;
          font-family: Afacad;
          font-size: 32px;
          line-height: 1.8;
        ">
          <div style="margin-bottom: 20px;">
            {{ 'ROOM_DETAIL.POLICY_INTRO' | translate }}
          </div>
          <ul style="padding-left: 30px; list-style-type: disc;">
            <li>
              <span style="font-weight:700;">{{ 'ROOM_DETAIL.POLICY_RENT' | translate }}:</span>
              {{ 'ROOM_DETAIL.POLICY_RENT_DESC' | translate }}
            </li>
            <li>
              <span style="font-weight:700;">{{ 'ROOM_DETAIL.POLICY_DEPOSIT' | translate }}:</span>
              {{ 'ROOM_DETAIL.POLICY_DEPOSIT_DESC' | translate }}
            </li>
            <li>
              <span style="font-weight:700;">{{ 'ROOM_DETAIL.POLICY_CONFIRM' | translate }}:</span>
              {{ 'ROOM_DETAIL.POLICY_CONFIRM_DESC' | translate }}
            </li>
            <li>
              <span style="font-weight:700;">{{ 'ROOM_DETAIL.POLICY_REFUND' | translate }}:</span>
              <ul style="margin-top:10px; padding-left: 30px; list-style-type: disc;">
                <li>{{ 'ROOM_DETAIL.POLICY_REFUND_100' | translate }}</li>
                <li>{{ 'ROOM_DETAIL.POLICY_REFUND_70' | translate }}</li>
                <li>{{ 'ROOM_DETAIL.POLICY_REFUND_50' | translate }}</li>
                <li>{{ 'ROOM_DETAIL.POLICY_REFUND_80' | translate }}</li>
              </ul>
            </li>
          </ul>
        </div>
        
        <div style="width: 1500px; left: 210px; top: 2523px; position: absolute;">
          
            <div style="
              position: relative;
              display: flex;
              gap: 30px;
              padding-left: 40px;
              z-index: 2;
            ">
              <div (click)="setRoomType('twin')"
                  [style.background]="activeRoomType === 'twin' ? '#EDEBE7' : '#D9D9D9'"
                  [style.transform]="activeRoomType === 'twin' ? 'translateY(10px)' : 'translateY(0)'"
                  style="
                    padding: 22px 50px;
                    border-radius: 25px 25px 0 0;
                    font-family: 'Big Shoulders Text';
                    font-size: 28px;
                    font-weight: 800;
                    color: #264893;
                    cursor: pointer;
                    box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                  ">
                {{ 'ROOM_DETAIL.TWIN_ROOM' | translate }}
              </div>

              <div (click)="setRoomType('quad')"
                  [style.background]="activeRoomType === 'quad' ?  '#EDEBE7' : '#D9D9D9'"
                  [style.transform]="activeRoomType === 'quad' ? 'translateY(10px)' : 'translateY(0)'"
                  style="
                    padding: 22px 50px;
                    border-radius: 25px 25px 0 0;
                    font-family: 'Big Shoulders Text';
                    font-size: 28px;
                    font-weight: 800;
                    color: #264893;
                    cursor: pointer;
                    box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                  ">
                {{ 'ROOM_DETAIL.QUAD_ROOM' | translate }}
              </div>
            </div>

            <div style="
              margin-top: 0px;
              background: #EDEBE7;
              border-radius: 30px;
              padding: 50px;
              display: flex;
              gap: 40px;
              align-items: center;
              box-shadow: 0 20px 50px rgba(0,0,0,0.15);
              position: relative;
              z-index: 1;
            ">
              <div style="width:700px;">
                <img class="fade-content" [class.is-fading]="isTransitioning"
                  [src]="getSafeUrl(roomData[activeRoomType].images[activeRoomIndex])"
                  (error)="onImageError($event, 'https://placehold.co/700x400/D9D9D9/264893?text=Room+Image')"
                  style="width:100%; height:400px; object-fit:cover; border-radius:20px;" 
                />
                <div style="display:flex; justify-content:center; gap:16px; margin-top:20px;">
                  <div *ngFor="let img of roomData[activeRoomType].images; let i = index"
                      (click)="setRoomIndex(i)" class="hover-scale"
                      [style.background]="i === activeRoomIndex ? '#264893' : '#9CA3AF'"
                      style="width:16px; height:16px; border-radius:50%; cursor:pointer; transition: background 0.3s;">
                  </div>
                </div>
              </div>

              <div class="fade-content" [class.is-fading]="isTransitioning" style="flex:1; font-size:28px; line-height:1.6; font-family: Afacad;">
                <div style="margin-bottom:20px;">
                  <span style="font-weight:700; font-style:italic;">{{ 'ROOM_DETAIL.CAPACITY' | translate }} </span>
                  <span> {{ roomData[activeRoomType].capacity | translate }}</span>
                </div>
                <div>
                  <span style="font-weight:700; font-style:italic;">{{ 'ROOM_DETAIL.AMENITIES' | translate }} </span>
                  <span> {{ roomData[activeRoomType].amenities | translate }}</span>
                </div>
              </div>
            </div>
          </div>
        
        <div style="width: 557px; left: 270px; top: 2401px; position: absolute; color: #264893; font-size: 48px; font-family: Afacad; font-weight: 700;">{{ 'ROOM_DETAIL.ROOM_FACILITIES_TITLE' | translate }}</div>
        <div style="width: 40px; height: 80px; left: 210px; top: 2393px; position: absolute; background: #264893; border-radius: 10px;"></div>

        <div style="width: 1500px; height: 1100px; left: 204px; top: 1170px; position: absolute;">
          <div style="width: 1500px; height: 1000px; left: 0px; top: 0px; position: absolute; background: #F9F6EF; box-shadow: 5px 5px 50px rgba(0, 0, 0, 0.25); border-radius: 20px;"></div>
          
          <img class="fade-content" [class.is-fading]="isTransitioning"
              style="width: 1300px; height: 641px; left: 100px; top: 261px; position: absolute; border-radius: 20px; object-fit: cover;" 
              [src]="getSafeUrl(sharedFacilitiesList[activeSharedIndex]?.image)" 
              (error)="onImageError($event, 'https://placehold.co/1300x641')" />
          
          <div style="position: absolute; top: 887px; left: 0; width: 100%; display: flex; justify-content: center; gap: 24px; z-index: 10;">
            <div *ngFor="let item of sharedFacilitiesList; let i = index" 
                (click)="setSharedIndex(i)" class="hover-scale"
                [style.background]="i === activeSharedIndex ? '#264893' : 'rgba(38, 72, 147, 0.50)'"
                style="width: 24px; height: 24px; border-radius: 50%; cursor: pointer; transition: background 0.3s;">
            </div>
          </div>
          
          <div class="fade-content" [class.is-fading]="isTransitioning" style="width: 1288px; height: 90px; left: 106px; top: 51px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 80px; font-family: 'Big Shoulders Text'; font-weight: 800; text-transform: uppercase;">
            {{ sharedFacilitiesList[activeSharedIndex]?.title | translate }}
          </div>
          <div class="fade-content" [class.is-fading]="isTransitioning" style="width: 1288px; height: 42px; left: 122px; top: 163px; position: absolute; text-align: center; justify-content: center; display: flex; flex-direction: column; color: #264893; font-size: 32px; font-family: Afacad; font-style: italic; font-weight: 400;">
            {{ sharedFacilitiesList[activeSharedIndex]?.desc | translate }}
          </div>
        </div>
        
        <div style="width: 557px; left: 264px; top: 1048px; position: absolute; color: #264893; font-size: 48px; font-family: Afacad; font-weight: 700;">{{ 'ROOM_DETAIL.SHARED_COMMUNITY_TITLE' | translate }}</div>
        <div style="width: 40px; height: 80px; left: 204px; top: 1040px; position: absolute; background: #264893; border-radius: 10px;"></div>
        
        <div style="left: 0px; width: 1920px; top: 384px; position: absolute; text-align: center; color: #264893; font-size: 96px; font-family: 'Big Shoulders Text'; font-weight: 900; text-transform: uppercase;">
          {{ 'ROOM_DETAIL.BRANCH_TITLE' | translate:{ name: branchDetail.name } }}
        </div>
        
        <div style="left: 0px; width: 1920px; top: 550px; position: absolute; text-align: center; color: #264893; font-size: 56px; font-family: 'Big Shoulders Text'; font-weight: 700;">  
          {{ ('ROOM_DETAIL.ADDRESS_' + branchDetail.id) | translate }}
        </div>

        <div style="width: 1414px; left: 253px; top: 672px; position: absolute; text-align: center; color: #264893; font-size: 36px; font-family: Afacad; font-style: italic; font-weight: 400;">
          {{ ('ROOM_DETAIL.DESC_' + branchDetail.id) | translate }}
        </div>

        <div class="hover-text" style="width: 152px; left: 1243px; top: 100px; position: absolute; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; cursor: pointer; z-index: 10;">{{ 'NAV.GUIDELINES' | translate }}</div>
        <div class="hover-text" style="width: 126px; left: 1076px; top: 100px; position: absolute; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; cursor: pointer; z-index: 10;">{{ 'NAV.ABOUT_US' | translate }}</div>
        <div class="hover-text" style="width: 135px; left: 1436px; top: 100px; position: absolute; color: white; font-size: 32px; font-family: Afacad; font-weight: 600; cursor: pointer; z-index: 10;">{{ 'NAV.CONTACT' | translate }}</div>
        
        <div (click)="toggleLangMenu()" tabindex="0" (blur)="closeMenusDelay()" class="hover-scale" style="width: 75px; height: 75px; left: 1625px; top: 85px; position: absolute; cursor: pointer; outline: none; z-index: 60;">
          <img style="width: 100%; height: 100%; border-radius: 50%;" src="assets/icons/earth.png" (error)="onImageError($event, 'https://placehold.co/75x75/000/FFF?text=EN/VI')"/>
        </div>
        <div *ngIf="isLangMenuOpen" class="glass-menu animate-fade-in" style="position: absolute; left: 1560px; top: 170px; width: 200px; z-index: 61;">
          <div (mousedown)="changeLang('vi')" class="menu-item">{{ 'COMMON.VIETNAMESE' | translate }}</div>
          <div style="height: 1px; background: rgba(255, 255, 255, 0.2); margin: 5px 15px;"></div>
          <div (mousedown)="changeLang('en')" class="menu-item">{{ 'COMMON.ENGLISH' | translate }}</div>
        </div>

        <div (click)="toggleUserMenu()" tabindex="0" (blur)="closeMenusDelay()" class="hover-scale" style="width: 70px; height: 70px; left: 1755px; top: 90px; position: absolute; cursor: pointer; outline: none; z-index: 60;">
          <img style="width: 100%; height: 100%; border-radius: 50%; border: 3px solid white;" src="assets/icons/User.png" (error)="onImageError($event, 'https://placehold.co/70x70/000/FFF?text=U')"/>
        </div>
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
        
        <img (click)="goHome()" class="hover-scale" style="width: 185px; height: 165px; left: 105px; top: 90px; position: absolute; object-fit: contain; cursor: pointer; z-index: 60;" src="assets/icons/Logo.png" (error)="onImageError($event, 'https://placehold.co/185x165/FFF/000?text=Logo')" />
        
      </div>
    </div>

    <ng-template #loadingOrError>
      <div class="loading-state">
        <h2 *ngIf="isLoading" style="color: #264893; font-size: 24px;">{{ 'COMMON.LOADING' | translate }}</h2>
        <div *ngIf="errorMessage" style="text-align: center;">
          <h2 style="color: red; font-size: 24px; margin-bottom: 10px;">{{ errorMessage | translate }}</h2>
          <button (click)="retryFetch()" style="padding: 10px 20px; background: #264893; color: white; border-radius: 8px; cursor: pointer;">{{ 'COMMON.RETRY' | translate }}</button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .loading-state { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background: #FEF4DF; font-family: Afacad, sans-serif; flex-direction: column; }

    .hover-scale { transition: transform 0.2s ease; }
    .hover-scale:hover { transform: scale(1.05); }
    .hover-text { transition: color 0.2s ease; }
    .hover-text:hover { color: #d1d5db; }
    
    .fade-content { transition: opacity 0.3s ease-in-out; opacity: 1; }
    .is-fading { opacity: 0.3; }

    .glass-menu { background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px); border-radius: 25px; border: 1px solid rgba(255,255,255,0.3); padding: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .menu-item { color: white; font-size: 26px; font-family: Afacad; font-style: italic; cursor: pointer; text-align: center; padding: 10px 0; transition: background 0.3s; border-radius: 15px; }
    .menu-item:hover { background: rgba(255, 255, 255, 0.2); }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RoomDetailComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private branchService = inject(BranchService);
  private cdr = inject(ChangeDetectorRef);

  scaleFactor = 1;
  branchDetail: BranchDetail | null = null;
  isLoading = true;
  errorMessage = '';

  isTransitioning = false; 
  isLangMenuOpen = false;
  isUserMenuOpen = false;
  isAuthenticated = false;

  activeSharedIndex = 0;
  activeRoomType: RoomType = 'twin';
  activeRoomIndex = 0;
  
  private autoPlayTimer: number | undefined;

  // Giữ lại khung mảng dữ liệu với Key dịch thuật để đảm bảo cấu trúc HTML render không lỗi
  // Khi API load xong, data này sẽ bị thay thế bằng data từ API
  sharedFacilitiesList: SharedFacility[] = [
    { image: 'assets/pictures/Dining1.png', title: 'ROOM_DETAIL.DINING_HALL', desc: 'ROOM_DETAIL.DINING_DESC' },
    { image: 'assets/pictures/Dining2.png', title: 'ROOM_DETAIL.DINING_HALL', desc: 'ROOM_DETAIL.DINING_DESC' },
    { image: 'assets/pictures/Living1.png', title: 'ROOM_DETAIL.LIVING_LOUNGE', desc: 'ROOM_DETAIL.LIVING_DESC' },
    { image: 'assets/pictures/Living2.png', title: 'ROOM_DETAIL.LIVING_LOUNGE', desc: 'ROOM_DETAIL.LIVING_DESC' },
    { image: 'assets/pictures/Laundry1.png', title: 'ROOM_DETAIL.LAUNDRY_ZONE', desc: 'ROOM_DETAIL.LAUNDRY_DESC' },
    { image: 'assets/pictures/Laundry2.png', title: 'ROOM_DETAIL.LAUNDRY_ZONE', desc: 'ROOM_DETAIL.LAUNDRY_DESC' },
  ];

  roomData: Record<RoomType, RoomData> = {
    twin: {
      name: 'ROOM_DETAIL.TWIN_ROOM',
      capacity: 'ROOM_DETAIL.TWIN_CAPACITY',
      amenities: 'ROOM_DETAIL.TWIN_AMENITIES',
      images: [
        'assets/pictures/twin1.png', 
        'assets/pictures/twin2.png', 
        'assets/pictures/twin3.png', 
        'assets/pictures/twin4.png'
      ]
    },
    quad: {
      name: 'ROOM_DETAIL.QUAD_ROOM',
      capacity: 'ROOM_DETAIL.QUAD_CAPACITY',
      amenities: 'ROOM_DETAIL.QUAD_AMENITIES',
      images: [
        'assets/pictures/quad1.png', 
        'assets/pictures/quad2.png', 
        'assets/pictures/quad3.png',
        'assets/pictures/quad4.png'
      ]
    }
  };

  constructor() {
    this.translate.addLangs(['en', 'vi']);
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|vi/) ? browserLang : 'vi');
  }
  
  ngOnInit(): void {
    this.onResize();
    this.isAuthenticated = this.authService.isAuthenticated();
    this.calculateScale();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) { this.fetchDataFromApi(id); }
    });
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.isAuthenticated = false;
      this.isUserMenuOpen = false;
      this.router.navigate(['/login']);
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
    this.isUserMenuOpen = false;
  }

  @HostListener('window:resize')
  onResize() { this.calculateScale(); }

  private calculateScale() {
    const screenWidth = document.documentElement.clientWidth;
    this.scaleFactor = screenWidth / 1920; 
  }

  onImageError(event: any, fallbackUrl: string) {
    if (event.target.src !== fallbackUrl) {
      event.target.src = fallbackUrl;
    }
  }

  getSafeUrl(url: string | undefined): string {
    if (!url) return '';
    let cleanUrl = url.replace(/.*public\//, '').replace(/.*assets\//, 'assets/');
    const finalUrl = cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
    return encodeURI(finalUrl);
  }

  private fetchDataFromApi(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.branchDetail = null;

    this.branchService.getBranchById(id).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (data) => {
        this.branchDetail = data;
        
        // Ghi đè dữ liệu rỗng ban đầu bằng dữ liệu API nếu có
        // Data API cần chứa các Key dạng "ROOM_DETAIL.TWIN_CAPACITY" để UI có thể tự động dịch
        if (data.sharedFacilities?.length) {
            // Mapping từ model Backend sang model giao diện cũ (nếu cấu trúc Model khác nhau)
            // Nếu Backend trả về đúng y chang Interface 'SharedFacility' thì chỉ cần gán thẳng:
            // this.sharedFacilitiesList = data.sharedFacilities;
        }
        if (data.roomFacilities) {
            // Tương tự, mapping cấu trúc nếu có
        }

        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Lỗi khi tải chi nhánh:', err);
        this.errorMessage = 'COMMON.FETCH_ERROR';
        this.isLoading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  retryFetch(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchDataFromApi(id);
    }
  }

  triggerTransition(callback: () => void) {
    this.isTransitioning = true;
    this.cdr.detectChanges(); 

    window.setTimeout(() => {
      callback();
      this.isTransitioning = false;
      this.cdr.detectChanges(); 
    }, 300);
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayTimer = window.setInterval(() => {
      this.triggerTransition(() => {
        this.activeSharedIndex = (this.activeSharedIndex + 1) % this.sharedFacilitiesList.length;
        const maxRoomImgs = this.roomData[this.activeRoomType].images.length;
        this.activeRoomIndex = (this.activeRoomIndex + 1) % maxRoomImgs;
      });
    }, 5000); 
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) { window.clearInterval(this.autoPlayTimer); }
  }

  setSharedIndex(index: number) {
    if (index === this.activeSharedIndex) return;
    this.triggerTransition(() => {
      this.activeSharedIndex = index;
    });
    this.startAutoPlay();
  }

  setRoomType(type: RoomType) {
    if (type === this.activeRoomType) return;
    this.triggerTransition(() => {
      this.activeRoomType = type;
      this.activeRoomIndex = 0;
    });
    this.startAutoPlay();
  }

  setRoomIndex(index: number) {
    if (index === this.activeRoomIndex) return;
    this.triggerTransition(() => {
      this.activeRoomIndex = index;
    });
    this.startAutoPlay();
  }

  goHome(): void { this.router.navigate(['/']); }
  
  toggleLangMenu(): void { 
    this.isLangMenuOpen = !this.isLangMenuOpen; 
    this.isUserMenuOpen = false; 
    this.cdr.detectChanges(); 
  }
  
  toggleUserMenu(): void { 
    this.isUserMenuOpen = !this.isUserMenuOpen; 
    this.isLangMenuOpen = false; 
    this.cdr.detectChanges(); 
  }
  
  changeLang(lang: string): void { 
    this.translate.use(lang); 
    this.isLangMenuOpen = false; 
    this.cdr.detectChanges(); 
  }
  
  closeMenusDelay(): void { 
    window.setTimeout(() => { 
      this.isLangMenuOpen = false; 
      this.isUserMenuOpen = false; 
      this.cdr.detectChanges(); 
    }, 200); 
  }
  
  onContactAction(): void { 
    const branchName = this.branchDetail?.name || '';
    const alertMsg = this.translate.instant('ROOM_DETAIL.CONTACT_ACTION', { name: branchName });
    window.alert(alertMsg ? alertMsg : `Đã gửi yêu cầu liên hệ tới ban quản lý cơ sở: ${branchName}`); 
  }
}