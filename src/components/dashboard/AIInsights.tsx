import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

// Mock AI insights - in a real app, these would come from AI analysis
const insights: AIInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Revenue Growth Opportunity',
    description: 'Your customer acquisition cost has decreased by 15% this month. Consider increasing marketing spend to capitalize on this efficiency.',
    action: { label: 'View Financial Plan', url: '/financial' },
    impact: 'high'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Burn Rate Alert',
    description: 'Current burn rate suggests 8 months runway remaining. Consider cost optimization or fundraising preparation.',
    action: { label: 'Find Investors', url: '/investors' },
    impact: 'high'
  },
  {
    id: '3',
    type: 'recommendation',
    title: 'Team Expansion Suggestion',
    description: 'Based on your growth trajectory, hiring 2 additional developers would optimize your product development velocity.',
    action: { label: 'Browse Candidates', url: '/team' },
    impact: 'medium'
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Task Completion Milestone',
    description: 'Congratulations! You\'ve achieved 95% task completion rate this month, exceeding your target.',
    impact: 'medium'
  },
  {
    id: '5',
    type: 'opportunity',
    title: 'Investor Interest Surge',
    description: 'FinTech investors are showing 23% increased activity. Your company profile matches current investment trends.',
    action: { label: 'Update Pitch Deck', url: '/business-plan' },
    impact: 'high'
  }
];

export const AIInsights = () => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return TrendingUp;
      case 'warning':
        return AlertTriangle;
      case 'recommendation':
        return Lightbulb;
      case 'achievement':
        return Target;
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

  return (
    <Card className="shadow-soft bg-card-gradient border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
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