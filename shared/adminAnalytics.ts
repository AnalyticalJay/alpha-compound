export type AnalyticsOrder = {
  status: string;
  paymentStatus?: string | null;
  totalAmount?: string | number | null;
  createdAt: Date | string | number;
};

export type AdminAnalytics = ReturnType<typeof buildAdminAnalytics>;

function asDate(value: Date | string | number) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", { month: "short" }).format(date);
}

export function buildAdminAnalytics(orders: AnalyticsOrder[], now = new Date()) {
  const pipeline = {
    submitted: orders.filter((order) => order.status === "quote_pending").length,
    approved: orders.filter((order) => order.status === "quote_approved").length,
    awaitingPayment: orders.filter((order) => order.status === "awaiting_payment").length,
    paid: orders.filter((order) => order.paymentStatus === "paid").length,
    rejected: orders.filter((order) => order.status === "quote_rejected").length,
  };

  const statusOrder = ["quote_pending", "quote_approved", "awaiting_payment", "paid", "quote_rejected"];
  const statusLabels: Record<string, string> = {
    quote_pending: "Review",
    quote_approved: "Approved",
    awaiting_payment: "Payment",
    paid: "Paid",
    quote_rejected: "Rejected",
  };
  const statusBreakdown = statusOrder.map((status) => ({
    status,
    label: statusLabels[status],
    count: orders.filter((order) => order.status === status || (status === "paid" && order.paymentStatus === "paid")).length,
  }));

  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const months = Array.from({ length: 6 }, (_, index) => new Date(start.getFullYear(), start.getMonth() + index, 1));
  const monthlyRevenue = months.map((month) => {
    const key = monthKey(month);
    const monthOrders = orders.filter((order) => {
      const createdAt = asDate(order.createdAt);
      return createdAt ? monthKey(createdAt) === key : false;
    });
    const revenue = monthOrders
      .filter((order) => order.paymentStatus === "paid")
      .reduce((sum, order) => sum + Number.parseFloat(String(order.totalAmount ?? 0)) || 0, 0);

    return {
      month: key,
      label: monthLabel(month),
      orders: monthOrders.length,
      paidOrders: monthOrders.filter((order) => order.paymentStatus === "paid").length,
      revenue: Number(revenue.toFixed(2)),
    };
  });

  return { pipeline, statusBreakdown, monthlyRevenue };
}
