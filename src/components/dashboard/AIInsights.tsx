import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  action?: {
    label: string;
    url: string;
  };
  impact: 'high' | 'medium' | 'low';
}

export const AIInsights = () => {
  const { data, isLoading } = useFinancialMetrics();

  const generateInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    if (!data) return getDefaultInsights();

    // Runway warning
    if (data.runway > 0 && data.runway < 6) {
      insights.push({
        id: 'runway-warning',
        type: 'warning',
        title: 'Low Runway Alert',
        description: `Current runway is ${Math.round(data.runway)} months. Consider cost optimization or accelerating your fundraising timeline.`,
        action: { label: 'Find Investors', url: '/investors' },
        impact: 'high'
      });
    } else if (data.runway >= 12) {
      insights.push({
        id: 'runway-healthy',
        type: 'achievement',
        title: 'Healthy Runway',
        description: `Great news! You have ${Math.round(data.runway)} months of runway, giving you time to focus on growth.`,
        impact: 'low'
      });
    }

    // Revenue growth insights
    if (data.revenueGrowth > 20) {
      insights.push({
        id: 'revenue-growth',
        type: 'opportunity',
        title: 'Strong Revenue Growth',
        description: `Your revenue grew ${data.revenueGrowth.toFixed(1)}% this month! Consider reinvesting in marketing to maintain momentum.`,
        action: { label: 'View Financial Plan', url: '/financial' },
        impact: 'high'
      });
    } else if (data.revenueGrowth < 0) {
      insights.push({
        id: 'revenue-decline',
        type: 'warning',
        title: 'Revenue Decline Detected',
        description: `Revenue decreased by ${Math.abs(data.revenueGrowth).toFixed(1)}% this month. Review your sales pipeline and customer retention.`,
        action: { label: 'View Financial Plan', url: '/financial' },
        impact: 'high'
      });
    }

    // Task completion insights
    if (data.taskCompletionRate >= 90) {
      insights.push({
        id: 'task-achievement',
        type: 'achievement',
        title: 'Excellent Task Completion',
        description: `You've achieved ${Math.round(data.taskCompletionRate)}% task completion rate. Your team is executing well!`,
        impact: 'medium'
      });
    } else if (data.taskCompletionRate < 50 && data.taskCompletionRate > 0) {
      insights.push({
        id: 'task-warning',
        type: 'recommendation',
        title: 'Improve Task Management',
        description: `Task completion rate is ${Math.round(data.taskCompletionRate)}%. Consider breaking tasks into smaller milestones or reviewing priorities.`,
        action: { label: 'View Tasks', url: '/tasks' },
        impact: 'medium'
      });
    }

    // Burn rate efficiency
    if (data.burnRate > 0 && data.totalRevenue > 0) {
      const burnEfficiency = data.totalRevenue / data.burnRate;
      if (burnEfficiency > 2) {
        insights.push({
          id: 'burn-efficiency',
          type: 'opportunity',
          title: 'Efficient Capital Usage',
          description: `Your revenue-to-burn ratio is strong. You're generating $${burnEfficiency.toFixed(1)} for every $1 spent. Consider scaling operations.`,
          action: { label: 'Browse Candidates', url: '/team' },
          impact: 'high'
        });
      } else if (burnEfficiency < 0.5) {
        insights.push({
          id: 'burn-warning',
          type: 'warning',
          title: 'High Burn Rate',
          description: `Your burn rate is higher than revenue generation. Focus on increasing revenue or reducing costs.`,
          action: { label: 'View Financial Plan', url: '/financial' },
          impact: 'high'
        });
      }
    }

    // Add general recommendations if we have few insights
    if (insights.length < 3) {
      insights.push({
        id: 'investor-opportunity',
        type: 'recommendation',
        title: 'Expand Investor Network',
        description: 'Building relationships with investors early can help when you need funding. Consider starting conversations now.',
        action: { label: 'Find Investors', url: '/investors' },
        impact: 'medium'
      });
    }

    if (insights.length < 4) {
      insights.push({
        id: 'business-plan-reminder',
        type: 'recommendation',
        title: 'Keep Business Plan Updated',
        description: 'An up-to-date business plan helps with investor pitches and strategic decision making.',
        action: { label: 'Update Business Plan', url: '/business-plan' },
        impact: 'low'
      });
    }

    return insights.slice(0, 5);
  };

  const getDefaultInsights = (): AIInsight[] => [
    {
      id: '1',
      type: 'recommendation',
      title: 'Get Started with Auto-CEO',
      description: 'Create your first company and business plan to unlock AI-powered insights tailored to your business.',
      action: { label: 'Create Business Plan', url: '/business-plan' },
      impact: 'high'
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Add Financial Data',
      description: 'Track your revenue, expenses, and key metrics to get actionable insights about your business health.',
      action: { label: 'Add Financials', url: '/financial' },
      impact: 'high'
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Explore Investor Matching',
      description: 'Our AI can help match you with investors based on your industry, stage, and funding needs.',
      action: { label: 'Find Investors', url: '/investors' },
      impact: 'medium'
    },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return TrendingUp;
      case 'warning':
        return AlertTriangle;
      case 'recommendation':
        return Lightbulb;
      case 'achievement':
        return CheckCircle2;
      default:
        return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'recommendation':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'achievement':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/10 text-red-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'low':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-card border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = generateInsights();

  return (
    <Card className="shadow-card border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Brain className="h-5 w-5" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.type);
            
            return (
              <div key={insight.id} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.type}
                        </Badge>
                        <Badge variant="secondary" className={`text-xs ${getImpactColor(insight.impact)}`}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {insight.description}
                </p>
                
                {insight.action && (
                  <Link to={insight.action.url}>
                    <Button size="sm" variant="outline" className="text-xs">
                      {insight.action.label}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
