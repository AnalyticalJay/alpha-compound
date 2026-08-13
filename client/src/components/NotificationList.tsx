import { trpc } from "@/lib/trpc";
import { Bell, CheckCircle2, CreditCard, FileText, Package, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const icons = {
  quote: FileText,
  payment: CreditCard,
  shipping: Package,
  invoice: FileText,
  system: ShieldCheck,
};

export default function NotificationList({ admin = false }: { admin?: boolean }) {
  const utils = trpc.useUtils();
  const notifications = trpc.notifications.list.useQuery();
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
    onError: (error) => toast.error(error.message),
  });

  const items = notifications.data ?? [];
  const unreadCount = items.filter((item) => !item.readAt).length;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#0EA5E9]">{admin ? "Operations" : "Account"}</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Notifications</h1>
          <p className="mt-2 text-sm text-[#94A3B8]">Workflow updates for quotes, payments, invoices, and delivery.</p>
        </div>
        <div className="rounded-lg border border-[#0EA5E9]/30 bg-[#0EA5E9]/5 px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#38BDF8]">
          {unreadCount} unread
        </div>
      </div>

      {notifications.isLoading && <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl border border-[#1E293B] bg-[#111111]" />)}</div>}
      {!notifications.isLoading && items.length === 0 && <div className="rounded-xl border border-dashed border-[#1E293B] bg-[#111111]/60 p-10 text-center"><Bell className="mx-auto h-8 w-8 text-[#0EA5E9]" /><p className="mt-3 font-bold text-white">You’re all caught up</p><p className="mt-1 text-sm text-[#64748B]">New workflow updates will appear here.</p></div>}
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = icons[item.type as keyof typeof icons] ?? Bell;
          return <article key={item.id} className={`rounded-xl border p-4 transition ${item.readAt ? "border-[#1E293B] bg-[#111111]" : "border-[#0EA5E9]/40 bg-[#0EA5E9]/5 shadow-lg shadow-cyan-950/10"}`}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0EA5E9]/15 text-[#38BDF8]"><Icon className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-bold text-white">{item.title}</h2><p className="mt-1 text-sm leading-relaxed text-[#94A3B8]">{item.body}</p></div><time className="shrink-0 text-xs text-[#64748B]">{format(new Date(item.createdAt), "d MMM yyyy, HH:mm")}</time></div>{item.orderId && <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#64748B]">Quote #{item.orderId}</p>}</div>
              {!item.readAt && <button type="button" className="shrink-0 rounded-md p-1.5 text-[#38BDF8] transition hover:bg-[#0EA5E9]/10" aria-label={`Mark ${item.title} as read`} onClick={() => markRead.mutate({ notificationId: item.id })}><CheckCircle2 className="h-4 w-4" /></button>}
            </div>
          </article>;
        })}
      </div>
    </section>
  );
}
