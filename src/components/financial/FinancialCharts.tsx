import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

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
  customer_acquisition_cost?: number;
  lifetime_value?: number;
  churn_rate?: number;
  conversion_rate?: number;
  monthly_recurring_revenue?: number;
  burn_rate?: number;
  runway_months?: number;
  is_projection: boolean;
  notes?: string;
}

interface FinancialChartsProps {
  data: FinancialData[];
}

export const FinancialCharts = ({ data }: FinancialChartsProps) => {
  // Sort data by period start
  const sortedData = [...data].sort((a, b) => new Date(a.period_start).getTime() - new Date(b.period_start).getTime());

  // Prepare chart data
  const revenueExpenseData = sortedData.map((item, index) => ({
    period: `Period ${index + 1}`,
    revenue: item.revenue || 0,
    expenses: item.expenses || 0,
    net_profit: item.net_profit || 0,
    is_projection: item.is_projection,
  }));

  const profitabilityData = sortedData.map((item, index) => ({
    period: `Period ${index + 1}`,
    gross_profit: item.gross_profit || 0,
    net_profit: item.net_profit || 0,
    cash_flow: item.cash_flow || 0,
  }));

  const customerData = sortedData.map((item, index) => ({
    period: `Period ${index + 1}`,
    cac: item.customer_acquisition_cost || 0,
    ltv: item.lifetime_value || 0,
    conversion_rate: item.conversion_rate || 0,
    churn_rate: item.churn_rate || 0,
  }));

  // Calculate totals for pie chart
  const totalRevenue = sortedData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalExpenses = sortedData.reduce((sum, item) => sum + (item.expenses || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;

  const pieData = [
    { name: 'Revenue', value: totalRevenue, color: '#10b981' },
    { name: 'Expenses', value: totalExpenses, color: '#ef4444' },
    { name: 'Net Profit', value: totalProfit, color: '#3b82f6' },
  ].filter(item => item.value > 0);

  // Key metrics
  const latestData = sortedData[sortedData.length - 1];
  const previousData = sortedData[sortedData.length - 2];

  const revenueGrowth = previousData && latestData ? 
    ((latestData.revenue || 0) - (previousData.revenue || 0)) / (previousData.revenue || 1) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft bg-card-gradient border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className={`flex items-center text-xs ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(revenueGrowth).toFixed(1)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft bg-card-gradient border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft bg-card-gradient border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${totalProfit.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% margin
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft bg-card-gradient border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runway</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {latestData?.runway_months || 0} months
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
          <CardDescription>Track your financial performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]} />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability Chart */}
        <Card className="shadow-soft bg-card-gradient border-0">
          <CardHeader>
            <CardTitle>Profitability Analysis</CardTitle>
            <CardDescription>Gross profit, net profit, and cash flow</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={profitabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]} />
                <Line type="monotone" dataKey="gross_profit" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="net_profit" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="cash_flow" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Financial Breakdown Pie Chart */}
        <Card className="shadow-soft bg-card-gradient border-0">
          <CardHeader>
            <CardTitle>Financial Breakdown</CardTitle>
            <CardDescription>Overall financial distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Metrics */}
      {customerData.some(d => d.cac > 0 || d.ltv > 0) && (
        <Card className="shadow-soft bg-card-gradient border-0">
          <CardHeader>
            <CardTitle>Customer Metrics</CardTitle>
            <CardDescription>Customer acquisition cost, lifetime value, and rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cac" fill="#ef4444" name="CAC ($)" />
                <Bar dataKey="ltv" fill="#10b981" name="LTV ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};