import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone number required"),
  city: z.string().min(2, "City required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  isOver18: z.boolean().refine((v) => v, "You must be 18 or older"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const [, navigate] = useLocation();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const register = trpc.auth.register.useMutation({
    onSuccess: () => setSuccess(true),
    onError: (err) => toast.error(err.message),
  });

  const { register: reg, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isOver18: false },
  });

  const isOver18 = watch("isOver18");

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6">
            <span className="text-black font-black text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-black mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Application Submitted!
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Your application is now under review. You'll be notified once approved — typically within 24 hours.
          </p>
          <Link href="/login">
            <Button className="gold-gradient text-black font-bold">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-card" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, oklch(0.78 0.12 85) 0%, transparent 60%)`,
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
            Join the <span className="gold-text">Elite</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Apply for exclusive access to South Africa's premium performance compound platform. Every application is reviewed by our team.
          </p>
          <ul className="space-y-3">
            {["Manual approval process", "Exclusive pricing for members", "Discreet nationwide delivery", "18+ verified platform"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
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
            Apply for Access
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline no-underline">Login here</Link>
          </p>

          <form onSubmit={handleSubmit((data) => register.mutate(data))} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
              <Input id="fullName" {...reg("fullName")} placeholder="John Smith" className="mt-1.5 bg-input border-border" />
              {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input id="email" type="email" {...reg("email")} placeholder="john@example.com" className="mt-1.5 bg-input border-border" />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input id="phone" {...reg("phone")} placeholder="+27 82 000 0000" className="mt-1.5 bg-input border-border" />
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <Label htmlFor="city" className="text-sm font-medium">City</Label>
                <Input id="city" {...reg("city")} placeholder="Johannesburg" className="mt-1.5 bg-input border-border" />
                {errors.city && <p className="text-destructive text-xs mt-1">{errors.city.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  {...reg("password")}
                  placeholder="Min. 8 characters"
                  className="bg-input border-border pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  {...reg("confirmPassword")}
                  placeholder="Repeat password"
                  className="bg-input border-border pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="isOver18"
                checked={isOver18}
                onCheckedChange={(v) => setValue("isOver18", v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="isOver18" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                I confirm that I am <strong className="text-foreground">18 years of age or older</strong> and agree to the terms of service.
              </Label>
            </div>
            {errors.isOver18 && <p className="text-destructive text-xs">{errors.isOver18.message}</p>}

            <Button
              type="submit"
              className="w-full gold-gradient text-black font-bold mt-2 hover:opacity-90"
              disabled={register.isPending}
            >
              {register.isPending ? "Submitting Application..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
