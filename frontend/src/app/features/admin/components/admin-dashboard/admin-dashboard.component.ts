import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { finalize } from "rxjs/operators";
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";
import { DashboardSummary } from "../../models/dashboard-summary.model";
import { AdminDashboardService } from "../../services/admin-dashboard.service";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, AdminSidebarComponent],
  templateUrl: "./admin-dashboard.component.html",
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminDashboardService = inject(AdminDashboardService);

  isLoading = true;
  errorMessage: string | null = null;
  summary: DashboardSummary | null = null;

  readonly quickLinks: ReadonlyArray<{ path: string; labelKey: string }> = [
    {
      path: "/admin/users-management",
      labelKey: "admin.dashboard.usersManagement",
    },
    {
      path: "/admin/rooms-management",
      labelKey: "admin.dashboard.roomsManagement",
    },
    {
      path: "/admin/rental-requests",
      labelKey: "admin.dashboard.rentalRequests",
    },
    {
      path: "/admin/payments",
      labelKey: "admin.dashboard.payments",
    },
    {
      path: "/admin/scheduled-management",
      labelKey: "admin.dashboard.scheduledManagement",
    },
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  retryLoad(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminDashboardService
      .getDashboardSummary()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (dashboardSummary) => {
          this.summary = dashboardSummary;
        },
        error: () => {
          this.summary = null;
          this.errorMessage = "admin.dashboard.error";
        },
      });
  }
}
