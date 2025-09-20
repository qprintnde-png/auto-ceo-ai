import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Plus, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const financialFormSchema = z.object({
  period_type: z.enum(['monthly', 'quarterly', 'annually']),
  revenue: z.number().min(0).optional(),
  expenses: z.number().min(0).optional(),
  gross_profit: z.number().optional(),
  net_profit: z.number().optional(),
  cash_flow: z.number().optional(),
  customer_acquisition_cost: z.number().min(0).optional(),
  lifetime_value: z.number().min(0).optional(),
  churn_rate: z.number().min(0).max(100).optional(),
  conversion_rate: z.number().min(0).max(100).optional(),
  monthly_recurring_revenue: z.number().min(0).optional(),
  burn_rate: z.number().min(0).optional(),
  runway_months: z.number().min(0).optional(),
  is_projection: z.boolean(),
  notes: z.string().optional(),
});

type FinancialFormData = z.infer<typeof financialFormSchema>;

interface FinancialFormProps {
  companyId: string;
  businessPlanId?: string;
  onDataCreated?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export const FinancialForm = ({ 
  companyId, 
  businessPlanId, 
  onDataCreated, 
  onCancel, 
  initialData, 
  isEditing = false 
}: FinancialFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [periodStart, setPeriodStart] = useState<Date>(initialData?.period_start ? new Date(initialData.period_start) : new Date());
  const [periodEnd, setPeriodEnd] = useState<Date>(initialData?.period_end ? new Date(initialData.period_end) : new Date());

  const form = useForm<FinancialFormData>({
    resolver: zodResolver(financialFormSchema),
    defaultValues: {
      period_type: initialData?.period_type || 'monthly',
      is_projection: initialData?.is_projection ?? true,
      revenue: initialData?.revenue || 0,
      expenses: initialData?.expenses || 0,
      ...initialData,
    },
  });

  // Auto-calculate derived fields
  const watchedRevenue = form.watch('revenue') || 0;
  const watchedExpenses = form.watch('expenses') || 0;
  const watchedGrossProfit = form.watch('gross_profit');
  const watchedNetProfit = form.watch('net_profit');

  // Auto-calculate gross profit if not manually set
  if (watchedGrossProfit === undefined || watchedGrossProfit === null) {
    form.setValue('gross_profit', watchedRevenue * 0.7); // Assume 70% gross margin
  }

  // Auto-calculate net profit
  if (watchedNetProfit === undefined || watchedNetProfit === null) {
    form.setValue('net_profit', (form.watch('gross_profit') || 0) - watchedExpenses);
  }

  // Auto-calculate cash flow
  form.setValue('cash_flow', watchedRevenue - watchedExpenses);

  const onSubmit = async (data: FinancialFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const financialData = {
        period_type: data.period_type,
        revenue: data.revenue,
        expenses: data.expenses,
        gross_profit: data.gross_profit,
        net_profit: data.net_profit,
        cash_flow: data.cash_flow,
        customer_acquisition_cost: data.customer_acquisition_cost,
        lifetime_value: data.lifetime_value,
        churn_rate: data.churn_rate,
        conversion_rate: data.conversion_rate,
        monthly_recurring_revenue: data.monthly_recurring_revenue,
        burn_rate: data.burn_rate,
        runway_months: data.runway_months,
        is_projection: data.is_projection,
        notes: data.notes,
        company_id: companyId,
        business_plan_id: businessPlanId,
        period_start: format(periodStart, 'yyyy-MM-dd'),
        period_end: format(periodEnd, 'yyyy-MM-dd'),
      };

      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from('financial_data')
          .update(financialData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Financial data updated successfully');
      } else {
        const { error } = await supabase
          .from('financial_data')
          .insert(financialData);

        if (error) throw error;
        toast.success('Financial data created successfully');
      }

      onDataCreated?.();
    } catch (error) {
      console.error('Error saving financial data:', error);
      toast.error('Failed to save financial data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Period Type</Label>
          <Select 
            value={form.watch('period_type')} 
            onValueChange={(value) => form.setValue('period_type', value as any)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Period Start</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full mt-1 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(periodStart, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={periodStart}
                onSelect={(date) => date && setPeriodStart(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Period End</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full mt-1 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(periodEnd, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={periodEnd}
                onSelect={(date) => date && setPeriodEnd(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_projection"
          checked={form.watch('is_projection')}
          onCheckedChange={(checked) => form.setValue('is_projection', checked)}
        />
        <Label htmlFor="is_projection">This is a projection/forecast</Label>
      </div>

      {/* Revenue & Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="revenue">Revenue ($)</Label>
          <Input
            id="revenue"
            type="number"
            step="0.01"
            {...form.register('revenue', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="expenses">Expenses ($)</Label>
          <Input
            id="expenses"
            type="number"
            step="0.01"
            {...form.register('expenses', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>
      </div>

      {/* Profit Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="gross_profit">Gross Profit ($)</Label>
          <Input
            id="gross_profit"
            type="number"
            step="0.01"
            {...form.register('gross_profit', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="net_profit">Net Profit ($)</Label>
          <Input
            id="net_profit"
            type="number"
            step="0.01"
            {...form.register('net_profit', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="cash_flow">Cash Flow ($)</Label>
          <Input
            id="cash_flow"
            type="number"
            step="0.01"
            {...form.register('cash_flow', { valueAsNumber: true })}
            readOnly
            className="mt-1 bg-muted"
          />
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_acquisition_cost">Customer Acquisition Cost ($)</Label>
          <Input
            id="customer_acquisition_cost"
            type="number"
            step="0.01"
            {...form.register('customer_acquisition_cost', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="lifetime_value">Customer Lifetime Value ($)</Label>
          <Input
            id="lifetime_value"
            type="number"
            step="0.01"
            {...form.register('lifetime_value', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>
      </div>

      {/* Conversion & Churn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="conversion_rate">Conversion Rate (%)</Label>
          <Input
            id="conversion_rate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...form.register('conversion_rate', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="churn_rate">Churn Rate (%)</Label>
          <Input
            id="churn_rate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...form.register('churn_rate', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>
      </div>

      {/* SaaS Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="monthly_recurring_revenue">Monthly Recurring Revenue ($)</Label>
          <Input
            id="monthly_recurring_revenue"
            type="number"
            step="0.01"
            {...form.register('monthly_recurring_revenue', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="burn_rate">Burn Rate ($)</Label>
          <Input
            id="burn_rate"
            type="number"
            step="0.01"
            {...form.register('burn_rate', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="runway_months">Runway (Months)</Label>
          <Input
            id="runway_months"
            type="number"
            min="0"
            {...form.register('runway_months', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...form.register('notes')}
          placeholder="Additional notes about this financial period"
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="bg-primary-gradient">
          <TrendingUp className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : isEditing ? 'Update Data' : 'Save Financial Data'}
        </Button>
      </div>
    </form>
  );
};