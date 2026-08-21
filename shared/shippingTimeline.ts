export const SHIPPING_STATUSES = ["pending", "packed", "dispatched", "in_transit", "out_for_delivery", "delivered"] as const;
export type ShippingStatus = (typeof SHIPPING_STATUSES)[number] | "returned";

export const SHIPPING_MILESTONES = [
  { status: "pending" as const, label: "Order received", description: "Your delivery request is in the fulfilment queue." },
  { status: "packed" as const, label: "Packed", description: "Your items are being prepared for dispatch." },
  { status: "dispatched" as const, label: "Dispatched", description: "The parcel has left our fulfilment point." },
  { status: "in_transit" as const, label: "In transit", description: "The courier is moving your parcel to its destination." },
  { status: "out_for_delivery" as const, label: "Out for delivery", description: "The courier is on the way to the delivery address." },
  { status: "delivered" as const, label: "Delivered", description: "Delivery has been marked as completed." },
] as const;

export function getShippingProgress(status: ShippingStatus) {
  if (status === "returned") return { currentIndex: -1, isReturned: true };
  const currentIndex = SHIPPING_STATUSES.indexOf(status);
  return { currentIndex: currentIndex < 0 ? 0 : currentIndex, isReturned: false };
}

export function isShippingMilestoneComplete(status: ShippingStatus, milestoneIndex: number) {
  const progress = getShippingProgress(status);
  return !progress.isReturned && milestoneIndex <= progress.currentIndex;
}

export function getShippingProgressPercent(status: ShippingStatus) {
  const progress = getShippingProgress(status);
  if (progress.isReturned) return 0;
  return Math.round(((progress.currentIndex + 1) / SHIPPING_MILESTONES.length) * 100);
}

export type DeliveryEstimate = {
  title: string;
  detail: string;
  startDate?: Date;
  endDate?: Date;
};

function addBusinessDays(value: Date, days: number) {
  const result = new Date(value);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) added += 1;
  }
  return result;
}

export function getDeliveryEstimate(status: ShippingStatus, shippedAt?: Date | string | null): DeliveryEstimate {
  if (status === "returned") return { title: "Delivery paused", detail: "This parcel was returned to sender. Contact support for the next step." };
  if (status === "delivered") return { title: "Delivered", detail: "This delivery has been marked as completed." };
  if (status === "pending") return { title: "Dispatch estimate pending", detail: "A delivery window will appear once the order has been dispatched." };
  if (status === "packed") return { title: "Dispatching within 1 business day", detail: "The delivery window will update once the parcel leaves our fulfilment point." };
  if (status === "out_for_delivery") return { title: "Expected today", detail: "The courier is on the final delivery route. Timing remains subject to the courier route." };

  const dispatchedAt = shippedAt ? new Date(shippedAt) : null;
  if (!dispatchedAt || Number.isNaN(dispatchedAt.getTime())) {
    return { title: "Delivery window pending", detail: "The parcel is moving through the courier network. A window will appear when dispatch timing is available." };
  }

  if (status === "dispatched") {
    return { title: "Estimated delivery window", detail: "Estimated from the recorded dispatch time; courier routing may affect the final arrival.", startDate: addBusinessDays(dispatchedAt, 1), endDate: addBusinessDays(dispatchedAt, 3) };
  }

  return { title: "Estimated delivery window", detail: "The parcel is in transit. Courier routing may affect the final arrival.", startDate: addBusinessDays(dispatchedAt, 1), endDate: addBusinessDays(dispatchedAt, 2) };
}
