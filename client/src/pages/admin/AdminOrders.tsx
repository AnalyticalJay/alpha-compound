import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, Eye } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

const ORDER_STATUSES = ["pending", "paid", "processing", "shipped", "completed", "cancelled"] as const;

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

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const ordersQuery = trpc.orders.adminList.useQuery();
  const updateStatus = trpc.orders.adminUpdateStatus.useMutation({
    onSuccess: () => { utils.orders.adminList.invalidate(); toast.success("Order status updated"); },
    onError: (e) => toast.error(e.message),
  });

  const orders = ordersQuery.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black" >
          Order <span style={{ color: "#0EA5E9" }}>Management</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{orders.length} total orders</p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {ordersQuery.isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-accent/20 rounded animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead>
                <tr className="border-b border-border/40 text-xs text-muted-foreground">
                  <th className="text-left p-4 font-medium">Order</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Payment</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/20 hover:bg-accent/10 transition-colors">
                    <td className="p-4 text-sm font-medium">#{order.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium">{order.userFullName ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-primary">
                      R{parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <Badge className={`text-xs ${order.paymentStatus === "paid" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4"><StatusBadge status={order.status} /></td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "d MMM yyyy")}
                    </td>
                    <td className="p-4">
                      <Select
                        value={order.status}
                        onValueChange={(val) =>
                          updateStatus.mutate({ orderId: order.id, status: val as typeof ORDER_STATUSES[number] })
                        }
                      >
                        <SelectTrigger className="h-10 w-32 bg-input border-border text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
