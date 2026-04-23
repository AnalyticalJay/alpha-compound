import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Products() {
  const { user } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();

  const categoriesQuery = trpc.categories.list.useQuery();
  const productsQuery = trpc.products.list.useQuery({
    categoryId: selectedCategory,
    search: search || undefined,
  });

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-16">

        {/* Header */}
        <div className="border-b border-[#1E293B] bg-[#080808] py-12">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {/* HD Labs stripe */}
              <div className="h-[3px] w-16 mb-5" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />
              <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">
                Product <span style={{ color: "#0EA5E9" }}>Catalog</span>
              </h1>
              <p className="text-[#64748B] text-sm">
                {isApproved
                  ? `${products.length} premium HD Labs compounds available`
                  : "Prices hidden — get approved to view pricing and purchase"}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Access Banner */}
        {!isApproved && (
          <div className="border-b py-3" style={{ borderColor: "#0EA5E9" + "30", background: "#0EA5E9" + "08" }}>
            <div className="container flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <Lock className="h-4 w-4 flex-shrink-0" style={{ color: "#0EA5E9" }} />
                <span>Prices are hidden. <strong className="text-white">Get approved</strong> to view pricing and add items to cart.</span>
              </div>
              <Link href="/register" className="no-underline">
                <Button size="sm" className="text-white font-bold uppercase tracking-wide text-xs flex-shrink-0 h-8 px-4"
                  style={{ background: "linear-gradient(135deg, #E11D48, #BE123C)" }}>
                  Apply Now
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="container py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[#111111] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#0EA5E9]/50"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="h-4 w-4 text-[#64748B] shrink-0" />
              <Button
                size="sm"
                onClick={() => setSelectedCategory(undefined)}
                className={`text-xs font-bold uppercase tracking-wide h-8 px-3 ${
                  selectedCategory === undefined
                    ? "text-white border-transparent"
                    : "bg-transparent border-[#1E293B] text-[#64748B] hover:text-white hover:border-[#0EA5E9]/40"
                }`}
                style={selectedCategory === undefined ? { background: "linear-gradient(135deg, #0EA5E9, #0284C7)" } : {}}
                variant={selectedCategory === undefined ? "default" : "outline"}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                  className={`text-xs font-bold uppercase tracking-wide h-8 px-3 ${
                    selectedCategory === cat.id
                      ? "text-white border-transparent"
                      : "bg-transparent border-[#1E293B] text-[#64748B] hover:text-white hover:border-[#0EA5E9]/40"
                  }`}
                  style={selectedCategory === cat.id ? { background: "linear-gradient(135deg, #0EA5E9, #0284C7)" } : {}}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {productsQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-lg border border-[#1E293B] bg-[#111111] h-72 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} isApproved={isApproved} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-24 text-[#64748B]">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-bold text-white mb-2">No products found</p>
              <p className="text-sm">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
