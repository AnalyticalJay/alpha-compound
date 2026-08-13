import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock3, CreditCard, FileClock, ShieldCheck, XCircle } from "lucide-react";
import { format } from "date-fns";
import { buildPaymentHistory, type PaymentHistoryEventLike, type PaymentHistoryOrderLike } from "../../../shared/paymentHistory";

type PaymentHistoryPanelProps = {
  order: PaymentHistoryOrderLike;
  events?: PaymentHistoryEventLike[];
  audience?: "customer" | "admin";
};

function eventIcon(eventType: string) {
  if (eventType === "payment_received") return <CheckCircle2 className="h-4 w-4" />;
  if (eventType === "payment_failed" || eventType === "quote_rejected") return <XCircle className="h-4 w-4" />;
  if (eventType === "payfast_handoff") return <ShieldCheck className="h-4 w-4" />;
  if (eventType === "payment_method_selected") return <CreditCard className="h-4 w-4" />;
  if (eventType === "quote_approved") return <CheckCircle2 className="h-4 w-4" />;
  return <Clock3 className="h-4 w-4" />;
}

function eventTone(eventType: string) {
  if (eventType === "payment_received" || eventType === "quote_approved") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  if (eventType === "payment_failed" || eventType === "quote_rejected") return "border-rose-400/30 bg-rose-400/10 text-rose-300";
  if (eventType === "payfast_handoff") return "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";
  return "border-slate-500/30 bg-slate-500/10 text-slate-300";
}

function prettyStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function PaymentHistoryPanel({ order, events = [], audience = "customer" }: PaymentHistoryPanelProps) {
  const history = buildPaymentHistory(order, events);
  const title = audience === "admin" ? "Payment Transaction History" : "Payment Status History";

  return (
    <section className="glass-card rounded-xl p-5 sm:p-6" aria-labelledby={`payment-history-${order.id}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#0EA5E9]/25 bg-[#0EA5E9]/10 text-[#38BDF8]"><FileClock className="h-5 w-5" /></span>
          <div>
            <h2 id={`payment-history-${order.id}`} className="font-bold">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{audience === "admin" ? "A chronological audit of real payment and review events for this quote." : "Follow each recorded step from quote submission to payment confirmation."}</p>
          </div>
        </div>
        <Badge className="w-fit border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 text-[10px] uppercase tracking-wide text-[#7DD3FC]">{prettyStatus(order.paymentStatus)}</Badge>
      </div>

      <ol className="mt-6 space-y-0">
        {history.map((entry, index) => (
          <li key={String(entry.id)} className="relative flex gap-3 pb-5 last:pb-0 sm:gap-4">
            {index < history.length - 1 && <span aria-hidden="true" className="absolute left-[18px] top-9 h-[calc(100%-1.25rem)] w-px bg-border/60" />}
            <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${eventTone(entry.eventType)}`}>{eventIcon(entry.eventType)}</span>
            <div className="min-w-0 flex-1 rounded-lg border border-border/30 bg-background/30 p-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <p className="text-sm font-bold capitalize text-foreground">{entry.label}</p>
                <time className="shrink-0 text-[11px] text-muted-foreground" dateTime={new Date(entry.createdAt).toISOString()}>{format(new Date(entry.createdAt), "d MMM yyyy, HH:mm")}</time>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{entry.description}</p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <span>{prettyStatus(entry.paymentStatus)}</span>
                {entry.paymentMethod && <span>{entry.paymentMethod}</span>}
                {entry.amount !== null && entry.amount !== undefined && <span>R{parseFloat(String(entry.amount)).toFixed(2)}</span>}
                {entry.reference && <span className="font-mono normal-case">Ref {entry.reference}</span>}
                {entry.source === "derived" && <span className="text-amber-300">Legacy snapshot</span>}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
