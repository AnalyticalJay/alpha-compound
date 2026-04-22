import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Lock, ArrowLeft, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const [quantity, setQuantity] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);

  const utils = trpc.useUtils();
  const productQuery = trpc.products.bySlug.useQuery({ slug: slug ?? "" }, { enabled: !!slug });
  const product = productQuery.data;

  const addToCart = trpc.cart.upsert.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success(`${product?.name} added to cart`);
    },
    onError: (err) => toast.error(err.message),
  });

  if (productQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-card rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-card rounded animate-pulse w-3/4" />
              <div className="h-4 bg-card rounded animate-pulse w-1/2" />
              <div className="h-24 bg-card rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container text-center py-24">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <Link href="/products">
            <Button variant="outline">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images ?? [];
  const currentImage = images[imgIndex];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="container py-8">
          {/* Breadcrumb */}
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 no-underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative aspect-square rounded-xl overflow-hidden glass-card mb-4">
                {currentImage ? (
                  <img
                    src={currentImage.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full gold-gradient opacity-20 flex items-center justify-center">
                      <span className="text-black font-black text-3xl">AC</span>
                    </div>
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setImgIndex((i) => Math.min(images.length - 1, i + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setImgIndex(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIndex ? "border-primary" : "border-border/40"}`}
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {(product as any).category && (
                <span className="text-xs text-primary font-medium uppercase tracking-wider">
                  {(product as any).category?.name}
                </span>
              )}
              <h1 className="text-3xl font-black mt-2 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                {isApproved && product.price ? (
                  <div className="text-4xl font-black text-primary">
                    R{parseFloat(product.price).toFixed(2)}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-lg border border-primary/20 bg-primary/5 inline-flex">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Login & Get Approved to View Pricing</span>
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="mb-6">
                {product.stockQuantity > 0 ? (
                  <span className="text-xs text-green-400 font-medium">
                    ✓ In Stock ({product.stockQuantity} available)
                  </span>
                ) : (
                  <span className="text-xs text-destructive font-medium">✗ Out of Stock</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Dosage */}
              {product.dosageInfo && (
                <div className="mb-6 p-4 rounded-lg border border-border/40 bg-card/50">
                  <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Dosage Information</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.dosageInfo}</p>
                </div>
              )}

              {/* Add to Cart */}
              {isApproved && product.stockQuantity > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 hover:bg-accent transition-colors text-sm"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-sm font-medium border-x border-border">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                      className="px-3 py-2 hover:bg-accent transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                  <Button
                    className="flex-1 gold-gradient text-black font-bold hover:opacity-90"
                    onClick={() => addToCart.mutate({ productId: product.id, quantity })}
                    disabled={addToCart.isPending}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {addToCart.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                </div>
              )}

              {!isApproved && (
                <div className="flex gap-3">
                  <Link href="/register" className="flex-1">
                    <Button className="w-full gold-gradient text-black font-bold">Apply for Access</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="border-border/60">Login</Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
