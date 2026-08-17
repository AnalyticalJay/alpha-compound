import { trpc } from "@/lib/trpc";
import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Banknote, CheckCircle2, CreditCard, Eye, FileText, LoaderCircle, Lock, MapPin, Package, Send, ShieldCheck, Truck, UploadCloud } from "lucide-react";
import { Link, useParams } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import QuoteProgressTracker from "@/components/QuoteProgressTracker";
import QuoteConversation from "@/components/QuoteConversation";
import PaymentHistoryPanel from "@/components/PaymentHistoryPanel";
import DeliveryTimeline from "@/components/DeliveryTimeline";
import type { ShippingStatus } from "@shared/shippingTimeline";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    quote_pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    quote_approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    quote_rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    awaiting_payment: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    paid: "bg-green-500/20 text-green-400 border-green-500/30",
    processing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    shipped: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  };
  return <Badge className={`${map[status] ?? "bg-muted text-muted-foreground"} text-xs capitalize`}>{status.replaceAll("_", " ")}</Badge>;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated, user } = useAuth();
  const utils = trpc.useUtils();
  const parsedOrderId = parseInt(orderId ?? "0");
  const proofInputRef = useRef<HTMLInputElement>(null);
  const [isPayFastRedirecting, setIsPayFastRedirecting] = useState(false);

  const orderQuery = trpc.orders.detail.useQuery(
    { orderId: parsedOrderId },
    { enabled: isAuthenticated && !!orderId }
  );
  const order = orderQuery.data;

  const payfastForm = trpc.orders.payfastForm.useMutation({
    onSuccess: (data) => submitPayFast(data),
    onError: (error) => {
      setIsPayFastRedirecting(false);
      toast.error(error.message);
    },
  });

  const uploadEftProof = trpc.orders.uploadEftProof.useMutation({
    onSuccess: () => {
      toast.success("Proof of payment uploaded for verification.");
      utils.orders.detail.invalidate({ orderId: parsedOrderId });
    },
    onError: (error) => toast.error(error.message),
  });

  const choosePayment = trpc.orders.choosePayment.useMutation({
    onSuccess: (data) => {
      if (data.method === "eft") {
        toast.success("EFT selected. Follow the payment instructions below.");
        utils.orders.detail.invalidate({ orderId: parsedOrderId });
        return;
      }
      if (!data.payfastReference) {
        toast.error("PayFast reference could not be created.");
        return;
      }
      payfastForm.mutate({ orderId: data.orderId, origin: window.location.origin });
    },
    onError: (error) => {
      setIsPayFastRedirecting(false);
      toast.error(error.message);
    },
  });

  const paymentPending = choosePayment.isPending || payfastForm.isPending || isPayFastRedirecting;

  function handlePayFastPayment() {
    if (paymentPending) return;
    setIsPayFastRedirecting(true);
    choosePayment.mutate({ orderId: parsedOrderId, method: "payfast" });
  }

  function handleEftPayment() {
    if (paymentPending) return;
    choosePayment.mutate({ orderId: parsedOrderId, method: "eft" });
  }

  async function handleEftProofChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Upload a PDF, JPG, or PNG proof of payment.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Proof of payment must be 8 MB or smaller.");
      return;
    }
    try {
      const fileData = await fileToBase64(file);
      uploadEftProof.mutate({ orderId: parsedOrderId, fileName: file.name, fileData, mimeType: file.type as "application/pdf" | "image/jpeg" | "image/png" });
    } catch {
      toast.error("Could not read the selected proof of payment.");
    }
  }

  function submitPayFast(payment: { action: string; fields: Record<string, string> }) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = payment.action;
    Object.entries(payment.fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    window.setTimeout(() => form.submit(), 220);
  }

  if (orderQuery.isLoading) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 container py-12"><div className="max-w-3xl mx-auto space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-accent/20 rounded-xl animate-pulse" />)}</div></main><Footer /></div>;
  }

  if (!order) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 container py-12 text-center"><p className="text-muted-foreground">Quote not found.</p><Link href="/account"><Button className="mt-4 text-white font-bold">Back to Account</Button></Link></main><Footer /></div>;
  }

  const isApprovedForPayment = order.status === "quote_approved";
  const isEftAwaiting = order.status === "awaiting_payment" && order.paymentMethod === "eft";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link href="/account"><button className="p-1.5 rounded-md hover:bg-accent"><ArrowLeft className="h-4 w-4" /></button></Link>
            <div className="min-w-0 mr-auto"><h1 className="text-2xl font-black">Quote <span style={{ color: "#0EA5E9" }}>#{order.id}</span></h1><p className="text-sm text-muted-foreground">Submitted {format(new Date(order.createdAt), "d MMMM yyyy")}</p></div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid gap-6">
            <QuoteProgressTracker status={order.status} paymentStatus={order.paymentStatus} />
            <PaymentHistoryPanel order={order} events={order.paymentHistory} audience="customer" />
            {order.shipping && <div className="glass-card rounded-xl p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /><h2 className="font-bold">Delivery tracking</h2></div><Badge className="border-[#0EA5E9]/30 bg-[#0EA5E9]/10 text-xs capitalize text-[#38BDF8]">{(order.shipping.shippingStatus ?? "pending").replaceAll("_", " ")}</Badge></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Courier</p><p className="mt-1 font-medium">{order.shipping.courierName || "Being arranged"}</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tracking number</p><p className="mt-1 font-medium">{order.shipping.trackingNumber || "Not available yet"}</p></div></div><DeliveryTimeline status={(order.shipping.shippingStatus ?? "pending") as ShippingStatus} updatedAt={order.updatedAt} />{order.shipping.shippingNotes && <p className="mt-4 rounded-lg border border-border/30 bg-background/30 p-3 text-sm text-muted-foreground">{order.shipping.shippingNotes}</p>}{order.shipping.trackingUrl && <a href={order.shipping.trackingUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#0EA5E9]/40 px-3 text-sm font-bold text-[#38BDF8] transition hover:bg-[#0EA5E9]/10"><Truck className="h-4 w-4" />Track shipment</a>}</div>}
            <QuoteConversation orderId={order.id} comments={order.comments} viewerRole={user?.role === "admin" ? "admin" : "user"} />

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><Package className="h-4 w-4 text-primary" /><h2 className="font-bold">Products in Quote</h2></div>
              <div className="space-y-3">{order.items.map((item: any) => <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0"><div><p className="font-medium text-sm">{item.productName}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity}</p></div><p className="font-bold text-sm text-primary">R{(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2)}</p></div>)}</div>
            </div>

            {order.shipping && <div className="glass-card rounded-xl p-6"><div className="flex items-center gap-2 mb-4"><MapPin className="h-4 w-4 text-primary" /><h2 className="font-bold">Delivery Address</h2></div><div className="text-sm space-y-1"><p className="font-medium">{order.shipping.fullName}</p><p className="text-muted-foreground">{order.shipping.addressLine1}</p>{order.shipping.addressLine2 && <p className="text-muted-foreground">{order.shipping.addressLine2}</p>}<p className="text-muted-foreground">{order.shipping.city}, {order.shipping.postalCode}</p><p className="text-muted-foreground">{order.shipping.country}</p><p className="text-muted-foreground mt-2">{order.shipping.phone}</p></div></div>}

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><CreditCard className="h-4 w-4 text-primary" /><h2 className="font-bold">Quote & Payment</h2></div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R{(parseFloat(order.totalAmount) - parseFloat(order.deliveryFee)).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3" /> Delivery</span><span>{parseFloat(order.deliveryFee) === 0 ? <span className="text-green-400">Free</span> : `R${parseFloat(order.deliveryFee).toFixed(2)}`}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-border/40 pt-2 mt-2"><span>Quote Total</span><span className="text-primary">R{parseFloat(order.totalAmount).toFixed(2)}</span></div>
                <div className="flex justify-between text-xs mt-2"><span className="text-muted-foreground">Payment Status</span><Badge className={`text-xs ${order.paymentStatus === "paid" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>{order.paymentStatus.replaceAll("_", " ")}</Badge></div>
                {order.paymentMethod && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Payment Method</span><span className="uppercase">{order.paymentMethod}</span></div>}
              </div>

              {order.status === "quote_pending" && <div className="mt-5 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-200"><Lock className="inline h-4 w-4 mr-2" />Payment will become available after an admin reviews and approves this quote.</div>}
              {order.status === "quote_rejected" && <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">This quote was not approved. {order.rejectionReason || "Please contact the store if you need clarification."}</div>}
              {order.paymentStatus === "failed" && <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-100" role="alert"><CreditCard className="mr-2 inline h-4 w-4 text-red-300" /><strong>PayFast payment was not completed.</strong> No payment was confirmed for this quote. You can try PayFast again or choose EFT.</div>}
              {isApprovedForPayment && <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Button className="min-h-11 text-white font-bold" onClick={handlePayFastPayment} disabled={paymentPending} aria-busy={isPayFastRedirecting}>
                    {isPayFastRedirecting ? <LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
                    {isPayFastRedirecting ? "Connecting to PayFast…" : "Pay via PayFast"}
                  </Button>
                  <Button variant="outline" className="min-h-11 font-bold border-[#0EA5E9]/40" onClick={handleEftPayment} disabled={paymentPending}><Banknote className="h-4 w-4 mr-2" />Pay via EFT</Button>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2.5" aria-label="Secure PayFast payment">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
                  <div className="min-w-0 flex-1"><p className="text-xs font-bold text-emerald-300">Secure PayFast checkout</p><p className="text-[11px] text-muted-foreground">Encrypted payment handoff in ZAR</p></div>
                  <Badge className="shrink-0 border-emerald-400/30 bg-emerald-400/10 text-[10px] text-emerald-300">Protected</Badge>
                </div>
              </>}
              {isEftAwaiting && <div className="mt-5 rounded-lg border border-[#0EA5E9]/30 bg-[#0EA5E9]/5 p-4 text-sm"><div className="flex items-center gap-2 font-bold text-[#38BDF8] mb-2"><CheckCircle2 className="h-4 w-4" />EFT payment selected</div><p className="text-muted-foreground">Please use the banking details provided by Anabolics Africa in your approval instructions and include Quote #{order.id} as the payment reference.</p>{order.quoteNotes && <p className="mt-3 whitespace-pre-wrap text-foreground">{order.quoteNotes}</p>}<div className="mt-4 rounded-lg border border-border/40 bg-background/30 p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><p className="font-semibold text-foreground">Proof of payment</p><p className="text-xs text-muted-foreground">PDF, JPG, or PNG up to 8 MB.</p></div>{order.eftProofName ? <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300"><CheckCircle2 className="mr-1 h-3 w-3" />Submitted for review</Badge> : <><input ref={proofInputRef} type="file" accept="application/pdf,image/jpeg,image/png" className="hidden" onChange={handleEftProofChange} /><Button type="button" variant="outline" className="min-h-10 border-[#0EA5E9]/40 font-bold" onClick={() => proofInputRef.current?.click()} disabled={uploadEftProof.isPending}><UploadCloud className="mr-2 h-4 w-4" />{uploadEftProof.isPending ? "Uploading…" : "Upload proof"}</Button></>}</div>{order.eftProofName && <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><FileText className="h-4 w-4 text-primary" /><span className="truncate">{order.eftProofName}</span><span className="text-emerald-300">Awaiting verification</span></div>}</div></div>}
              {["quote_approved", "awaiting_payment", "paid", "processing", "shipped", "completed"].includes(order.status) && <a href={`/api/invoices/${order.id}.pdf`} target="_blank" rel="noreferrer" className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#0EA5E9]/40 px-4 text-sm font-bold text-[#38BDF8] transition hover:bg-[#0EA5E9]/10"><FileText className="h-4 w-4" />View / download invoice</a>}
              {isPayFastRedirecting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-5 backdrop-blur-sm" role="status" aria-live="polite"><div className="w-full max-w-sm rounded-2xl border border-[#0EA5E9]/30 bg-[#07111f] p-6 text-center shadow-2xl shadow-cyan-950/40"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10"><LoaderCircle className="h-7 w-7 animate-spin text-[#38BDF8]" /></div><p className="font-bold text-white">Connecting securely to PayFast</p><p className="mt-2 text-sm text-slate-300">Your approved quote is ready. Please keep this window open while we transfer you to the protected payment page.</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#E11D48]" /></div></div></div>}
            </div>

            {order.quoteNotes && order.status !== "awaiting_payment" && <div className="glass-card rounded-xl p-6"><h2 className="font-bold mb-2">Review Notes</h2><p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.quoteNotes}</p></div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
