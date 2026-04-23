import { Link } from "wouter";
import { Shield, Lock, Truck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[#1E293B] mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded flex items-center justify-center font-black text-sm text-white"
                style={{ background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)" }}>
                AC
              </div>
              <div>
                <span className="font-black text-white text-base tracking-widest uppercase">Alpha</span>
                <span className="font-black text-base tracking-widest uppercase ml-1.5" style={{ color: "#0EA5E9" }}>Compound</span>
              </div>
            </div>
            <p className="text-[#64748B] text-sm leading-relaxed max-w-xs mb-5">
              Authorised distributor of HD Labs pharmaceutical-grade compounds. Restricted access platform for verified athletes only.
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
                { href: "/cart", label: "Cart" },
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
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#E11D48" }}>Delivery Info</h4>
            <ul className="space-y-2.5 text-sm text-[#64748B]">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: "#0EA5E9" }}>✓</span>
                <span>Port Elizabeth — <strong className="text-white">FREE</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: "#0EA5E9" }}>✓</span>
                <span>Nationwide — <strong className="text-white">R150 flat</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: "#0EA5E9" }}>✓</span>
                <span>Discreet packaging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: "#0EA5E9" }}>✓</span>
                <span>PayFast — ZAR only</span>
              </li>
            </ul>
          </div>
        </div>

        {/* HD Labs dual stripe + bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#1E293B]">
          <div className="h-[2px] w-24 mb-5" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[#475569] text-xs">
              © {new Date().getFullYear()} Alpha Compound. All rights reserved.
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
