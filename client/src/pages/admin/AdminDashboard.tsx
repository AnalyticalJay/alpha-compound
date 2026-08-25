import { AlertTriangle, ArrowRight, BarChart3, CheckCircle, Clock, DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { trpc } from "@/lib/trpc";

const chartTooltipStyle = {
  backgroundColor: "#111111",
  border: "1px solid #1E293B",
  borderRadius: "8px",
  color: "#F8FAFC",
  fontSize: "12px",
};

export default function AdminDashboard() {
  const statsQuery = trpc.admin.stats.useQuery();
  const stats = statsQuery.data;
  const analytics = stats?.analytics;

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400" },
    { label: "Pending Approvals", value: stats?.pendingUsers ?? 0, icon: Clock, color: "text-yellow-400" },
    { label: "New Quotes", value: stats?.pendingQuotes ?? 0, icon: AlertTriangle, color: "text-[#E11D48]" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "text-primary" },
    { label: "Revenue (ZAR)", value: `R${parseFloat(String(stats?.revenue ?? "0")).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-green-400" },
    { label: "Approved Users", value: stats?.approvedUsers ?? 0, icon: CheckCircle, color: "text-green-400" },
  ];

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-black sm:text-3xl">
            Anabolics Africa <span style={{ color: "#0EA5E9" }}>Dashboard</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of the Anabolics Africa platform</p>
        </div>
        <Link href="/admin/orders" className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg border border-[#1E293B] px-3 text-xs font-bold uppercase tracking-wide text-[#94A3B8] transition hover:border-[#0EA5E9]/50 hover:text-white">
          View quote queue <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {(stats?.pendingQuotes ?? 0) > 0 && stats && (
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[#E11D48]/50 bg-[#E11D48]/10 p-4 shadow-[0_0_24px_rgba(225,29,72,0.12)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E11D48]/20 text-[#FDA4AF]"><AlertTriangle className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="break-words text-sm font-black uppercase tracking-wide text-white">New quote request{stats.pendingQuotes === 1 ? "" : "s"} awaiting review</p>
              <p className="mt-1 text-xs leading-relaxed text-[#FDA4AF]">{stats.pendingQuotes} customer quote{stats.pendingQuotes === 1 ? "" : "s"} need{stats.pendingQuotes === 1 ? "s" : ""} your attention.</p>
            </div>
          </div>
          <Link href="/admin/orders" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#E11D48] px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#BE123C] sm:w-auto">
            Review quotes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card min-w-0 rounded-xl p-3 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{card.label}</p>
              <card.icon className={`h-4 w-4 shrink-0 ${card.color}`} />
            </div>
            <p className="truncate text-xl font-black sm:text-2xl">{statsQuery.isLoading ? "—" : card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-6 grid min-w-0 gap-4 xl:grid-cols-2">
        <AnalyticsCard title="Quote Pipeline" subtitle="Current quote requests by stage" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={analytics?.statusBreakdown ?? []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(14,165,233,0.06)" }} />
              <Bar dataKey="count" name="Quotes" fill="#0EA5E9" radius={[5, 5, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        <AnalyticsCard title="Revenue Trend" subtitle="Paid revenue over the latest six months" icon={DollarSign}>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={analytics?.monthlyRevenue ?? []} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E11D48" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [`R${Number(value ?? 0).toFixed(2)}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#E11D48" strokeWidth={2} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      </div>

      <div className="mb-6 grid min-w-0 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AnalyticsCard title="Monthly Activity" subtitle="Quote volume and paid orders" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={analytics?.monthlyRevenue ?? []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="orders" name="Quotes" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="paidOrders" name="Paid" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        <div className="glass-card min-w-0 rounded-xl p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#0EA5E9]" /><h2 className="font-bold">Pipeline Snapshot</h2></div>
          <div className="space-y-3">
            {[
              ["Under review", analytics?.pipeline.submitted ?? 0, "#F59E0B"],
              ["Approved", analytics?.pipeline.approved ?? 0, "#0EA5E9"],
              ["Awaiting payment", analytics?.pipeline.awaitingPayment ?? 0, "#F97316"],
              ["Paid", analytics?.pipeline.paid ?? 0, "#16A34A"],
            ].map(([label, value, color]) => (
              <div key={label as string} className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/30 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2"><span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color as string }} /><span className="truncate text-xs text-muted-foreground">{label as string}</span></div>
                <span className="font-black text-white">{value as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card min-w-0 rounded-xl p-4 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold"><Clock className="h-4 w-4 text-yellow-400" />Pending Approvals</h2>
        <PendingUsersList />
      </div>
    </div>
  );
}

function AnalyticsCard({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: typeof BarChart3; children: React.ReactNode }) {
  return (
    <div className="glass-card min-w-0 overflow-hidden rounded-xl p-4 sm:p-6">
      <div className="mb-2 flex items-start gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0EA5E9]" /><div className="min-w-0"><h2 className="font-bold">{title}</h2><p className="text-xs text-muted-foreground">{subtitle}</p></div></div>
      <div className="-ml-2 min-w-0">{children}</div>
    </div>
  );
}

function PendingUsersList() {
  const usersQuery = trpc.admin.users.useQuery();
  const utils = trpc.useUtils();
  const approve = trpc.admin.approveUser.useMutation({ onSuccess: () => { utils.admin.users.invalidate(); utils.admin.stats.invalidate(); } });
  const reject = trpc.admin.rejectUser.useMutation({ onSuccess: () => { utils.admin.users.invalidate(); utils.admin.stats.invalidate(); } });
  const allUsers = usersQuery.data ?? [];
  const pending = allUsers.filter((u) => u.status === "pending").slice(0, 5);

  if (usersQuery.isLoading) return <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-accent/20" />)}</div>;
  if (pending.length === 0) return <p className="text-sm text-muted-foreground">No pending approvals.</p>;

  return (
    <div className="space-y-2">
      {pending.map((user) => (
        <div key={user.id} className="flex flex-col gap-3 rounded-lg border border-border/40 p-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0EA5E9]/15"><span className="text-xs font-bold text-[#38BDF8]">{user.fullName?.charAt(0) ?? "U"}</span></div><div className="min-w-0"><p className="truncate text-sm font-medium">{user.fullName}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div></div>
          <div className="flex gap-2 sm:shrink-0"><button onClick={() => approve.mutate({ userId: user.id })} className="min-h-10 flex-1 rounded bg-green-500/20 px-3 py-1 text-xs text-green-400 transition-colors hover:bg-green-500/30 sm:flex-none">Approve</button><button onClick={() => reject.mutate({ userId: user.id })} className="min-h-10 flex-1 rounded bg-destructive/20 px-3 py-1 text-xs text-destructive transition-colors hover:bg-destructive/30 sm:flex-none">Reject</button></div>
        </div>
      ))}
    </div>
  );
}
