type HdLabsMarkProps = {
  size?: "sm" | "md";
  className?: string;
};

export default function HdLabsMark({ size = "sm", className = "" }: HdLabsMarkProps) {
  const compact = size === "sm";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="HD Labs">
      <span
        aria-hidden="true"
        className={`${compact ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-xs"} inline-flex shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-[#38BDF8] via-[#0EA5E9] to-[#0284C7] font-black tracking-tight text-white shadow-[0_0_12px_rgba(14,165,233,0.3)]`}
      >
        HD
      </span>
      {!compact && (
        <span className="flex flex-col text-left leading-none">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-white">HD Labs</span>
          <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Pharmaceutical grade</span>
        </span>
      )}
    </span>
  );
}
