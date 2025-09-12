import { Crown } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-gradient">
                <Crown className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Auto-CEO</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering entrepreneurs with AI-powered business leadership and strategic guidance.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">Features</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">Pricing</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">API</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">Integrations</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Company</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">About</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">Blog</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">Careers</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">Contact</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">Security</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth block">GDPR</a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Auto-CEO. All rights reserved. Built with ❤️ for entrepreneurs worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;