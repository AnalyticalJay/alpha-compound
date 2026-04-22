import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
  if (status === "rejected") return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Rejected</Badge>;
  return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending Approval</Badge>;
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Pending" },
    paid: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Paid" },
    processing: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "Processing" },
    shipped: { color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", label: "Shipped" },
    delivered: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Delivered" },
    cancelled: { color: "bg-destructive/20 text-destructive border-destructive/30", label: "Cancelled" },
  };
  const s = map[status] ?? { color: "bg-muted text-muted-foreground", label: status };
  return <Badge className={s.color}>{s.label}</Badge>;
}

export default function Account() {
  const { tab } = useParams<{ tab?: string }>();
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const ordersQuery = trpc.orders.myOrders.useQuery(undefined, {
    enabled: isAuthenticated && (user as any)?.status === "approved",
  });
  const orders = ordersQuery.data ?? [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container text-center py-24">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <Link href="/login"><Button className="gold-gradient text-black font-bold">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  const activeTab = tab ?? "profile";
  const u = user as any;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="container py-8">
          <h1 className="text-3xl font-black mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            My <span className="gold-text">Account</span>
          </h1>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="glass-card rounded-xl p-4 h-fit">
              <div className="flex items-center gap-3 mb-6 p-3">
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                  <span className="text-black font-bold text-sm">{u?.fullName?.charAt(0) ?? "U"}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{u?.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{u?.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "orders", label: "Orders", icon: ShoppingBag },
                ].map((item) => (
                  <Link
                    key={item.id}
                    href={`/account/${item.id}`}
                    className="no-underline"
                  >
                    <button
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        activeTab === item.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      <ChevronRight className="h-3 w-3 ml-auto" />
                    </button>
                  </Link>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="glass-card rounded-xl p-6 mb-6">
                    <h2 className="font-bold text-lg mb-6">Account Status</h2>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/30">
                      <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center shrink-0">
                        {u?.status === "approved" ? (
                          <CheckCircle className="h-6 w-6 text-black" />
                        ) : u?.status === "rejected" ? (
                          <XCircle className="h-6 w-6 text-black" />
                        ) : (
                          <Clock className="h-6 w-6 text-black" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={u?.status ?? "pending"} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {u?.status === "approved"
                            ? "Your account is approved. You have full access to the catalog."
                            : u?.status === "rejected"
                            ? "Your application was not approved. Contact support for more information."
                            : "Your application is under review. Typically approved within 24 hours."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-6">
                    <h2 className="font-bold text-lg mb-6">Profile Details</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { label: "Full Name", value: u?.fullName },
                        { label: "Email", value: u?.email },
                        { label: "Phone", value: u?.phone ?? "—" },
                        { label: "City", value: u?.city ?? "—" },
                        { label: "Member Since", value: u?.createdAt ? format(new Date(u.createdAt), "d MMM yyyy") : "—" },
                        { label: "Role", value: u?.role === "admin" ? "Administrator" : "Member" },
                      ].map((field) => (
                        <div key={field.label} className="p-3 rounded-lg bg-accent/20">
                          <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                          <p className="text-sm font-medium">{field.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "orders" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="glass-card rounded-xl p-6">
                    <h2 className="font-bold text-lg mb-6">Order History</h2>
                    {ordersQuery.isLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-accent/20 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                        <p className="text-muted-foreground">No orders yet</p>
                        <Link href="/products" className="mt-4 inline-block">
                          <Button size="sm" className="gold-gradient text-black font-semibold">Browse Products</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <div key={order.id} className="flex items-center gap-4 p-4 rounded-lg border border-border/40 hover:border-primary/20 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">Order #{order.id}</span>
                                <OrderStatusBadge status={order.status} />
                              </div>
              <p className="text-xs text-muted-foreground">
                              {format(new Date(order.createdAt), "d MMM yyyy")}
                            </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">R{parseFloat(order.totalAmount).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
