import { Card } from "@/components/ui/card";
import { ArrowRight, Lightbulb, Rocket, Target, TrendingUp } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Lightbulb,
      title: "Validate Your Idea",
      description: "Input your business concept and let Auto-CEO analyze market opportunity, competition, and viability using real-time data.",
      step: "01"
    },
    {
      icon: Target,
      title: "Generate Strategy",
      description: "Receive a comprehensive business plan, financial projections, and go-to-market strategy tailored to your industry.",
      step: "02"
    },
    {
      icon: Rocket,
      title: "Execute & Build",
      description: "Auto-CEO breaks down your strategy into actionable tasks, helps hire talent, and manages day-to-day operations.",
      step: "03"
    },
    {
      icon: TrendingUp,
      title: "Scale & Exit",
      description: "Track performance, secure funding through investor matching, and prepare for successful exits with ongoing strategic guidance.",
      step: "04"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-subtle-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            From Idea to 
            <span className="bg-primary-gradient bg-clip-text text-transparent"> IPO in 4 Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Auto-CEO guides you through every stage of your entrepreneurial journey, 
            from initial concept validation to successful exit strategies.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="p-8 bg-card text-center hover:shadow-feature transition-smooth group h-full">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="inline-flex p-4 rounded-2xl bg-accent group-hover:bg-primary/10 transition-smooth">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 p-6 bg-card rounded-2xl shadow-soft">
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Average time to market:</strong> 3-6 months vs industry standard 12-18 months
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;