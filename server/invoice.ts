import PDFDocument from "pdfkit";

export type InvoiceLineItem = {
  productName: string;
  quantity: number;
  priceAtPurchase: string | number;
};

export type InvoiceOrder = {
  id: number;
  totalAmount: string | number;
  deliveryFee: string | number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  createdAt: Date | string;
  items: InvoiceLineItem[];
  shipping?: {
    fullName?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
};

export function isInvoiceEligible(status: string) {
  return ["quote_approved", "awaiting_payment", "paid", "processing", "shipped", "completed"].includes(status);
}

function money(value: string | number) {
  return `R${Number(value).toFixed(2)}`;
}

export function generateInvoicePdf(order: InvoiceOrder, customer: { fullName?: string | null; email?: string | null }) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: `Anabolics Africa Invoice #${order.id}`, Author: "Anabolics Africa" } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const blue = "#0EA5E9";
    const red = "#E11D48";
    const ink = "#111827";
    const muted = "#64748B";

    doc.font("Helvetica-Bold").fontSize(22).fillColor(ink).text("ANABOLICS ", { continued: true });
    doc.fillColor(blue).text("AFRICA");
    doc.font("Helvetica").fontSize(9).fillColor(muted).text("Premium gated compound supply | South Africa");
    doc.moveTo(48, 91).lineTo(547, 91).lineWidth(2).strokeColor(red).stroke();

    doc.moveDown(1.8);
    doc.font("Helvetica-Bold").fontSize(20).fillColor(ink).text("INVOICE");
    doc.font("Helvetica").fontSize(10).fillColor(muted).text(`Invoice #AA-${order.id}`);
    doc.text(`Issued ${new Date(order.createdAt).toLocaleDateString("en-ZA")}`);
    doc.text(`Payment status: ${order.paymentStatus.replaceAll("_", " ")}`);

    const customerName = customer.fullName || order.shipping?.fullName || "Approved customer";
    doc.font("Helvetica-Bold").fontSize(10).fillColor(ink).text("BILL TO", 340, 122);
    doc.font("Helvetica").fontSize(10).fillColor(muted).text(customerName, 340, 138);
    if (customer.email) doc.text(customer.email, 340, 153);
    if (order.shipping?.city) doc.text(`${order.shipping.city}, ${order.shipping.country || "South Africa"}`, 340, 168);

    let y = 220;
    doc.rect(48, y, 499, 24).fillColor("#E0F2FE").fill();
    doc.font("Helvetica-Bold").fontSize(9).fillColor(ink).text("ITEM", 58, y + 8);
    doc.text("QTY", 355, y + 8);
    doc.text("AMOUNT", 465, y + 8);
    y += 34;

    doc.font("Helvetica").fontSize(10);
    for (const item of order.items) {
      const lineTotal = Number(item.priceAtPurchase) * item.quantity;
      doc.fillColor(ink).text(item.productName, 58, y, { width: 270 });
      doc.fillColor(muted).text(String(item.quantity), 355, y);
      doc.fillColor(ink).text(money(lineTotal), 465, y, { width: 80, align: "right" });
      y += 24;
      doc.moveTo(48, y - 8).lineTo(547, y - 8).lineWidth(0.5).strokeColor("#CBD5E1").stroke();
    }

    y += 12;
    doc.font("Helvetica").fontSize(10).fillColor(muted).text("Delivery", 355, y);
    doc.fillColor(ink).text(money(order.deliveryFee), 465, y, { width: 80, align: "right" });
    y += 26;
    doc.font("Helvetica-Bold").fontSize(12).fillColor(ink).text("TOTAL", 355, y);
    doc.fillColor(blue).text(money(order.totalAmount), 465, y, { width: 80, align: "right" });

    y += 60;
    doc.font("Helvetica-Bold").fontSize(10).fillColor(ink).text("PAYMENT INFORMATION", 48, y);
    y += 18;
    doc.font("Helvetica").fontSize(9).fillColor(muted).text(`Method: ${order.paymentMethod ? order.paymentMethod.toUpperCase() : "To be selected"}`, 48, y);
    doc.text("All amounts are in South African Rand (ZAR). Full payment is required before dispatch.", 48, y + 16);

    if (order.shipping) {
      y += 56;
      doc.font("Helvetica-Bold").fontSize(10).fillColor(ink).text("DELIVERY ADDRESS", 48, y);
      y += 18;
      const address = [order.shipping.addressLine1, order.shipping.addressLine2, order.shipping.city, order.shipping.postalCode, order.shipping.country || "South Africa"].filter(Boolean).join(", ");
      doc.font("Helvetica").fontSize(9).fillColor(muted).text(order.shipping.fullName || customerName, 48, y);
      doc.text(address, 48, y + 16, { width: 300 });
    }

    doc.font("Helvetica").fontSize(8).fillColor(muted).text("This invoice is generated from the Anabolics Africa quote system. Please retain it for your records.", 48, 760, { width: 499, align: "center" });
    doc.end();
  });
}
