import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const CTA = () => {
  const benefits = [
    "Complete business plan in 24 hours",
    "AI-powered market validation",
    "Automated task & team management",
    "Direct investor connections",
    "Real-time financial modeling"
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-5xl font-bold">
                Ready to Build Your 
                <span className="bg-primary-gradient bg-clip-text text-transparent"> Business Empire?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of successful entrepreneurs who've transformed their ideas into 
                thriving businesses with Auto-CEO's AI-powered guidance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 py-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6 h-auto">
                Start Your Free Trial Today
                <ArrowRight className="h-6 w-6" />
              </Button>
              <div className="text-sm text-muted-foreground">
                No credit card required • 14-day free trial • Cancel anytime
              </div>
            </div>

            <div className="pt-8 border-t border-border/40">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">24hrs</div>
                  <div className="text-sm text-muted-foreground">Average setup time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">5x</div>
                  <div className="text-sm text-muted-foreground">Faster time to market</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">$2M+</div>
                  <div className="text-sm text-muted-foreground">Average funding raised</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;