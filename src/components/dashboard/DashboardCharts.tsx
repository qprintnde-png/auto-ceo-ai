import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, AlertCircle } from 'lucide-react';

// Portfolio distribution - this could be derived from companies table in future
const portfolioData = [
  { name: 'Technology', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Healthcare', value: 25, color: 'hsl(var(--accent))' },
  { name: 'Finance', value: 20, color: 'hsl(142.1 76.2% 36.3%)' },
  { name: 'E-commerce', value: 10, color: 'hsl(38 92% 50%)' },
];

const ChartSkeleton = () => (
  <Card className="shadow-card border">
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full" />
    </CardContent>
  </Card>
);

const EmptyChartState = ({ title, message }: { title: string; message: string }) => (
  <Card className="shadow-card border">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">{message}</p>
        <p className="text-xs mt-1">Add financial data to see trends</p>
      </div>
    </CardContent>
  </Card>
);

export const DashboardCharts = () => {
  const { data, isLoading } = useFinancialMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const revenueData = data?.revenueData || [];
  const taskData = data?.taskData || [];
  const hasRevenueData = revenueData.some(d => d.revenue > 0 || d.expenses > 0);
  const hasTaskData = taskData.some(d => d.total > 0);

  // Performance metrics derived from real data
  const performanceData = [
    { 
      metric: 'Revenue Growth', 
      current: Math.min(Math.max(data?.revenueGrowth || 0, 0), 150), 
      target: 100 
    },
    { 
      metric: 'Task Completion', 
      current: Math.round(data?.taskCompletionRate || 0), 
      target: 90 
    },
    { 
      metric: 'Runway (months)', 
      current: Math.min((data?.runway || 0) * 10, 150), 
      target: 120 
    },
    { 
      metric: 'Burn Efficiency', 
      current: data?.burnRate && data?.totalRevenue 
        ? Math.min(Math.round((data.totalRevenue / (data.burnRate || 1)) * 10), 150)
        : 50, 
      target: 100 
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      {hasRevenueData ? (
        <Card className="shadow-card border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
            {data?.revenueGrowth !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${data.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-4 w-4 ${data.revenueGrowth < 0 ? 'rotate-180' : ''}`} />
                {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(1)}%
              </div>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
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
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <EmptyChartState 
          title="Revenue Trend" 
          message="No revenue data available yet" 
        />
      )}

      {/* Task Completion */}
      {hasTaskData ? (
        <Card className="shadow-card border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Task Completion Trend</CardTitle>
            <div className="text-sm text-muted-foreground">
              {Math.round(data?.taskCompletionRate || 0)}% overall
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="week" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="completed" name="Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <EmptyChartState 
          title="Task Completion Trend" 
          message="No tasks created yet" 
        />
      )}

      {/* Portfolio Distribution */}
      <Card className="shadow-card border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="hsl(var(--primary))"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, '']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="shadow-card border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Performance vs Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                type="number" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={[0, 160]}
              />
              <YAxis 
                type="category"
                dataKey="metric" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={120}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="current" name="Current" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="target" name="Target" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
