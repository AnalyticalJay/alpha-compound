import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from "lucide-react";
import { Link, useParams } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/_core/hooks/useAuth";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    paid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    processing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    shipped: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  };
  return <Badge className={`${map[status] ?? "bg-muted text-muted-foreground"} text-xs capitalize`}>{status}</Badge>;
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated } = useAuth();

  const orderQuery = trpc.orders.detail.useQuery(
    { orderId: parseInt(orderId ?? "0") },
    { enabled: isAuthenticated && !!orderId }
  );
  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="max-w-3xl mx-auto space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-accent/20 rounded-xl animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-12 text-center">
          <p className="text-muted-foreground">Order not found.</p>
          <Link href="/account">
            <Button className="mt-4 gold-gradient text-black font-bold">Back to Account</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/account">
              <button className="p-1.5 rounded-md hover:bg-accent">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
                Order <span className="gold-text">#{order.id}</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Placed {format(new Date(order.createdAt), "d MMMM yyyy")}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid gap-6">
            {/* Order Items */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-4 w-4 text-primary" />
                <h2 className="font-bold">Items Ordered</h2>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm text-primary">
                      R{(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Details */}
            {order.shipping && (
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h2 className="font-bold">Shipping Address</h2>
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shipping.fullName}</p>
                  <p className="text-muted-foreground">{order.shipping.addressLine1}</p>
                  {order.shipping.addressLine2 && (
                    <p className="text-muted-foreground">{order.shipping.addressLine2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {order.shipping.city}, {order.shipping.postalCode}
                  </p>
                  <p className="text-muted-foreground">{order.shipping.country}</p>
                  <p className="text-muted-foreground mt-2">📞 {order.shipping.phone}</p>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4 text-primary" />
                <h2 className="font-bold">Payment Summary</h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R{(parseFloat(order.totalAmount) - parseFloat(order.deliveryFee)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Delivery
                  </span>
                  <span>
                    {parseFloat(order.deliveryFee) === 0
                      ? <span className="text-green-400">Free</span>
                      : `R${parseFloat(order.deliveryFee).toFixed(2)}`
                    }
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-border/40 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-primary">R{parseFloat(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge className={`text-xs ${order.paymentStatus === "paid" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>
                    {order.paymentStatus}
                  </Badge>
                </div>
                {order.payfastReference && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-xs">{order.payfastReference}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Notes */}
            {order.trackingNotes && (
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-bold mb-2">Order Notes</h2>
                <p className="text-sm text-muted-foreground">{order.trackingNotes}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
