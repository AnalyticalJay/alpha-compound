import { beforeEach, describe, expect, it } from "vitest";
import {
  E2E_CUSTOMER_ID,
  E2E_PRODUCT_ID,
  chooseE2EPayment,
  completeE2EPayFastSuccess,
  createE2EQuote,
  getE2ECart,
  getE2ENotifications,
  getE2EOrder,
  resetE2EStore,
  uploadE2EProof,
  updateE2EShipping,
  upsertE2ECart,
} from "./e2eStore";

describe("disposable E2E write-flow store", () => {
  beforeEach(() => resetE2EStore());

  it("creates and clears only in-memory quote state", () => {
    upsertE2ECart(E2E_CUSTOMER_ID, E2E_PRODUCT_ID, 1);
    const quote = createE2EQuote(E2E_CUSTOMER_ID, {
      shipping: { fullName: "E2E Customer", phone: "0123456789", addressLine1: "42 Test Street", city: "Port Elizabeth", postalCode: "6001", country: "South Africa" },
      notes: "Disposable test quote",
    });

    expect(quote).toMatchObject({ quoteId: 42001, status: "quote_pending", deliveryFee: "0.00" });
    expect(getE2ECart(E2E_CUSTOMER_ID)).toHaveLength(0);
    expect(getE2EOrder(quote.quoteId)?.items).toHaveLength(1);
  });

  it("tracks EFT proof data only after an approved disposable quote selects EFT", () => {
    upsertE2ECart(E2E_CUSTOMER_ID, E2E_PRODUCT_ID, 1);
    const quote = createE2EQuote(E2E_CUSTOMER_ID, {
      shipping: { fullName: "E2E Customer", phone: "0123456789", addressLine1: "42 Test Street", city: "Cape Town", postalCode: "8001", country: "South Africa" },
    });
    const order = getE2EOrder(quote.quoteId)!;
    order.status = "quote_approved";

    chooseE2EPayment(quote.quoteId, E2E_CUSTOMER_ID, "eft");
    const result = uploadE2EProof(quote.quoteId, E2E_CUSTOMER_ID, "e2e-proof.png");

    expect(result).toMatchObject({ success: true, fileName: "e2e-proof.png" });
    expect(getE2EOrder(quote.quoteId)).toMatchObject({ paymentStatus: "awaiting_eft", eftProofName: "e2e-proof.png" });
  });

  it("records only disposable PayFast success and shipping notifications", () => {
    upsertE2ECart(E2E_CUSTOMER_ID, E2E_PRODUCT_ID, 1);
    const quote = createE2EQuote(E2E_CUSTOMER_ID, {
      shipping: { fullName: "E2E Customer", phone: "0123456789", addressLine1: "42 Test Street", city: "Cape Town", postalCode: "8001", country: "South Africa" },
    });
    const order = getE2EOrder(quote.quoteId)!;
    order.status = "quote_approved";

    chooseE2EPayment(quote.quoteId, E2E_CUSTOMER_ID, "payfast");
    completeE2EPayFastSuccess(quote.quoteId);
    updateE2EShipping(quote.quoteId, { shippingStatus: "dispatched", courierName: "E2E Courier", trackingNumber: "E2E-TRACK-001" });

    expect(getE2EOrder(quote.quoteId)).toMatchObject({ status: "shipped", paymentStatus: "paid" });
    expect(getE2ENotifications(E2E_CUSTOMER_ID).map((entry) => entry.type)).toEqual(["shipping", "payment"]);
    resetE2EStore();
    expect(getE2EOrder(quote.quoteId)).toBeNull();
    expect(getE2ENotifications(E2E_CUSTOMER_ID)).toEqual([]);
  });
});
