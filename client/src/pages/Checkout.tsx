import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Truck, CreditCard, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

type FormData = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const isApproved = (user as any)?.status === "approved";
  const [, navigate] = useLocation();

  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: isApproved });
  const items = cartQuery.data ?? [];

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      fullName: (user as any)?.fullName ?? "",
      phone: (user as any)?.phone ?? "",
      city: (user as any)?.city ?? "",
      country: "South Africa",
    },
  });

  const city = watch("city");
  const deliveryQuery = trpc.delivery.calculate.useQuery(
    { city: city || "" },
    { enabled: city?.length > 1 }
  );
  const delivery = deliveryQuery.data;

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.productPrice) * item.quantity, 0);
  const deliveryFee = delivery?.fee ?? 150;
  const total = subtotal + deliveryFee;

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      // Redirect to PayFast
      submitPayFast(data);
    },
    onError: (err) => toast.error(err.message),
  });

  const submitPayFast = (orderData: { orderId: number; payfastReference: string; total: string }) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.payfast.co.za/eng/process";

    const params: Record<string, string> = {
      merchant_id: import.meta.env.VITE_PAYFAST_MERCHANT_ID || "10000100",
      merchant_key: import.meta.env.VITE_PAYFAST_MERCHANT_KEY || "46f0cd694581a",
      return_url: `${window.location.origin}/order-success/${orderData.orderId}`,
      cancel_url: `${window.location.origin}/cart`,
      notify_url: `${window.location.origin}/api/trpc/orders.payfastItn`,
      m_payment_id: orderData.payfastReference,
      amount: parseFloat(orderData.total).toFixed(2),
      item_name: `Anabolics Africa Order #${orderData.orderId}`,
      email_address: (user as any)?.email ?? "",
      name_first: ((user as any)?.fullName ?? "").split(" ")[0] ?? "",
      name_last: ((user as any)?.fullName ?? "").split(" ").slice(1).join(" ") || ".",
    };

    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  if (!isAuthenticated || !isApproved) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container text-center py-24">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">Access Required</h2>
          <p className="text-muted-foreground mb-6">You must be an approved member to checkout.</p>
          <Link href="/login"><Button className="text-white font-bold">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container text-center py-24">
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <Link href="/products"><Button className="text-white font-bold">Browse Products</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="container py-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 no-underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <h1 className="text-3xl font-black mb-8" >
            <span style={{ color: "#0EA5E9" }}>Checkout</span>
          </h1>

          <form onSubmit={handleSubmit((data: FormData) => createOrder.mutate({ shipping: data }))}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shipping Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Truck className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-lg">Shipping Details</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium">Full Name</Label>
                      <Input {...register("fullName")} className="mt-1.5 bg-input border-border" />
                      {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone Number</Label>
                      <Input {...register("phone")} className="mt-1.5 bg-input border-border" />
                      {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">City</Label>
                      <Input {...register("city")} className="mt-1.5 bg-input border-border" />
                      {errors.city && <p className="text-destructive text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium">Address Line 1</Label>
                      <Input {...register("addressLine1")} placeholder="Street address" className="mt-1.5 bg-input border-border" />
                      {errors.addressLine1 && <p className="text-destructive text-xs mt-1">{errors.addressLine1.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium">Address Line 2 (Optional)</Label>
                      <Input {...register("addressLine2")} placeholder="Apartment, suite, etc." className="mt-1.5 bg-input border-border" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Postal Code</Label>
                      <Input {...register("postalCode")} className="mt-1.5 bg-input border-border" />
                      {errors.postalCode && <p className="text-destructive text-xs mt-1">{errors.postalCode.message}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Country</Label>
                      <Input {...register("country")} defaultValue="South Africa" className="mt-1.5 bg-input border-border" readOnly />
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                {city?.length > 1 && (
                  <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {delivery?.type === "free" ? "Free Delivery" : `Standard Delivery — R${deliveryFee.toFixed(2)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">2–3 business days, discreet packaging</p>
                    </div>
                    {delivery?.type === "free" && (
                      <span className="ml-auto text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded">FREE</span>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="glass-card rounded-xl p-6 h-fit sticky top-24">
                <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">{item.productName} ×{item.quantity}</span>
                      <span className="shrink-0">R{(parseFloat(item.productPrice) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{delivery?.type === "free" ? <span className="text-green-400">FREE</span> : `R${deliveryFee.toFixed(2)}`}</span>
                  </div>
                </div>
                <div className="border-t border-border pt-3 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">R{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-white font-bold"
                  disabled={createOrder.isPending}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {createOrder.isPending ? "Processing..." : "Pay with PayFast"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" />
                  Secured by PayFast · ZAR
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
