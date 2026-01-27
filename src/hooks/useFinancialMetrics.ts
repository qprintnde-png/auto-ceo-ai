import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export interface MonthlyFinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface TaskCompletionData {
  week: string;
  completed: number;
  pending: number;
  total: number;
}

export interface FinancialMetrics {
  revenueData: MonthlyFinancialData[];
  taskData: TaskCompletionData[];
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  burnRate: number;
  runway: number;
  revenueGrowth: number;
  taskCompletionRate: number;
  isLoading: boolean;
}

export const useFinancialMetrics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['financialMetrics', user?.id],
    queryFn: async (): Promise<Omit<FinancialMetrics, 'isLoading'>> => {
      if (!user?.id) {
        return getEmptyMetrics();
      }

      // Get all companies owned by the user
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id);

      const companyIds = companies?.map(c => c.id) || [];

      if (companyIds.length === 0) {
        return getEmptyMetrics();
      }

      // Fetch financial data for the last 6 months
      const sixMonthsAgo = subMonths(new Date(), 6);
      
      const { data: financialData } = await supabase
        .from('financial_data')
        .select('*')
        .in('company_id', companyIds)
        .eq('is_projection', false)
        .gte('period_start', format(sixMonthsAgo, 'yyyy-MM-dd'))
        .order('period_start', { ascending: true });

      // Fetch all tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status, created_at, completed_at')
        .in('company_id', companyIds);

      // Process monthly financial data
      const monthlyData = processMonthlyData(financialData || []);
      
      // Process task completion data (last 4 weeks)
      const taskData = processTaskData(tasks || []);

      // Calculate summary metrics
      const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
      const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
      const totalProfit = totalRevenue - totalExpenses;

      // Calculate average burn rate from financial data
      const burnRates = financialData?.filter(fd => fd.burn_rate).map(fd => fd.burn_rate || 0) || [];
      const avgBurnRate = burnRates.length > 0 ? burnRates.reduce((a, b) => a + b, 0) / burnRates.length : 0;

      // Calculate average runway
      const runways = financialData?.filter(fd => fd.runway_months).map(fd => fd.runway_months || 0) || [];
      const avgRunway = runways.length > 0 ? runways.reduce((a, b) => a + b, 0) / runways.length : 0;

      // Calculate revenue growth (comparing last 2 months)
      const revenueGrowth = calculateRevenueGrowth(monthlyData);

      // Calculate task completion rate
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const totalTasks = tasks?.length || 0;
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        revenueData: monthlyData,
        taskData,
        totalRevenue,
        totalExpenses,
        totalProfit,
        burnRate: avgBurnRate,
        runway: avgRunway,
        revenueGrowth,
        taskCompletionRate,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

function getEmptyMetrics(): Omit<FinancialMetrics, 'isLoading'> {
  // Generate empty data for last 6 months
  const emptyMonthlyData: MonthlyFinancialData[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    emptyMonthlyData.push({
      month: format(date, 'MMM'),
      revenue: 0,
      expenses: 0,
      profit: 0,
    });
  }

  return {
    revenueData: emptyMonthlyData,
    taskData: [
      { week: 'Week 1', completed: 0, pending: 0, total: 0 },
      { week: 'Week 2', completed: 0, pending: 0, total: 0 },
      { week: 'Week 3', completed: 0, pending: 0, total: 0 },
      { week: 'Week 4', completed: 0, pending: 0, total: 0 },
    ],
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    burnRate: 0,
    runway: 0,
    revenueGrowth: 0,
    taskCompletionRate: 0,
  };
}

interface FinancialRecord {
  period_start: string;
  revenue: number | null;
  expenses: number | null;
  net_profit: number | null;
}

function processMonthlyData(financialData: FinancialRecord[]): MonthlyFinancialData[] {
  // Group by month
  const monthlyMap = new Map<string, { revenue: number; expenses: number; profit: number }>();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthKey = format(date, 'MMM');
    monthlyMap.set(monthKey, { revenue: 0, expenses: 0, profit: 0 });
  }

  // Aggregate data by month
  financialData.forEach(fd => {
    const date = parseISO(fd.period_start);
    const monthKey = format(date, 'MMM');
    
    if (monthlyMap.has(monthKey)) {
      const existing = monthlyMap.get(monthKey)!;
      existing.revenue += fd.revenue || 0;
      existing.expenses += fd.expenses || 0;
      existing.profit += (fd.revenue || 0) - (fd.expenses || 0);
    }
  });

  // Convert to array
  const result: MonthlyFinancialData[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthKey = format(date, 'MMM');
    const data = monthlyMap.get(monthKey)!;
    result.push({
      month: monthKey,
      ...data,
    });
  }

  return result;
}

interface TaskRecord {
  id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

function processTaskData(tasks: TaskRecord[]): TaskCompletionData[] {
  // Group tasks by week (last 4 weeks)
  const now = new Date();
  const weeks: TaskCompletionData[] = [];

  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);

    const weekTasks = tasks.filter(t => {
      const createdAt = new Date(t.created_at);
      return createdAt >= weekStart && createdAt < weekEnd;
    });

    const completed = weekTasks.filter(t => t.status === 'completed').length;
    const pending = weekTasks.filter(t => t.status !== 'completed').length;

    weeks.push({
      week: `Week ${4 - i}`,
      completed,
      pending,
      total: weekTasks.length,
    });
  }

  return weeks;
}

function calculateRevenueGrowth(monthlyData: MonthlyFinancialData[]): number {
  if (monthlyData.length < 2) return 0;

  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];

  if (previousMonth.revenue === 0) {
    return currentMonth.revenue > 0 ? 100 : 0;
  }

  return ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
}
