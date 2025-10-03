import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip, Legend } from 'recharts';

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-elegant">
          <p className="font-medium text-sm">{payload[0].payload.month || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-muted-foreground">
              {entry.name}: {typeof entry.value === 'number' ? `$${(entry.value / 1000).toFixed(0)}K` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Value Growth */}
      <Card className="shadow-soft bg-card-gradient border-0 hover-scale transition-all">
        <CardHeader>
          <CardTitle>Portfolio Value Growth</CardTitle>
          <CardDescription>6-month performance trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioGrowthData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
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
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="url(#colorValue)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Industry Distribution */}
      <Card className="shadow-soft bg-card-gradient border-0 hover-scale transition-all">
        <CardHeader>
          <CardTitle>Industry Distribution</CardTitle>
          <CardDescription>Companies by industry sector</CardDescription>
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
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stage Distribution */}
      <Card className="shadow-soft bg-card-gradient border-0 hover-scale transition-all">
        <CardHeader>
          <CardTitle>Company Stages</CardTitle>
          <CardDescription>Distribution across funding stages</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
              <XAxis 
                dataKey="stage" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Funding Progress */}
      <Card className="shadow-soft bg-card-gradient border-0 hover-scale transition-all">
        <CardHeader>
          <CardTitle>Funding Progress</CardTitle>
          <CardDescription>Current vs goal funding by company</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fundingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
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
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="current" name="Current" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="goal" name="Goal" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};