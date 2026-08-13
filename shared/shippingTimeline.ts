export const SHIPPING_STATUSES = ["pending", "packed", "dispatched", "in_transit", "delivered"] as const;
export type ShippingStatus = (typeof SHIPPING_STATUSES)[number] | "returned";

export const SHIPPING_MILESTONES = [
  { status: "pending" as const, label: "Order received", description: "Your delivery request is in the fulfilment queue." },
  { status: "packed" as const, label: "Packed", description: "Your items are being prepared for dispatch." },
  { status: "dispatched" as const, label: "Dispatched", description: "The parcel has left our fulfilment point." },
  { status: "in_transit" as const, label: "In transit", description: "The courier is moving your parcel to its destination." },
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
