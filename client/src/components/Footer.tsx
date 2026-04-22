import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30 py-12">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-sm gold-gradient flex items-center justify-center">
                <span className="text-black font-black text-xs">AC</span>
              </div>
              <span className="font-bold">
                <span className="gold-text">Alpha</span>
                <span className="text-foreground"> Compound</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Premium HD Labs performance compounds. Restricted access platform for serious athletes in South Africa.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors no-underline">Products</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors no-underline">Apply for Access</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors no-underline">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><span className="cursor-pointer hover:text-primary transition-colors">Terms of Service</span></li>
              <li><span className="cursor-pointer hover:text-primary transition-colors">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-primary transition-colors">Contact Us</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Alpha Compound. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            For adults 18+ only. Use responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}
