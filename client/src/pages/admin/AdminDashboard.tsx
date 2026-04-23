import { trpc } from "@/lib/trpc";
import { Users, Package, ShoppingBag, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const statsQuery = trpc.admin.stats.useQuery();
  const stats = statsQuery.data;

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400" },
    { label: "Pending Approvals", value: stats?.pendingUsers ?? 0, icon: Clock, color: "text-yellow-400" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "text-primary" },
    { label: "Revenue (ZAR)", value: `R${parseFloat(String(stats?.revenue ?? "0")).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-green-400" },
    { label: "Approved Users", value: stats?.approvedUsers ?? 0, icon: CheckCircle, color: "text-green-400" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black" >
          Admin <span style={{ color: "#0EA5E9" }}>Dashboard</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of Alpha Compound platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="text-2xl font-black">{statsQuery.isLoading ? "—" : card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Pending Users */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-400" />
          Pending Approvals
        </h2>
        <PendingUsersList />
      </div>
    </div>
  );
}

function PendingUsersList() {
  const usersQuery = trpc.admin.users.useQuery();
  const utils = trpc.useUtils();

  const approve = trpc.admin.approveUser.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
      utils.admin.stats.invalidate();
    },
  });

  const reject = trpc.admin.rejectUser.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
      utils.admin.stats.invalidate();
    },
  });

  const allUsers = usersQuery.data ?? [];
  const pending = allUsers.filter((u) => u.status === "pending").slice(0, 5);

  if (usersQuery.isLoading) {
    return <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-accent/20 rounded animate-pulse" />)}</div>;
  }

  if (pending.length === 0) {
    return <p className="text-sm text-muted-foreground">No pending approvals.</p>;
  }

  return (
    <div className="space-y-2">
      {pending.map((user) => (
        <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
            <span className="text-black font-bold text-xs">{user.fullName?.charAt(0) ?? "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => approve.mutate({ userId: user.id })}
              className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => reject.mutate({ userId: user.id })}
              className="text-xs px-2 py-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
