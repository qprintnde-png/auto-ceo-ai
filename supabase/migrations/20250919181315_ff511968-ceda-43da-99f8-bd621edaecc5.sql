-- Create business_plans table for AI-generated business plans
CREATE TABLE public.business_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, archived
  executive_summary TEXT,
  market_analysis TEXT,
  competitive_analysis TEXT,
  marketing_strategy TEXT,
  operations_plan TEXT,
  financial_projections TEXT,
  funding_requirements DECIMAL(15,2),
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table for roadmap and project management
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  business_plan_id UUID REFERENCES public.business_plans(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo', -- todo, in_progress, review, completed
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  category TEXT, -- marketing, development, operations, finance, legal
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  dependencies TEXT[], -- Array of task IDs that must be completed first
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_data table for forecasts and KPIs
CREATE TABLE public.financial_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  business_plan_id UUID REFERENCES public.business_plans(id) ON DELETE SET NULL,
  period_type TEXT NOT NULL, -- monthly, quarterly, yearly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  revenue DECIMAL(15,2) DEFAULT 0,
  expenses DECIMAL(15,2) DEFAULT 0,
  gross_profit DECIMAL(15,2) DEFAULT 0,
  net_profit DECIMAL(15,2) DEFAULT 0,
  cash_flow DECIMAL(15,2) DEFAULT 0,
  burn_rate DECIMAL(15,2) DEFAULT 0,
  runway_months INTEGER DEFAULT 0,
  customer_acquisition_cost DECIMAL(10,2) DEFAULT 0,
  lifetime_value DECIMAL(10,2) DEFAULT 0,
  monthly_recurring_revenue DECIMAL(15,2) DEFAULT 0,
  churn_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  is_projection BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investors table for investor profiles and matching
CREATE TABLE public.investors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  firm_name TEXT,
  investor_type TEXT NOT NULL, -- angel, vc, pe, corporate, accelerator
  investment_stage TEXT[], -- seed, series_a, series_b, series_c, growth, late_stage
  industry_focus TEXT[], -- Array of industries
  geographic_focus TEXT[], -- Array of locations/regions
  min_investment DECIMAL(15,2),
  max_investment DECIMAL(15,2),
  portfolio_size INTEGER DEFAULT 0,
  website_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  investment_criteria TEXT,
  notable_investments TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table for hired talent and contractors
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL,
  department TEXT, -- engineering, marketing, sales, operations, finance, hr
  employment_type TEXT NOT NULL, -- full_time, part_time, contractor, freelancer, intern
  start_date DATE,
  end_date DATE,
  hourly_rate DECIMAL(8,2),
  salary DECIMAL(12,2),
  equity_percentage DECIMAL(5,2),
  skills TEXT[], -- Array of skills
  bio TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, terminated
  performance_rating DECIMAL(3,1), -- 1-5 rating
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investor_matches table for tracking investor connections
CREATE TABLE public.investor_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  business_plan_id UUID REFERENCES public.business_plans(id) ON DELETE SET NULL,
  match_score DECIMAL(3,1), -- AI-calculated compatibility score (0-10)
  status TEXT NOT NULL DEFAULT 'potential', -- potential, contacted, interested, meeting_scheduled, negotiating, closed, rejected
  contact_date TIMESTAMP WITH TIME ZONE,
  last_interaction TIMESTAMP WITH TIME ZONE,
  investment_amount DECIMAL(15,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, investor_id)
);

-- Enable Row Level Security
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_plans
CREATE POLICY "Users can view their company's business plans" 
ON public.business_plans 
FOR SELECT 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create business plans for their companies" 
ON public.business_plans 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their company's business plans" 
ON public.business_plans 
FOR UPDATE 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their company's business plans" 
ON public.business_plans 
FOR DELETE 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- RLS Policies for tasks
CREATE POLICY "Users can view their company's tasks" 
ON public.tasks 
FOR SELECT 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  ) OR assigned_to = auth.uid()
);

CREATE POLICY "Users can create tasks for their companies" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their company's tasks or assigned tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  ) OR assigned_to = auth.uid()
);

CREATE POLICY "Users can delete their company's tasks" 
ON public.tasks 
FOR DELETE 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- RLS Policies for financial_data
CREATE POLICY "Users can view their company's financial data" 
ON public.financial_data 
FOR SELECT 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create financial data for their companies" 
ON public.financial_data 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their company's financial data" 
ON public.financial_data 
FOR UPDATE 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their company's financial data" 
ON public.financial_data 
FOR DELETE 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- RLS Policies for investors (publicly viewable for matching)
CREATE POLICY "Investors are viewable by authenticated users" 
ON public.investors 
FOR SELECT 
TO authenticated
USING (is_active = true);

CREATE POLICY "Investor users can update their own profile" 
ON public.investors 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Investor users can insert their own profile" 
ON public.investors 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- RLS Policies for team_members
CREATE POLICY "Users can view their company's team members" 
ON public.team_members 
FOR SELECT 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  ) OR user_id = auth.uid()
);

CREATE POLICY "Users can create team members for their companies" 
ON public.team_members 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their company's team members" 
ON public.team_members 
FOR UPDATE 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their company's team members" 
ON public.team_members 
FOR DELETE 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- RLS Policies for investor_matches
CREATE POLICY "Users can view their company's investor matches" 
ON public.investor_matches 
FOR SELECT 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create investor matches for their companies" 
ON public.investor_matches 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their company's investor matches" 
ON public.investor_matches 
FOR UPDATE 
USING (
  company_id IN (
    SELECT id FROM public.companies WHERE owner_id = auth.uid()
  )
);

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_business_plans_updated_at
  BEFORE UPDATE ON public.business_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_data_updated_at
  BEFORE UPDATE ON public.financial_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investors_updated_at
  BEFORE UPDATE ON public.investors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investor_matches_updated_at
  BEFORE UPDATE ON public.investor_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_business_plans_company_id ON public.business_plans(company_id);
CREATE INDEX idx_business_plans_status ON public.business_plans(status);
CREATE INDEX idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_financial_data_company_id ON public.financial_data(company_id);
CREATE INDEX idx_financial_data_period ON public.financial_data(period_start, period_end);
CREATE INDEX idx_investors_type ON public.investors(investor_type);
CREATE INDEX idx_investors_stage ON public.investors USING GIN(investment_stage);
CREATE INDEX idx_investors_industry ON public.investors USING GIN(industry_focus);
CREATE INDEX idx_team_members_company_id ON public.team_members(company_id);
CREATE INDEX idx_team_members_status ON public.team_members(status);
CREATE INDEX idx_investor_matches_company_id ON public.investor_matches(company_id);
CREATE INDEX idx_investor_matches_status ON public.investor_matches(status);