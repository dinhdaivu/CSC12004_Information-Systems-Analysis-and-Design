import { TestBed } from "@angular/core/testing";
import { AdminDashboardComponent } from "./admin-dashboard.component";
import { RouterTestingModule } from "@angular/router/testing";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { AdminDashboardService } from "@core/services/admin-dashboard.service";

describe("AdminDashboardComponent", () => {
  let component: AdminDashboardComponent;
  let fixture: any;
  const adminDashboardServiceMock = {
    getDashboardSummary: jest.fn().mockReturnValue(
      of({
        usersCount: 1,
        roomsCount: 2,
        bookingsCount: 3,
        revenue: 4000,
        recentActivities: [],
      }),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [
        AdminDashboardComponent,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: AdminDashboardService,
          useValue: adminDashboardServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
  });

  it("should create the admin dashboard component", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should request dashboard summary on initialization", () => {
    fixture.detectChanges();
    expect(adminDashboardServiceMock.getDashboardSummary).toHaveBeenCalled();
  });

  it("should render quick navigation links", () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain("admin.dashboard.quickNavigation");
  });
});
