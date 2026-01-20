export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      business_plans: {
        Row: {
          ai_generated: boolean
          company_id: string
          competitive_analysis: string | null
          created_at: string
          description: string | null
          executive_summary: string | null
          financial_projections: string | null
          funding_requirements: number | null
          id: string
          market_analysis: string | null
          marketing_strategy: string | null
          operations_plan: string | null
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          ai_generated?: boolean
          company_id: string
          competitive_analysis?: string | null
          created_at?: string
          description?: string | null
          executive_summary?: string | null
          financial_projections?: string | null
          funding_requirements?: number | null
          id?: string
          market_analysis?: string | null
          marketing_strategy?: string | null
          operations_plan?: string | null
          status?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          ai_generated?: boolean
          company_id?: string
          competitive_analysis?: string | null
          created_at?: string
          description?: string | null
          executive_summary?: string | null
          financial_projections?: string | null
          funding_requirements?: number | null
          id?: string
          market_analysis?: string | null
          marketing_strategy?: string | null
          operations_plan?: string | null
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cached_sections: {
        Row: {
          ai_provider: string
          content: string
          created_at: string | null
          expires_at: string | null
          hit_count: number | null
          id: string
          input_hash: string
          section_type: string
        }
        Insert: {
          ai_provider: string
          content: string
          created_at?: string | null
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          input_hash: string
          section_type: string
        }
        Update: {
          ai_provider?: string
          content?: string
          created_at?: string | null
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          input_hash?: string
          section_type?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          current_funding: number | null
          description: string | null
          employee_count: number | null
          founded_date: string | null
          funding_goal: number | null
          id: string
          industry: string | null
          location: string | null
          name: string
          owner_id: string
          stage: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          current_funding?: number | null
          description?: string | null
          employee_count?: number | null
          founded_date?: string | null
          funding_goal?: number | null
          id?: string
          industry?: string | null
          location?: string | null
          name: string
          owner_id: string
          stage?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          current_funding?: number | null
          description?: string | null
          employee_count?: number | null
          founded_date?: string | null
          funding_goal?: number | null
          id?: string
          industry?: string | null
          location?: string | null
          name?: string
          owner_id?: string
          stage?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      financial_data: {
        Row: {
          burn_rate: number | null
          business_plan_id: string | null
          cash_flow: number | null
          churn_rate: number | null
          company_id: string
          conversion_rate: number | null
          created_at: string
          customer_acquisition_cost: number | null
          expenses: number | null
          gross_profit: number | null
          id: string
          is_projection: boolean
          lifetime_value: number | null
          monthly_recurring_revenue: number | null
          net_profit: number | null
          notes: string | null
          period_end: string
          period_start: string
          period_type: string
          revenue: number | null
          runway_months: number | null
          updated_at: string
        }
        Insert: {
          burn_rate?: number | null
          business_plan_id?: string | null
          cash_flow?: number | null
          churn_rate?: number | null
          company_id: string
          conversion_rate?: number | null
          created_at?: string
          customer_acquisition_cost?: number | null
          expenses?: number | null
          gross_profit?: number | null
          id?: string
          is_projection?: boolean
          lifetime_value?: number | null
          monthly_recurring_revenue?: number | null
          net_profit?: number | null
          notes?: string | null
          period_end: string
          period_start: string
          period_type: string
          revenue?: number | null
          runway_months?: number | null
          updated_at?: string
        }
        Update: {
          burn_rate?: number | null
          business_plan_id?: string | null
          cash_flow?: number | null
          churn_rate?: number | null
          company_id?: string
          conversion_rate?: number | null
          created_at?: string
          customer_acquisition_cost?: number | null
          expenses?: number | null
          gross_profit?: number | null
          id?: string
          is_projection?: boolean
          lifetime_value?: number | null
          monthly_recurring_revenue?: number | null
          net_profit?: number | null
          notes?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          revenue?: number | null
          runway_months?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_data_business_plan_id_fkey"
            columns: ["business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_matches: {
        Row: {
          business_plan_id: string | null
          company_id: string
          contact_date: string | null
          created_at: string
          id: string
          investment_amount: number | null
          investor_id: string
          last_interaction: string | null
          match_score: number | null
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_plan_id?: string | null
          company_id: string
          contact_date?: string | null
          created_at?: string
          id?: string
          investment_amount?: number | null
          investor_id: string
          last_interaction?: string | null
          match_score?: number | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_plan_id?: string | null
          company_id?: string
          contact_date?: string | null
          created_at?: string
          id?: string
          investment_amount?: number | null
          investor_id?: string
          last_interaction?: string | null
          match_score?: number | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_matches_business_plan_id_fkey"
            columns: ["business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_matches_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          firm_name: string | null
          geographic_focus: string[] | null
          id: string
          industry_focus: string[] | null
          investment_criteria: string | null
          investment_stage: string[] | null
          investor_type: string
          is_active: boolean
          is_verified: boolean
          linkedin_url: string | null
          max_investment: number | null
          min_investment: number | null
          name: string
          notable_investments: string[] | null
          phone: string | null
          portfolio_size: number | null
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          firm_name?: string | null
          geographic_focus?: string[] | null
          id?: string
          industry_focus?: string[] | null
          investment_criteria?: string | null
          investment_stage?: string[] | null
          investor_type: string
          is_active?: boolean
          is_verified?: boolean
          linkedin_url?: string | null
          max_investment?: number | null
          min_investment?: number | null
          name: string
          notable_investments?: string[] | null
          phone?: string | null
          portfolio_size?: number | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          firm_name?: string | null
          geographic_focus?: string[] | null
          id?: string
          industry_focus?: string[] | null
          investment_criteria?: string | null
          investment_stage?: string[] | null
          investor_type?: string
          is_active?: boolean
          is_verified?: boolean
          linkedin_url?: string | null
          max_investment?: number | null
          min_investment?: number | null
          name?: string
          notable_investments?: string[] | null
          phone?: string | null
          portfolio_size?: number | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          business_plan_id: string | null
          category: string | null
          company_id: string
          completed_at: string | null
          created_at: string
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          business_plan_id?: string | null
          category?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          business_plan_id?: string | null
          category?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_business_plan_id_fkey"
            columns: ["business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bio: string | null
          company_id: string
          created_at: string
          department: string | null
          email: string | null
          employment_type: string
          end_date: string | null
          equity_percentage: number | null
          hourly_rate: number | null
          id: string
          linkedin_url: string | null
          name: string
          notes: string | null
          performance_rating: number | null
          portfolio_url: string | null
          role: string
          salary: number | null
          skills: string[] | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          company_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          employment_type: string
          end_date?: string | null
          equity_percentage?: number | null
          hourly_rate?: number | null
          id?: string
          linkedin_url?: string | null
          name: string
          notes?: string | null
          performance_rating?: number | null
          portfolio_url?: string | null
          role: string
          salary?: number | null
          skills?: string[] | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          company_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          employment_type?: string
          end_date?: string | null
          equity_percentage?: number | null
          hourly_rate?: number | null
          id?: string
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          performance_rating?: number | null
          portfolio_url?: string | null
          role?: string
          salary?: number | null
          skills?: string[] | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_cache: { Args: never; Returns: number }
    }
    Enums: {
      user_role: "founder" | "investor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["founder", "investor", "admin"],
    },
  },
} as const
