import { Link } from "wouter";
import { Shield, Lock, Truck, MapPin, Send, PackageCheck, WalletCards } from "lucide-react";

const FOOTER_DELIVERY_ITEMS = [
  { icon: MapPin, color: "#0EA5E9", eyebrow: "Port Elizabeth", title: "Free delivery", detail: "No minimum order" },
  { icon: Send, color: "#E11D48", eyebrow: "Nationwide", title: "R150 flat rate", detail: "Transparent delivery pricing" },
  { icon: PackageCheck, color: "#0EA5E9", eyebrow: "Packaging", title: "Discreet delivery", detail: "Plain, unmarked packaging" },
  { icon: WalletCards, color: "#E11D48", eyebrow: "Payment", title: "EFT or PayFast", detail: "Secure ZAR payment options" },
] as const;

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[#1E293B] mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded flex items-center justify-center overflow-hidden border border-[#1E293B] bg-black">
                <img src="/manus-storage/anabolics-africa-logo_2013ad4b.png" alt="Anabolics Africa logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="font-black text-white text-base tracking-widest uppercase">Anabolics</span>
                <span className="font-black text-base tracking-widest uppercase ml-1.5" style={{ color: "#0EA5E9" }}>Africa</span>
              </div>
            </div>
            <p className="text-[#64748B] text-sm leading-relaxed max-w-xs mb-5">
              Curated HD Labs and BP Pharma catalogue. Restricted access platform for approved members 18+.
            </p>
            <div className="flex gap-5">
              {[
                { icon: Shield, label: "Verified" },
                { icon: Lock, label: "Secure" },
                { icon: Truck, label: "Discreet" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[#64748B]">
                  <Icon className="h-3.5 w-3.5 text-[#0EA5E9]" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#0EA5E9" }}>Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "Products" },
                { href: "/account", label: "My Account" },
                { href: "/cart", label: "Quote Cart" },
                { href: "/register", label: "Apply for Access" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-[#64748B] hover:text-white text-sm no-underline transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery Info */}
          <div data-testid="footer-delivery-info">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest" style={{ color: "#E11D48" }}>Delivery Info</h4>
            <ul className="grid gap-4">
              {FOOTER_DELIVERY_ITEMS.map(({ icon: Icon, color, eyebrow, title, detail }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: `linear-gradient(145deg, ${color}24, ${color}0A)` }}>
                    <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="block text-[9px] font-black uppercase tracking-[0.16em]" style={{ color }}>{eyebrow}</span>
                    <span className="mt-0.5 block text-xs font-black uppercase tracking-wide text-white">{title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#64748B]">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* HD Labs dual stripe + bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#1E293B]">
          <div className="h-[2px] w-24 mb-5" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[#475569] text-xs">
              © {new Date().getFullYear()} Anabolics Africa. All rights reserved.
            </p>
            <p className="text-[#475569] text-xs">
              Powered by <span style={{ color: "#0EA5E9" }} className="font-bold">HD Labs</span>. For adults 18+ only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
