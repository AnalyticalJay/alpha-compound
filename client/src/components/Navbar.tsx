import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Menu, X, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isApproved = (user as any)?.status === "approved";

  const cartQuery = trpc.cart.get.useQuery(undefined, {
    enabled: isApproved,
  });
  const cartCount = cartQuery.data?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-sm gold-gradient flex items-center justify-center">
              <span className="text-black font-black text-sm">AC</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="gold-text">Alpha</span>
              <span className="text-foreground"> Compound</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary no-underline ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isApproved && (
              <Link href="/cart" className="relative no-underline">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full gold-gradient text-black text-xs flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center">
                      <span className="text-black font-bold text-xs">
                        {(user as any)?.fullName?.charAt(0).toUpperCase() ?? "U"}
                      </span>
                    </div>
                    <span className="text-sm">{(user as any)?.fullName?.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="no-underline flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  {(user as any)?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="no-underline flex items-center gap-2 cursor-pointer">
                          <Settings className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="gold-gradient text-black font-semibold hover:opacity-90">
                    Apply for Access
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground no-underline py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isApproved && (
              <Link href="/cart" className="text-sm font-medium text-muted-foreground hover:text-foreground no-underline py-2 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <ShoppingCart className="h-4 w-4" />
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link href="/account" className="text-sm font-medium text-muted-foreground hover:text-foreground no-underline py-2" onClick={() => setMobileOpen(false)}>My Account</Link>
                {(user as any)?.role === "admin" && (
                  <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground no-underline py-2" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm font-medium text-destructive text-left py-2">Sign Out</button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full gold-gradient text-black font-semibold">Apply for Access</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
