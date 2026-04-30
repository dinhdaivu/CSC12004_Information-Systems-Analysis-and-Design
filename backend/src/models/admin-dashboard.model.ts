export interface DashboardRecentActivity {
  message: string;
  createdAt: string;
}

export interface AdminDashboardResponse {
  usersCount: number;
  roomsCount: number;
  bookingsCount: number;
  revenue: number;
  recentActivities: DashboardRecentActivity[];
}

export interface PaymentAmountRow {
  amount: number | string;
}

export interface RentalRequestActivityRow {
  created_at: string;
}

export interface PaymentActivityRow {
  created_at: string;
  amount: number | string;
}
