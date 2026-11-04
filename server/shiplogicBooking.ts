import {
  createNotification,
  getOrderById,
  getUserById,
  markShiplogicBookingFailed,
  markShiplogicBookingPending,
  persistShiplogicBooking,
  recordPaymentEvent,
} from "./db";
import { ShiplogicError, createShiplogicShipment, shiplogicTrackingUrl } from "./shiplogic";

export async function bookShiplogicOrder(orderId: number, actorUserId: number | null = null) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.paymentStatus !== "paid") throw new Error("Shiplogic booking is available after payment is confirmed.");
  if (!order.shipping) throw new Error("The order has no saved delivery address.");
  if (order.shipping.bookingStatus === "booked" || order.shipping.trackingNumber) throw new ShiplogicError("already_booked", "This order already has a Shiplogic waybill.");

  const customer = await getUserById(order.userId);
  await markShiplogicBookingPending(orderId);
  try {
    const booking = await createShiplogicShipment({
      orderId,
      customerName: order.shipping.fullName || customer?.fullName || "Customer",
      customerEmail: customer?.email,
      customerMobile: order.shipping.phone || customer?.phone,
      shipping: {
        addressLine1: order.shipping.addressLine1,
        addressLine2: order.shipping.addressLine2,
        city: order.shipping.city,
        postalCode: order.shipping.postalCode,
        country: order.shipping.country,
      },
      declaredValue: Number.parseFloat(order.totalAmount),
    });
    await persistShiplogicBooking({
      orderId,
      shipmentId: booking.shipmentId,
      trackingReference: booking.trackingReference,
      providerStatus: booking.providerStatus,
      trackingUrl: shiplogicTrackingUrl(booking.trackingReference),
    });
    await recordPaymentEvent({
      orderId,
      eventType: "shipping_booked",
      paymentStatus: "paid",
      amount: order.totalAmount,
      reference: booking.trackingReference,
      actorUserId,
      note: `Shiplogic shipment booked (${booking.providerStatus}).`,
    });
    await createNotification({
      userId: order.userId,
      orderId,
      type: "shipping",
      title: `Waybill created for Quote #${orderId}`,
      body: `Flash Parcels waybill ${booking.trackingReference} is now available in your delivery timeline.`,
    });
    return { success: true as const, provider: "shiplogic" as const, ...booking, trackingUrl: shiplogicTrackingUrl(booking.trackingReference) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shiplogic booking failed.";
    await markShiplogicBookingFailed(orderId, message).catch(() => {});
    throw error;
  }
}
