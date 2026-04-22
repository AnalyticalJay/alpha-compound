import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Package,
  Eye,
  Lock,
  CheckCircle,
  ArrowRight,
  Star,
  Truck,
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const isApproved = (user as any)?.status === "approved";

  const featuredQuery = trpc.products.list.useQuery({ featuredOnly: true });
  const featured = featuredQuery.data?.slice(0, 6) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, oklch(0.78 0.12 85) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.78 0.12 85) 0%, transparent 40%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, oklch(0.78 0.12 85) 40px, oklch(0.78 0.12 85) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, oklch(0.78 0.12 85) 40px, oklch(0.78 0.12 85) 41px)`,
          }}
        />

        <div className="container relative z-10 pt-24 pb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-6">
              <Lock className="h-3 w-3" />
              Restricted Access Platform
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Unlock Your Next{" "}
              <span className="gold-text">Phase of</span>
              <br />
              Performance
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
            >
              Premium compounds. Controlled access. Built for serious athletes who demand the highest quality from HD Labs.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              {!isAuthenticated ? (
                <>
                  <Link href="/register">
                    <Button size="lg" className="gold-gradient text-black font-bold px-8 hover:opacity-90 transition-opacity">
                      Apply for Access
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="border-border/60 px-8">
                      Login
                    </Button>
                  </Link>
                </>
              ) : isApproved ? (
                <Link href="/products">
                  <Button size="lg" className="gold-gradient text-black font-bold px-8 hover:opacity-90">
                    Browse Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-5 py-3 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Your application is pending approval</span>
                </div>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Verified Products</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Discreet Delivery</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Exclusive Access ─────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/40">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-6">
                <Shield className="h-3 w-3" />
                Exclusive Platform
              </div>
              <h2 className="text-4xl font-black mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Not Everyone Gets <span className="gold-text">Access</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Alpha Compound is a restricted platform. Every account is manually reviewed and approved before gaining access to our product catalog and pricing. This ensures our community remains exclusive and our products reach only serious athletes.
              </p>
              <ul className="space-y-3">
                {[
                  "Register and submit your application",
                  "Admin review within 24 hours",
                  "Approved members unlock full catalog",
                  "Secure checkout with PayFast",
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-xs shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
              {[
                { icon: Lock, title: "Gated Access", desc: "Manual approval required for all members" },
                { icon: Eye, title: "Hidden Pricing", desc: "Prices visible only to approved members" },
                { icon: Shield, title: "18+ Verified", desc: "Age verification on every registration" },
                { icon: Star, title: "Premium Quality", desc: "HD Labs certified compounds only" },
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-xl p-5">
                  <item.icon className="h-6 w-6 text-primary mb-3" />
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Featured Products ─────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/40">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Featured <span className="gold-text">Products</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {isApproved
                  ? "Browse our premium selection of HD Labs compounds."
                  : "Get approved to view pricing and place orders."}
              </p>
            </motion.div>

            {featuredQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card rounded-xl h-72 animate-pulse" />
                ))}
              </div>
            ) : featured.length > 0 ? (
              <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((product) => (
                  <motion.div key={product.id} variants={fadeUp}>
                    <ProductCard product={product} isApproved={isApproved} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Products coming soon. Check back after approval.</p>
              </div>
            )}

            <motion.div variants={fadeUp} className="text-center mt-10">
              <Link href="/products">
                <Button variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary/5">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Why Alpha Compound ────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/40 bg-card/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Why <span className="gold-text">Alpha Compound</span>
              </h2>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Star, title: "Premium Quality", desc: "Pharmaceutical-grade HD Labs compounds with verified purity" },
                { icon: Package, title: "Reliable Stock", desc: "Consistent inventory management ensuring products are always available" },
                { icon: Zap, title: "Fast Delivery", desc: "2–3 business days nationwide delivery across South Africa" },
                { icon: Shield, title: "Discreet Service", desc: "All orders shipped in plain, unmarked packaging for your privacy" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="glass-card rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-5 w-5 text-black" />
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Delivery ──────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/40">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.div variants={fadeUp}>
              <Truck className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Nationwide <span className="gold-text">Delivery</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                We deliver across South Africa within 2–3 business days. All orders are shipped discreetly in plain packaging.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/40 bg-card/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                How It <span className="gold-text">Works</span>
              </h2>
            </motion.div>

            <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Register", desc: "Create your account with full details and confirm you are 18+" },
                { step: "02", title: "Get Approved", desc: "Our team reviews your application within 24 hours" },
                { step: "03", title: "Access Products", desc: "Browse the full catalog with pricing unlocked" },
                { step: "04", title: "Order Securely", desc: "Checkout with PayFast and receive discreet delivery" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="relative">
                  <div className="text-5xl font-black gold-text opacity-30 mb-3">{item.step}</div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2 text-border">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/40">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl sm:text-5xl font-black mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ready to Elevate Your <span className="gold-text">Performance?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg">
              Join South Africa's most exclusive performance compound platform. Apply today and get approved within 24 hours.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link href="/register">
                    <Button size="lg" className="gold-gradient text-black font-bold px-10 hover:opacity-90">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="border-border/60 px-10">
                      Login
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/products">
                  <Button size="lg" className="gold-gradient text-black font-bold px-10 hover:opacity-90">
                    Browse Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
