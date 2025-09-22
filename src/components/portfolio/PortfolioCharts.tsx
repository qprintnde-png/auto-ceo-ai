import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from 'recharts';

interface Company {
  id: string;
  name: string;
  stage: string;
  industry: string;
  current_funding: number;
  funding_goal: number;
  employee_count: number;
  created_at: string;
}

interface PortfolioChartsProps {
  companies: Company[];
}

export const PortfolioCharts = ({ companies }: PortfolioChartsProps) => {
  // Portfolio growth data (mock data - would come from financial_data table)
  const portfolioGrowthData = [
    { month: 'Jan', value: 150000, companies: 3 },
    { month: 'Feb', value: 180000, companies: 3 },
    { month: 'Mar', value: 220000, companies: 4 },
    { month: 'Apr', value: 280000, companies: 4 },
    { month: 'May', value: 320000, companies: 5 },
    { month: 'Jun', value: 380000, companies: 5 },
  ];

  // Industry distribution
  const industryData = companies.reduce((acc: Record<string, number>, company) => {
    const industry = company.industry || 'Other';
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(industryData).map(([industry, count]) => ({
    name: industry,
    value: count,
  }));

  // Stage distribution
  const stageData = companies.reduce((acc: Record<string, number>, company) => {
    const stage = company.stage || 'Unknown';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(stageData).map(([stage, count]) => ({
    stage,
    count,
  }));

  // Funding data
  const fundingData = companies.map((company) => ({
    name: company.name.substring(0, 10) + '...',
    current: company.current_funding || 0,
    goal: company.funding_goal || 0,
  }));

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Value Growth */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <CardTitle>Portfolio Value Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Industry Distribution */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <CardTitle>Industry Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="hsl(var(--primary))"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stage Distribution */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <CardTitle>Company Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="stage" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Funding Progress */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <CardTitle>Funding Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fundingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Bar dataKey="current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="goal" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};