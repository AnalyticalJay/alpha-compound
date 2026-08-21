import { Check, CheckCircle2, ClipboardList, MapPinCheckInside, PackageCheck, RotateCcw, Send, Truck } from "lucide-react";
import { format } from "date-fns";
import { SHIPPING_MILESTONES, getShippingProgress, isShippingMilestoneComplete, type ShippingStatus } from "@shared/shippingTimeline";

const icons = { pending: ClipboardList, packed: PackageCheck, dispatched: Send, in_transit: Truck, out_for_delivery: MapPinCheckInside, delivered: CheckCircle2 } as const;

export default function DeliveryTimeline({ status, updatedAt }: { status: ShippingStatus; updatedAt?: Date | string | null }) {
  const progress = getShippingProgress(status);

  return (
    <div className="mt-5 rounded-xl border border-border/30 bg-background/20 p-4 sm:p-5" aria-label="Delivery progress timeline">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0EA5E9]">Delivery journey</p>
          <p className="mt-1 text-xs text-muted-foreground">Live status from the fulfilment record</p>
        </div>
        {updatedAt && <p className="text-[11px] text-muted-foreground">Updated {format(new Date(updatedAt), "d MMM yyyy, HH:mm")}</p>}
      </div>

      {progress.isReturned ? (
        <div className="flex items-start gap-3 rounded-lg border border-[#E11D48]/30 bg-[#E11D48]/10 p-3">
          <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-[#FB7185]" />
          <div>
            <p className="font-bold text-[#FDA4AF]">Returned to sender</p>
            <p className="mt-1 text-xs text-[#FDA4AF]/80">This shipment was marked as returned. Contact support for the next step.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-6 sm:gap-2">
          {SHIPPING_MILESTONES.map((milestone, index) => {
            const complete = isShippingMilestoneComplete(status, index);
            const current = !complete && index === progress.currentIndex + 1;
            const Icon = icons[milestone.status];
            const circleClass = complete
              ? "border-[#10B981] bg-[#10B981]/15 text-[#34D399]"
              : current
                ? "border-[#0EA5E9] bg-[#0EA5E9]/15 text-[#38BDF8]"
                : "border-border bg-background text-muted-foreground";
            const labelClass = complete
              ? "text-[#34D399]"
              : current
                ? "text-[#38BDF8]"
                : "text-muted-foreground";
            return (
              <div key={milestone.status} className="relative flex gap-3 sm:block sm:text-center">
                <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:mx-auto ${circleClass}`}>
                  <Icon className="h-4 w-4" />
                  {complete && <Check className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#10B981] p-0.5 text-black" />}
                </div>
                {index < SHIPPING_MILESTONES.length - 1 && <span className={`absolute left-[18px] top-9 h-[calc(100%+1rem)] w-0.5 sm:left-[calc(50%+18px)] sm:top-[18px] sm:h-0.5 sm:w-[calc(100%-36px)] ${complete ? "bg-[#10B981]/60" : "bg-border"}`} aria-hidden="true" />}
                <div className="min-w-0 pb-1 sm:mt-3">
                  <p className={`text-xs font-black uppercase tracking-wide ${labelClass}`}>{milestone.label}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{current ? "Current stage" : milestone.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
