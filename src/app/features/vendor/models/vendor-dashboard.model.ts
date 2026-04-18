export interface VendorSummary {
  totalRevenue: number;
  pendingPayments: number;
  activeOrders: number;
  completedOrders: number;
}

export interface ChartData {
  month?: string;
  status?: string;
  name?: string;
  amount?: number;
  count?: number;
  quantity?: number;
  revenue?: number;
}

export interface VendorStats {
  summary: VendorSummary;
  revenueTrend: ChartData[];
  orderStatusDistribution: ChartData[];
  paymentStatusDistribution: ChartData[];
  topItems: ChartData[];
}
