export interface DashboardRecentActivity {
  message: string;
  createdAt: string;
}

export interface DashboardSummary {
  usersCount: number;
  roomsCount: number;
  bookingsCount: number;
  revenue: number;
  recentActivities: DashboardRecentActivity[];
}
