import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CreditCard, ExternalLink, RotateCcw, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const PAYMENT_FILTERS = ["all", "pending", "awaiting_eft", "paid", "failed"] as const;

type PaymentFilter = typeof PAYMENT_FILTERS[number];

function PaymentStatusBadge({ status }: { status: string }) {
  const tone = status === "paid"
    ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
    : status === "failed"
      ? "bg-rose-500/15 text-rose-300 border-rose-400/30"
      : status === "awaiting_eft"
        ? "bg-orange-500/15 text-orange-300 border-orange-400/30"
        : "bg-slate-500/15 text-slate-300 border-slate-400/30";
  return <Badge className={`border text-[10px] uppercase tracking-wide ${tone}`}>{status.replaceAll("_", " ")}</Badge>;
}

export default function AdminPayments() {
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const ordersQuery = trpc.orders.adminList.useQuery();
  const itnQuery = trpc.admin.payfastItnAttempts.useQuery(undefined, { refetchInterval: 30000 });
  const retryItn = trpc.admin.retryPayfastItn.useMutation({ onSuccess: () => itnQuery.refetch() });
  const orders = ordersQuery.data ?? [];
  const filteredOrders = useMemo(() => filter === "all" ? orders : orders.filter((order) => order.paymentStatus === filter), [filter, orders]);
  const paidCount = orders.filter((order) => order.paymentStatus === "paid").length;
  const awaitingCount = orders.filter((order) => order.paymentStatus === "awaiting_eft" || order.status === "awaiting_payment").length;
  const totalValue = orders.filter((order) => order.paymentStatus === "paid").reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 h-[3px] w-16" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />
          <h1 className="text-2xl font-black">Payment <span style={{ color: "#0EA5E9" }}>History</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">Track genuine EFT and PayFast transaction states across customer quotes.</p>
        </div>
        <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /><span className="text-xs text-muted-foreground">Server-recorded payment data</span></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass-card rounded-xl p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Transactions</p><p className="mt-2 text-2xl font-black text-white">{orders.length}</p></div>
        <div className="glass-card rounded-xl p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Paid quotes</p><p className="mt-2 text-2xl font-black text-emerald-300">{paidCount}</p></div>
        <div className="glass-card rounded-xl p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Paid value</p><p className="mt-2 text-2xl font-black text-[#38BDF8]">R{totalValue.toFixed(2)}</p></div>
      </div>

      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-4 w-4 text-orange-300" /><div><h2 className="font-bold">PayFast callback recovery</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Server-validated callbacks are retained here if the order update fails, so an administrator can safely retry without charging the customer again.</p></div></div>
          <span className="text-xs text-muted-foreground">{(itnQuery.data ?? []).filter((attempt) => attempt.processingStatus !== "processed").length} need attention</span>
        </div>
        {itnQuery.isLoading ? <div className="h-16 animate-pulse rounded-lg bg-accent/20" /> : (itnQuery.data ?? []).length === 0 ? <p className="rounded-lg border border-border/30 bg-background/20 p-4 text-xs text-muted-foreground">No PayFast callback attempts have been recorded yet.</p> : <div className="space-y-3">{(itnQuery.data ?? []).slice(0, 8).map((attempt) => {
          const canRetry = attempt.validationStatus === "valid" && attempt.processingStatus !== "processed";
          return <div key={attempt.id} className="rounded-lg border border-border/30 bg-background/20 p-3 sm:p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-xs font-black uppercase tracking-wide text-primary">Callback #{attempt.id}</p><p className="mt-1 break-all text-sm font-bold">{attempt.payfastReference ?? "No payment reference"}</p><p className="mt-1 text-xs text-muted-foreground">{attempt.paymentStatus} · {attempt.amountGross ? `R${Number(attempt.amountGross).toFixed(2)}` : "amount unavailable"} · {format(new Date(attempt.createdAt), "d MMM yyyy, HH:mm")}</p></div><div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wide"><span className={attempt.validationStatus === "valid" ? "rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-emerald-300" : "rounded border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-rose-300"}>{attempt.validationStatus} callback</span><span className="rounded border border-border/40 px-2 py-1 text-muted-foreground">{attempt.processingStatus}</span></div></div>{attempt.failureReason && <p className="mt-2 text-xs text-orange-200">{attempt.failureReason}</p>}{canRetry && <Button type="button" size="sm" className="mt-3 min-h-10 gap-2 bg-[#0EA5E9] text-xs font-bold uppercase tracking-wide text-white hover:bg-[#0284C7]" disabled={retryItn.isPending} onClick={() => retryItn.mutate({ attemptId: attempt.id })}><RotateCcw className={`h-3.5 w-3.5 ${retryItn.isPending ? "animate-spin" : ""}`} />{retryItn.isPending ? "Retrying…" : "Retry order update"}</Button>}</div>;
        })}</div>}
      </div>

      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2"><WalletCards className="h-4 w-4 text-primary" /><h2 className="font-bold">Transaction ledger</h2></div>
          <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{awaitingCount} awaiting action</span><Select value={filter} onValueChange={(value) => setFilter(value as PaymentFilter)}><SelectTrigger className="h-9 w-40 bg-background/50 text-xs"><SelectValue /></SelectTrigger><SelectContent>{PAYMENT_FILTERS.map((option) => <SelectItem key={option} value={option} className="text-xs capitalize">{option === "all" ? "All statuses" : option.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>
        </div>

        {ordersQuery.isLoading ? <div className="space-y-3">{[...Array(4)].map((_, index) => <div key={index} className="h-16 animate-pulse rounded-lg bg-accent/20" />)}</div> : filteredOrders.length === 0 ? <div className="py-12 text-center"><CreditCard className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-30" /><p className="text-sm text-muted-foreground">No payment records match this filter.</p></div> : <>
          <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px]"><thead><tr className="border-b border-border/40 text-left text-xs text-muted-foreground"><th className="p-3 font-medium">Quote</th><th className="p-3 font-medium">Customer</th><th className="p-3 font-medium">Method</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Updated</th><th className="p-3" /></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id} className="border-b border-border/20"><td className="p-3 text-sm font-bold text-primary">#{order.id}</td><td className="p-3"><p className="text-sm font-medium">{order.userFullName ?? "—"}</p><p className="text-xs text-muted-foreground">{order.userEmail}</p></td><td className="p-3 text-xs uppercase text-muted-foreground">{order.paymentMethod ?? "—"}</td><td className="p-3 text-sm font-bold">R{parseFloat(order.totalAmount).toFixed(2)}</td><td className="p-3"><PaymentStatusBadge status={order.paymentStatus} /></td><td className="p-3 text-xs text-muted-foreground">{format(new Date(order.updatedAt ?? order.createdAt), "d MMM yyyy, HH:mm")}</td><td className="p-3 text-right"><Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">History <ExternalLink className="h-3 w-3" /></Link></td></tr>)}</tbody></table></div>
          <div className="space-y-3 md:hidden">{filteredOrders.map((order) => <Link key={order.id} href={`/admin/orders/${order.id}`} className="block rounded-lg border border-border/30 bg-background/30 p-4 no-underline"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-primary">Quote #{order.id}</p><p className="mt-1 text-xs text-muted-foreground">{order.userFullName ?? "—"}</p></div><PaymentStatusBadge status={order.paymentStatus} /></div><div className="mt-3 flex items-center justify-between text-xs"><span className="uppercase text-muted-foreground">{order.paymentMethod ?? "No method"}</span><span className="font-bold text-white">R{parseFloat(order.totalAmount).toFixed(2)}</span></div><p className="mt-2 text-[11px] text-muted-foreground">Open transaction history <ExternalLink className="ml-1 inline h-3 w-3" /></p></Link>)}</div>
        </>}
      </div>
    </div>
  );
}
