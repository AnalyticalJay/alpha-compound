import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { Shield, Truck, CreditCard, Lock, ChevronRight, Star, Package } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const isPending = (user as any)?.status === "pending";

  const featuredQuery = trpc.products.list.useQuery(
    { featuredOnly: true },
    { enabled: isApproved }
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Hex pattern background */}
        <div className="absolute inset-0 hex-pattern opacity-60" />

        {/* Blue glow top-right */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #0EA5E9 0%, transparent 70%)" }} />

        {/* Red glow bottom-left */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #E11D48 0%, transparent 70%)" }} />

        <div className="container relative z-10 py-24 md:py-36">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 mb-6">
              <Lock className="h-3.5 w-3.5 text-[#0EA5E9]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#0EA5E9]">Restricted Access Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.9] mb-6">
              <span className="text-white">Unlock Your</span>
              <br />
              <span className="text-white">Next </span>
              <span style={{ color: "#0EA5E9" }}>Phase</span>
              <br />
              <span className="text-white">of Performance</span>
            </h1>

            <p className="text-[#94A3B8] text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              Premium pharmaceutical-grade compounds by <strong className="text-white">HD Labs</strong>. Controlled access. Built for serious athletes who demand the highest quality.
            </p>

            {/* CTA */}
            {!isAuthenticated ? (
              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="no-underline">
                  <Button size="lg" className="text-white font-bold uppercase tracking-widest px-8 h-12"
                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                    Apply for Access
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/login" className="no-underline">
                  <Button size="lg" variant="outline"
                    className="border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#0EA5E9]/50 font-bold uppercase tracking-widest px-8 h-12 bg-transparent">
                    Sign In
                  </Button>
                </Link>
              </div>
            ) : isPending ? (
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded border border-[#E11D48]/30 bg-[#E11D48]/10">
                <div className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                <span className="text-[#E11D48] font-bold uppercase tracking-wide text-sm">Application Pending Review</span>
              </div>
            ) : isApproved ? (
              <Link href="/products" className="no-underline">
                <Button size="lg" className="text-white font-bold uppercase tracking-widest px-8 h-12"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                  Browse Products
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            ) : null}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-[#1E293B]">
              {[
                { icon: Shield, label: "Verified Products" },
                { icon: CreditCard, label: "Secure Payments" },
                { icon: Truck, label: "Discreet Delivery" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-[#64748B]">
                  <Icon className="h-4 w-4 text-[#0EA5E9]" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products (approved only) ───────────────────────────── */}
      {isApproved && (
        <section className="py-20 border-t border-[#1E293B]">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-0.5" style={{ background: "#E11D48" }} />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#E11D48]">Featured</span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                  Top <span style={{ color: "#0EA5E9" }}>Compounds</span>
                </h2>
              </div>
              <Link href="/products" className="no-underline">
                <Button variant="ghost" size="sm"
                  className="text-[#0EA5E9] hover:text-white hover:bg-[#0EA5E9]/10 font-bold uppercase tracking-wide text-xs">
                  View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {featuredQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-72 rounded-lg bg-[#111111] animate-pulse border border-[#1E293B]" />
                ))}
              </div>
            ) : featuredQuery.data && featuredQuery.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {featuredQuery.data.map((product: any) => (
                  <ProductCard key={product.id} product={product} isApproved={isApproved} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-[#64748B]">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No featured products yet.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Features Grid ────────────────────────────────────────────────── */}
      <section className={`py-20 ${isApproved ? "" : "border-t border-[#1E293B]"}`}>
        <div className="container">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-0.5" style={{ background: "#E11D48" }} />
              <span className="text-xs font-bold uppercase tracking-widest text-[#E11D48]">Why Alpha Compound</span>
              <div className="w-8 h-0.5" style={{ background: "#0EA5E9" }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
              Built for <span style={{ color: "#0EA5E9" }}>Serious</span> Athletes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                color: "#0EA5E9",
                title: "Pharmaceutical Grade",
                desc: "Every compound is sourced directly from HD Labs — tested, verified, and manufactured to the highest pharmaceutical standards.",
              },
              {
                icon: Lock,
                color: "#E11D48",
                title: "Gated Access",
                desc: "Not open to the public. Every account is manually reviewed and approved before gaining access to pricing and purchasing.",
              },
              {
                icon: Truck,
                color: "#0EA5E9",
                title: "Discreet Delivery",
                desc: "Free delivery to Port Elizabeth. Flat R150 nationwide. All orders shipped in plain, unmarked packaging.",
              },
              {
                icon: CreditCard,
                color: "#E11D48",
                title: "Secure Payments",
                desc: "All transactions processed securely via PayFast in South African Rand. No foreign exchange fees.",
              },
              {
                icon: Star,
                color: "#0EA5E9",
                title: "HD Labs Exclusive",
                desc: "Authorised distributor of HD Labs products. Authentic compounds with full batch verification available.",
              },
              {
                icon: Package,
                color: "#E11D48",
                title: "100+ Products",
                desc: "Injectables, orals, peptides, ancillaries and PCT — everything you need in one controlled-access platform.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title}
                className="p-6 rounded-lg border border-[#1E293B] bg-[#111111] hover:border-[#0EA5E9]/30 transition-colors group">
                <div className="w-10 h-10 rounded flex items-center justify-center mb-4"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="text-white font-bold uppercase tracking-wide text-sm mb-2">{title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="py-16 border-t border-[#1E293B]">
          <div className="container">
            <div className="relative rounded-xl overflow-hidden p-10 md:p-16 text-center"
              style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #0d1a2e 50%, #0A0A0A 100%)", border: "1px solid #0EA5E9/20" }}>
              {/* Hex texture */}
              <div className="absolute inset-0 hex-pattern opacity-40" />
              {/* Blue glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full opacity-15 blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(ellipse, #0EA5E9 0%, transparent 70%)" }} />

              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
                  Ready to <span style={{ color: "#0EA5E9" }}>Elevate</span>?
                </h2>
                <p className="text-[#94A3B8] text-lg mb-8 max-w-xl mx-auto">
                  Apply for access today. Approvals are reviewed within 24 hours.
                </p>
                <Link href="/register" className="no-underline">
                  <Button size="lg" className="text-white font-bold uppercase tracking-widest px-10 h-12"
                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                    Apply Now
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
