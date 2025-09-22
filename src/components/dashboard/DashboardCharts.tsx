import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 15000, expenses: 12000, profit: 3000 },
  { month: 'Feb', revenue: 18000, expenses: 13000, profit: 5000 },
  { month: 'Mar', revenue: 22000, expenses: 14000, profit: 8000 },
  { month: 'Apr', revenue: 28000, expenses: 16000, profit: 12000 },
  { month: 'May', revenue: 32000, expenses: 18000, profit: 14000 },
  { month: 'Jun', revenue: 38000, expenses: 20000, profit: 18000 },
];

const taskData = [
  { week: 'Week 1', completed: 8, pending: 12, total: 20 },
  { week: 'Week 2', completed: 15, pending: 8, total: 23 },
  { week: 'Week 3', completed: 22, pending: 6, total: 28 },
  { week: 'Week 4', completed: 28, pending: 4, total: 32 },
];

const portfolioData = [
  { name: 'Technology', value: 45, color: '#8b5cf6' },
  { name: 'Healthcare', value: 25, color: '#06b6d4' },
  { name: 'Finance', value: 20, color: '#10b981' },
  { name: 'E-commerce', value: 10, color: '#f59e0b' },
];

const performanceData = [
  { metric: 'Revenue Growth', current: 125, target: 150 },
  { metric: 'Customer Acquisition', current: 85, target: 100 },
  { metric: 'Market Share', current: 65, target: 80 },
  { metric: 'Team Productivity', current: 92, target: 95 },
];

export const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
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
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Task Completion */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <CardTitle>Task Completion Trend</CardTitle>
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
              <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Portfolio Distribution */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
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
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <CardTitle>Performance vs Targets</CardTitle>
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
              <Bar dataKey="current" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="target" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};