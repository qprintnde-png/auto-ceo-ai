import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calculator, Target, AlertTriangle } from 'lucide-react';

interface FinancialData {
  id: string;
  period_start: string;
  period_end: string;
  period_type: string;
  revenue?: number;
  expenses?: number;
  gross_profit?: number;
  net_profit?: number;
  cash_flow?: number;
  monthly_recurring_revenue?: number;
  burn_rate?: number;
  runway_months?: number;
  is_projection: boolean;
}

interface FinancialProjectionsProps {
  historicalData: FinancialData[];
  onGenerateProjections: (projections: any[]) => void;
}

export const FinancialProjections = ({ historicalData, onGenerateProjections }: FinancialProjectionsProps) => {
  const [projectionPeriods, setProjectionPeriods] = useState('12');
  const [growthAssumptions, setGrowthAssumptions] = useState({
    revenueGrowth: 15, // 15% monthly growth
    expenseGrowth: 8,  // 8% monthly growth
    customerGrowth: 20, // 20% monthly customer growth
  });
  const [projections, setProjections] = useState<any[]>([]);

  // Calculate growth rates from historical data
  const calculateGrowthRates = () => {
    if (historicalData.length < 2) return { revenue: 0, expenses: 0 };

    const actualData = historicalData.filter(d => !d.is_projection);
    if (actualData.length < 2) return { revenue: 0, expenses: 0 };

    const latest = actualData[actualData.length - 1];
    const previous = actualData[actualData.length - 2];

    const revenueGrowth = previous.revenue && previous.revenue > 0 ? 
      ((latest.revenue || 0) - previous.revenue) / previous.revenue * 100 : 0;
    
    const expenseGrowth = previous.expenses && previous.expenses > 0 ? 
      ((latest.expenses || 0) - previous.expenses) / previous.expenses * 100 : 0;

    return {
      revenue: Math.max(0, Math.min(100, revenueGrowth)), // Cap between 0-100%
      expenses: Math.max(0, Math.min(100, expenseGrowth)),
    };
  };

  const generateProjections = () => {
    if (historicalData.length === 0) return;

    const lastActualData = historicalData.filter(d => !d.is_projection)[0] || historicalData[0];
    const periods = parseInt(projectionPeriods);
    const newProjections = [];

    let currentRevenue = lastActualData.revenue || 0;
    let currentExpenses = lastActualData.expenses || 0;
    let currentMRR = lastActualData.monthly_recurring_revenue || 0;

    for (let i = 1; i <= periods; i++) {
      const periodDate = new Date();
      periodDate.setMonth(periodDate.getMonth() + i);

      // Apply growth rates
      currentRevenue *= (1 + growthAssumptions.revenueGrowth / 100);
      currentExpenses *= (1 + growthAssumptions.expenseGrowth / 100);
      currentMRR *= (1 + growthAssumptions.customerGrowth / 100);

      const grossProfit = currentRevenue * 0.7; // Assume 70% gross margin
      const netProfit = grossProfit - currentExpenses;
      const burnRate = currentExpenses - currentRevenue;
      
      // Calculate runway (assuming current cash position)
      const runwayMonths = burnRate > 0 ? Math.max(0, 12 - i) : 999;

      const projection = {
        period: i,
        period_start: periodDate.toISOString().split('T')[0],
        period_end: new Date(periodDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_type: 'monthly',
        revenue: Math.round(currentRevenue),
        expenses: Math.round(currentExpenses),
        gross_profit: Math.round(grossProfit),
        net_profit: Math.round(netProfit),
        cash_flow: Math.round(currentRevenue - currentExpenses),
        monthly_recurring_revenue: Math.round(currentMRR),
        burn_rate: Math.round(Math.max(0, burnRate)),
        runway_months: runwayMonths,
        is_projection: true,
      };

      newProjections.push(projection);
    }

    setProjections(newProjections);
    onGenerateProjections(newProjections);
  };

  // Calculate key insights
  const getInsights = () => {
    if (projections.length === 0) return [];

    const insights = [];
    const lastProjection = projections[projections.length - 1];
    const firstProjection = projections[0];

    // Revenue growth insight
    if (firstProjection.revenue > 0) {
      const totalGrowth = ((lastProjection.revenue - firstProjection.revenue) / firstProjection.revenue) * 100;
      insights.push({
        type: 'growth',
        title: 'Revenue Growth',
        value: `${totalGrowth.toFixed(1)}%`,
        description: `Projected revenue growth over ${projectionPeriods} months`,
        positive: totalGrowth > 0,
      });
    }

    // Profitability insight
    const profitableMonths = projections.filter(p => p.net_profit > 0).length;
    insights.push({
      type: 'profitability',
      title: 'Profitability',
      value: `${profitableMonths}/${projections.length}`,
      description: 'Months projected to be profitable',
      positive: profitableMonths > projections.length / 2,
    });

    // Runway insight
    const minRunway = Math.min(...projections.map(p => p.runway_months));
    if (minRunway < 6) {
      insights.push({
        type: 'warning',
        title: 'Runway Alert',
        value: `${minRunway} months`,
        description: 'Minimum runway period - consider fundraising',
        positive: false,
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Financial Projections
              </CardTitle>
              <CardDescription>Generate forward-looking financial forecasts</CardDescription>
            </div>
            <Button onClick={generateProjections} className="bg-primary-gradient">
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Projections
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Projection Period</label>
              <Select value={projectionPeriods} onValueChange={setProjectionPeriods}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Revenue Growth (%)</label>
              <input
                type="number"
                value={growthAssumptions.revenueGrowth}
                onChange={(e) => setGrowthAssumptions(prev => ({ ...prev, revenueGrowth: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Expense Growth (%)</label>
              <input
                type="number"
                value={growthAssumptions.expenseGrowth}
                onChange={(e) => setGrowthAssumptions(prev => ({ ...prev, expenseGrowth: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Customer Growth (%)</label>
              <input
                type="number"
                value={growthAssumptions.customerGrowth}
                onChange={(e) => setGrowthAssumptions(prev => ({ ...prev, customerGrowth: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
                min="0"
                max="100"
              />
            </div>
          </div>

          {insights.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Key Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {insights.map((insight, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{insight.title}</span>
                      {insight.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Target className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className={`text-lg font-bold ${insight.positive ? 'text-green-500' : 'text-red-500'}`}>
                      {insight.value}
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {projections.length > 0 && (
        <Card className="shadow-soft bg-card-gradient border-0">
          <CardHeader>
            <CardTitle>Projection Summary</CardTitle>
            <CardDescription>Overview of generated financial projections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Period</th>
                    <th className="text-right p-2">Revenue</th>
                    <th className="text-right p-2">Expenses</th>
                    <th className="text-right p-2">Net Profit</th>
                    <th className="text-right p-2">Cash Flow</th>
                    <th className="text-right p-2">Runway</th>
                  </tr>
                </thead>
                <tbody>
                  {projections.slice(0, 12).map((projection, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <Badge variant="secondary">
                          Month {projection.period}
                        </Badge>
                      </td>
                      <td className="text-right p-2 text-green-600">
                        ${projection.revenue.toLocaleString()}
                      </td>
                      <td className="text-right p-2 text-red-600">
                        ${projection.expenses.toLocaleString()}
                      </td>
                      <td className={`text-right p-2 ${projection.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${projection.net_profit.toLocaleString()}
                      </td>
                      <td className={`text-right p-2 ${projection.cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${projection.cash_flow.toLocaleString()}
                      </td>
                      <td className="text-right p-2">
                        {projection.runway_months}m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};