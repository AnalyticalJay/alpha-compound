import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [, navigate] = useLocation();
  const [showPass, setShowPass] = useState(false);
  const utils = trpc.useUtils();

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Welcome back!");
      navigate("/products");
    },
    onError: (err) => toast.error(err.message),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-card" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 50%, oklch(0.78 0.12 85) 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-10 flex flex-col justify-center p-16">
          <Link href="/" className="flex items-center gap-2 mb-16 no-underline">
            <div className="w-8 h-8 rounded-sm gold-gradient flex items-center justify-center">
              <span className="text-black font-black text-sm">AC</span>
            </div>
            <span className="font-bold text-lg">
              <span className="gold-text">Alpha</span>
              <span className="text-foreground"> Compound</span>
            </span>
          </Link>
          <h2 className="text-4xl font-black mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Welcome <span className="gold-text">Back</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Sign in to access your approved account and browse our exclusive catalog of premium HD Labs compounds.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 no-underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sign In
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline no-underline">Apply for access</Link>
          </p>

          <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john@example.com"
                className="mt-1.5 bg-input border-border"
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  {...register("password")}
                  placeholder="Your password"
                  className="bg-input border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full gold-gradient text-black font-bold mt-2 hover:opacity-90"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
