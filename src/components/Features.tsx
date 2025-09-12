import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Zap,
  ArrowRight 
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Business Plan Generator",
      description: "Transform your idea into a comprehensive business plan with market research, competitor analysis, and strategic roadmap in minutes.",
      benefits: ["Market validation", "Competitor insights", "Revenue projections"]
    },
    {
      icon: Target,
      title: "Automated Task Management",
      description: "Convert business goals into actionable roadmaps and tasks. Auto-assign to team members and track progress intelligently.",
      benefits: ["Goal tracking", "Task automation", "Progress monitoring"]
    },
    {
      icon: DollarSign,
      title: "Financial Forecasting",
      description: "Generate detailed P&L statements, cash flow projections, and growth models powered by industry benchmarks and AI insights.",
      benefits: ["Revenue modeling", "Cash flow tracking", "Growth projections"]
    },
    {
      icon: Users,
      title: "Smart Investor Matching",
      description: "Connect with the right investors based on your industry, stage, and funding needs. Auto-generate personalized pitch materials.",
      benefits: ["Investor discovery", "Pitch automation", "Deal tracking"]
    },
    {
      icon: TrendingUp,
      title: "Portfolio Dashboard",
      description: "Manage multiple companies, track KPIs, and monitor equity stakes in one comprehensive dashboard designed for serial entrepreneurs.",
      benefits: ["Multi-company view", "KPI tracking", "Equity management"]
    },
    {
      icon: Zap,
      title: "Team Hiring Automation",
      description: "Auto-match with freelancers and agencies based on your project needs. Streamline hiring with AI-powered candidate scoring.",
      benefits: ["Talent matching", "Skill assessment", "Team scaling"]
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Everything You Need to 
            <span className="bg-primary-gradient bg-clip-text text-transparent"> Scale Fast</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Auto-CEO combines the strategic thinking of top-tier consultants with the execution power 
            of the best operational teams - all powered by cutting-edge AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 bg-card-gradient border-0 shadow-soft hover:shadow-feature transition-smooth group">
              <div className="space-y-6">
                <div className="inline-flex p-3 rounded-xl bg-accent">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-smooth">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      {benefit}
                    </div>
                  ))}
                </div>

                <Button variant="ghost" className="group/btn p-0 h-auto font-medium text-primary hover:text-primary">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="hero" size="lg">
            Explore All Features
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;