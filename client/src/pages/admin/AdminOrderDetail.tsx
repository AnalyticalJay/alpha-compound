import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, Eye, FileText, Package, MapPin, CreditCard, RefreshCw, Truck, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import QuoteConversation from "@/components/QuoteConversation";
import PaymentHistoryPanel from "@/components/PaymentHistoryPanel";
import DeliveryTimeline from "@/components/DeliveryTimeline";
import type { ShippingStatus } from "@shared/shippingTimeline";

const ORDER_STATUSES = ["quote_pending", "quote_approved", "quote_rejected", "awaiting_payment", "paid", "processing", "shipped", "completed", "cancelled"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    quote_pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    quote_approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    quote_rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    awaiting_payment: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    paid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    processing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    shipped: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  };
  return <Badge className={`${map[status] ?? "bg-muted text-muted-foreground"} text-xs capitalize`}>{status.replaceAll("_", " ")}</Badge>;
}

export default function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const utils = trpc.useUtils();
  const [newStatus, setNewStatus] = useState<string>("");
  const [shippingStatus, setShippingStatus] = useState("pending");
  const [courierName, setCourierName] = useState("");
  const [trackingProvider, setTrackingProvider] = useState("manual");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [shippingNotes, setShippingNotes] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [itemAvailability, setItemAvailability] = useState<Record<number, { status: "pending" | "in_stock" | "out_of_stock"; notes: string }>>({});

  const orderQuery = trpc.orders.adminDetail.useQuery(
    { orderId: parseInt(orderId ?? "0") },
    { enabled: !!orderId }
  );
  const order = orderQuery.data;

  const proofDownloadQuery = trpc.orders.getEftProofDownload.useQuery(
    { orderId: parseInt(orderId ?? "0") },
    { enabled: Boolean(order?.eftProofKey), retry: false }
  );

  const confirmEft = trpc.orders.confirmEft.useMutation({
    onSuccess: () => {
      toast.success("EFT payment confirmed");
      utils.orders.adminDetail.invalidate({ orderId: parseInt(orderId ?? "0") });
      utils.orders.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (!order) return;
    setItemAvailability(Object.fromEntries(order.items.map((item: any) => [item.id, { status: item.availabilityStatus ?? "pending", notes: item.availabilityNotes ?? "" }])) as Record<number, { status: "pending" | "in_stock" | "out_of_stock"; notes: string }>);
  }, [order?.id, order?.items]);

  useEffect(() => {
    if (!order?.shipping) return;
    setShippingStatus(order.shipping.shippingStatus ?? "pending");
    setCourierName(order.shipping.courierName ?? "");
    setTrackingProvider(order.shipping.trackingProvider ?? (order.shipping.courierName?.toLowerCase().includes("flash") ? "shiplogic" : "manual"));
    setTrackingNumber(order.shipping.trackingNumber ?? "");
    setTrackingUrl(order.shipping.trackingUrl ?? "");
    setShippingNotes(order.shipping.shippingNotes ?? "");
  }, [order?.id, order?.shipping?.shippingStatus, order?.shipping?.trackingNumber]);

  const updateShipping = trpc.orders.adminUpdateShipping.useMutation({
    onSuccess: () => {
      toast.success("Shipping details updated");
      utils.orders.adminDetail.invalidate({ orderId: parseInt(orderId ?? "0") });
      utils.orders.adminList.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const refreshShiplogic = trpc.orders.adminRefreshShiplogicTracking.useMutation({
    onSuccess: () => {
      toast.success("Flash Parcels tracking refreshed");
      utils.orders.adminDetail.invalidate({ orderId: parseInt(orderId ?? "0") });
      utils.orders.adminList.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateItemAvailability = trpc.orders.adminUpdateItemAvailability.useMutation({
    onSuccess: () => {
      toast.success("Quote item availability updated");
      utils.orders.adminDetail.invalidate({ orderId: parseInt(orderId ?? "0") });
    },
    onError: (error) => toast.error(error.message),
  });

  const reviewQuote = trpc.orders.review.useMutation({
    onSuccess: () => {
      toast.success("Quote review saved");
      utils.orders.adminDetail.invalidate({ orderId: parseInt(orderId ?? "0") });
      utils.orders.adminList.invalidate();
      setReviewNotes("");
    },
    onError: (error) => toast.error(error.message),
  });

  const updateStatus = trpc.orders.adminUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      utils.orders.adminDetail.invalidate({ orderId: parseInt(orderId ?? "0") });
      utils.orders.adminList.invalidate();
      setNewStatus("");
    },
    onError: (e) => toast.error(e.message),
  });

  if (orderQuery.isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-accent/20 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found.</p>
        <Link href="/admin/orders">
          <Button className="mt-4 text-white font-bold">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <button className="p-1.5 rounded-md hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black" >
            Order <span style={{ color: "#0EA5E9" }}>#{order.id}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm")}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Status Update */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-bold mb-4">Update Order Status</h2>
        <div className="flex gap-3 items-center">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-48 bg-background/50">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="text-white font-bold"
            disabled={!newStatus || updateStatus.isPending}
            onClick={() => {
              if (newStatus) {
                updateStatus.mutate({ orderId: order.id, status: newStatus as any });
              }
            }}
          >
            {updateStatus.isPending ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </div>

      <PaymentHistoryPanel order={order} events={order.paymentHistory} audience="admin" />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-bold">Customer</h2>
          </div>
          <div className="text-sm space-y-1">
            <p className="font-medium">User ID: {order.userId}</p>
            <p className="text-muted-foreground">Order #{order.id}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="font-bold">Payment</h2>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className={`text-xs ${order.paymentStatus === "paid" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>
                {order.paymentStatus}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-primary">R{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>
                {parseFloat(order.deliveryFee) === 0
                  ? <span className="text-green-400">Free</span>
                  : `R${parseFloat(order.deliveryFee).toFixed(2)}`}
              </span>
            </div>
            {order.paymentMethod && <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="uppercase">{order.paymentMethod}</span></div>}
            {order.payfastReference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">PayFast Ref</span>
                <span className="font-mono text-xs">{order.payfastReference}</span>
              </div>
            )}
            {order.eftProofName && <div className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-3"><div className="flex items-center gap-2 text-sm font-bold text-emerald-300"><FileText className="h-4 w-4" />Proof of payment received</div><p className="mt-1 truncate text-xs text-muted-foreground">{order.eftProofName}</p><div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="outline" className="min-h-10 border-emerald-400/30 font-bold" onClick={() => proofDownloadQuery.data?.url && window.open(proofDownloadQuery.data.url, "_blank", "noopener,noreferrer")} disabled={!proofDownloadQuery.data?.url || proofDownloadQuery.isFetching}><Eye className="mr-2 h-4 w-4" />{proofDownloadQuery.isFetching ? "Preparing…" : "View proof"}</Button><Badge className="border-yellow-400/30 bg-yellow-400/10 text-yellow-300"><CheckCircle2 className="mr-1 h-3 w-3" />Awaiting verification</Badge></div></div>}
            {["quote_approved", "awaiting_payment", "paid", "processing", "shipped", "completed"].includes(order.status) && <a href={`/api/invoices/${order.id}.pdf`} target="_blank" rel="noreferrer" className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#0EA5E9]/40 px-4 text-sm font-bold text-[#38BDF8] transition hover:bg-[#0EA5E9]/10"><FileText className="h-4 w-4" />View / download invoice</a>}
            {order.status === "awaiting_payment" && order.paymentMethod === "eft" && <Button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold" onClick={() => confirmEft.mutate({ orderId: order.id })} disabled={confirmEft.isPending}>{confirmEft.isPending ? "Confirming..." : "Confirm EFT Payment"}</Button>}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-4 w-4 text-primary" />
          <h2 className="font-bold">Items Ordered & Availability</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">Review each line before approving the quote. Customers will see these saved availability decisions in their dashboard.</p>
        <div className="space-y-4">
          {order.items.map((item: any) => {
            const draft = itemAvailability[item.id] ?? { status: "pending" as const, notes: "" };
            return <div key={item.id} className="rounded-lg border border-border/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-medium text-sm">{item.productName}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity} × R{parseFloat(item.priceAtPurchase).toFixed(2)}</p></div>
                <p className="font-bold text-sm text-primary">R{(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2)}</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,190px)_1fr_auto] sm:items-end">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Availability<select value={draft.status} onChange={(event) => setItemAvailability((current) => ({ ...current, [item.id]: { ...draft, status: event.target.value as typeof draft.status } }))} className="mt-1 min-h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground"><option value="pending">Needs review</option><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option></select></label>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Customer note<input value={draft.notes} onChange={(event) => setItemAvailability((current) => ({ ...current, [item.id]: { ...draft, notes: event.target.value } }))} placeholder="Optional availability note" className="mt-1 min-h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground placeholder:text-muted-foreground" /></label>
                <Button type="button" variant="outline" className="min-h-10 font-bold" onClick={() => updateItemAvailability.mutate({ orderId: order.id, itemId: item.id, availabilityStatus: draft.status, availabilityNotes: draft.notes })} disabled={updateItemAvailability.isPending}>Save item</Button>
              </div>
            </div>;
          })}
          <div className="flex justify-between font-bold pt-2"><span>Total</span><span className="text-primary">R{parseFloat(order.totalAmount).toFixed(2)}</span></div>
        </div>
        {order.status === "quote_pending" && <div className="mt-5 border-t border-border/30 pt-5"><label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Quote review note<textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} rows={2} placeholder="Add a note for the customer" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-normal text-foreground placeholder:text-muted-foreground" /></label><div className="mt-3 flex flex-wrap gap-3"><Button type="button" className="min-h-10 bg-emerald-600 font-bold text-white hover:bg-emerald-700" onClick={() => reviewQuote.mutate({ orderId: order.id, decision: "quote_approved", notes: reviewNotes || undefined })} disabled={reviewQuote.isPending || order.items.some((item: any) => (itemAvailability[item.id]?.status ?? item.availabilityStatus ?? "pending") !== "in_stock")}>Approve quote</Button><Button type="button" variant="outline" className="min-h-10 border-red-400/40 font-bold text-red-300" onClick={() => reviewQuote.mutate({ orderId: order.id, decision: "quote_rejected", notes: reviewNotes || undefined })} disabled={reviewQuote.isPending}>Reject quote</Button></div><p className="mt-2 text-xs text-muted-foreground">Every item must be saved as In stock before approval and payment becomes available.</p></div>}
      </div>

      {/* Shipping Details */}
      {order.shipping && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="font-bold">Shipping & Tracking</h2>
          </div>
          <DeliveryTimeline status={(order.shipping.shippingStatus ?? "pending") as ShippingStatus} updatedAt={order.updatedAt} />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.shipping.fullName}</p>
              <p className="text-muted-foreground">{order.shipping.addressLine1}</p>
              {order.shipping.addressLine2 && <p className="text-muted-foreground">{order.shipping.addressLine2}</p>}
              <p className="text-muted-foreground">{order.shipping.city}, {order.shipping.postalCode}</p>
              <p className="text-muted-foreground">{order.shipping.country}</p>
              <p className="text-muted-foreground mt-2">Phone: {order.shipping.phone}</p>
              <div className="mt-4 rounded-lg border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#38BDF8]">Customer view</p>
                <p className="mt-1 text-xs text-muted-foreground">Updates here appear in the customer’s quote tracking panel.</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">Shipping status<select value={shippingStatus} onChange={(event) => setShippingStatus(event.target.value)} className="mt-1 min-h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground"><option value="pending">Pending</option><option value="packed">Packed</option><option value="dispatched">Dispatched</option><option value="in_transit">In transit</option><option value="out_for_delivery">Out for delivery</option><option value="delivered">Delivered</option><option value="returned">Returned</option></select></label>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">Courier<input value={courierName} onChange={(event) => setCourierName(event.target.value)} placeholder="e.g. Flash Parcels" className="mt-1 min-h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground placeholder:text-muted-foreground" /></label>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">Tracking provider<select value={trackingProvider} onChange={(event) => setTrackingProvider(event.target.value)} className="mt-1 min-h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground"><option value="shiplogic">Flash Parcels / Shiplogic</option><option value="manual">Manual / other courier</option></select></label>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">Tracking number<input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Flash waybill reference" className="mt-1 min-h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground placeholder:text-muted-foreground" /></label>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">Tracking URL<input value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} placeholder="https://courier.example/track/..." className="mt-1 min-h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-normal text-foreground placeholder:text-muted-foreground" /></label>
              <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">Customer-facing notes<textarea value={shippingNotes} onChange={(event) => setShippingNotes(event.target.value)} rows={3} placeholder="Add dispatch or delivery instructions" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-normal text-foreground placeholder:text-muted-foreground" /></label>
              <Button type="button" className="min-h-11 w-full bg-[#0EA5E9] font-bold text-white hover:bg-[#0284C7]" onClick={() => updateShipping.mutate({ orderId: order.id, courierName, trackingProvider, trackingNumber, trackingUrl, shippingStatus: shippingStatus as "pending" | "packed" | "dispatched" | "in_transit" | "out_for_delivery" | "delivered" | "returned", shippingNotes })} disabled={updateShipping.isPending}><Truck className="mr-2 h-4 w-4" />{updateShipping.isPending ? "Saving tracking…" : "Save shipping update"}</Button>
              {trackingProvider === "shiplogic" && trackingNumber.trim() && order.paymentStatus === "paid" && <Button type="button" variant="outline" className="min-h-11 w-full border-[#38BDF8]/40 font-bold text-[#38BDF8]" onClick={() => refreshShiplogic.mutate({ orderId: order.id })} disabled={refreshShiplogic.isPending}><RefreshCw className={`mr-2 h-4 w-4 ${refreshShiplogic.isPending ? "animate-spin" : ""}`} />{refreshShiplogic.isPending ? "Refreshing Flash tracking…" : "Refresh Flash tracking"}</Button>}
            </div>
          </div>
        </div>
      )}

      <QuoteConversation orderId={order.id} comments={order.comments} viewerRole="admin" />

      {(order.quoteNotes || order.rejectionReason) && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-bold mb-2">Quote Review Notes</h2>
          {order.quoteNotes && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.quoteNotes}</p>}
          {order.rejectionReason && <p className="text-sm text-red-300 whitespace-pre-wrap">Rejection reason: {order.rejectionReason}</p>}
        </div>
      )}

      {/* Tracking Notes */}
      {order.trackingNotes && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-4 w-4 text-primary" />
            <h2 className="font-bold">Tracking Notes</h2>
          </div>
          <p className="text-sm text-muted-foreground">{order.trackingNotes}</p>
        </div>
      )}
    </div>
  );
}
