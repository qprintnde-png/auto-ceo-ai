import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { InvestorMatches } from "@/components/investors/InvestorMatches";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { InvestorPageSkeleton } from '@/components/skeletons';

interface Company {
  id: string;
  name: string;
  industry?: string;
  stage?: string;
  description?: string;
}

export default function Investors() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, industry, stage, description')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCompanies(data || []);
      if (data && data.length > 0) {
        setSelectedCompany(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <InvestorPageSkeleton />;
  }

  if (companies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Building2}
          title="No Companies Yet"
          description="Create a company profile first to find investor matches tailored to your business needs."
          action={{
            label: 'Go to Dashboard',
            onClick: () => window.location.href = '/dashboard',
          }}
        />
      </div>
    );
  }

  const selectedCompanyData = companies.find(c => c.id === selectedCompany);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        {companies.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Select Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{company.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {company.industry} • {company.stage}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCompanyData && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-medium mb-2">{selectedCompanyData.name}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {selectedCompanyData.industry && (
                        <span>Industry: {selectedCompanyData.industry}</span>
                      )}
                      {selectedCompanyData.stage && (
                        <span>Stage: {selectedCompanyData.stage}</span>
                      )}
                    </div>
                    {selectedCompanyData.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {selectedCompanyData.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedCompany && (
        <InvestorMatches companyId={selectedCompany} />
      )}
    </div>
  );
}