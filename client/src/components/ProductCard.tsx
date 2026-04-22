import { trpc } from "@/lib/trpc";
import { ShoppingCart, Lock, Eye } from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { toast } from "sonner";

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string | null;
  primaryImage: string | null;
  categoryName?: string | null;
  stockQuantity: number;
};

export default function ProductCard({
  product,
  isApproved,
}: {
  product: Product;
  isApproved: boolean;
}) {
  const utils = trpc.useUtils();
  const addToCart = trpc.cart.upsert.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success(`${product.name} added to cart`);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="glass-card rounded-xl overflow-hidden group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block no-underline">
        <div className="relative aspect-square bg-muted/30 overflow-hidden">
          {product.primaryImage ? (
            <img
              src={product.primaryImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full gold-gradient opacity-20 flex items-center justify-center">
                <span className="text-black font-black text-xl">AC</span>
              </div>
            </div>
          )}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground border border-border rounded px-2 py-1">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {product.categoryName && (
          <span className="text-xs text-primary font-medium uppercase tracking-wider">
            {product.categoryName}
          </span>
        )}
        <Link href={`/products/${product.slug}`} className="no-underline">
          <h3 className="font-semibold text-sm mt-1 mb-2 leading-tight hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center justify-between mt-3">
          {isApproved && product.price ? (
            <span className="font-bold text-lg text-primary">
              R{parseFloat(product.price).toFixed(2)}
            </span>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span className="text-xs">Login & Get Approved to View Pricing</span>
            </div>
          )}

          {isApproved && product.stockQuantity > 0 ? (
            <Button
              size="sm"
              className="gold-gradient text-black font-semibold hover:opacity-90 h-8 px-3"
              onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
              disabled={addToCart.isPending}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          ) : isApproved ? null : (
            <Link href="/register">
              <Button size="sm" variant="ghost" className="h-8 px-3 text-xs text-primary">
                <Eye className="h-3.5 w-3.5 mr-1" />
                Apply
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
