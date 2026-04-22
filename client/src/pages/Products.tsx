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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-border/40 bg-card/30 py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-black mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Product <span className="gold-text">Catalog</span>
              </h1>
              <p className="text-muted-foreground">
                {isApproved
                  ? `${products.length} premium compounds available`
                  : "Prices hidden — get approved to view pricing and purchase"}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Access Banner */}
        {!isApproved && (
          <div className="border-b border-primary/20 bg-primary/5 py-3">
            <div className="container flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-primary" />
                <span>Prices are hidden. <strong className="text-foreground">Get approved</strong> to view pricing and add items to cart.</span>
              </div>
              <Link href="/register">
                <Button size="sm" className="gold-gradient text-black font-semibold shrink-0">Apply Now</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="container py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-input border-border"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
              <Button
                variant={selectedCategory === undefined ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(undefined)}
                className={selectedCategory === undefined ? "gold-gradient text-black font-semibold" : "border-border/60"}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                  className={selectedCategory === cat.id ? "gold-gradient text-black font-semibold" : "border-border/60"}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {productsQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl h-72 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} isApproved={isApproved} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-24 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No products found</p>
              <p className="text-sm">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
