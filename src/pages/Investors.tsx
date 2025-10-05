import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { InvestorMatches } from "@/components/investors/InvestorMatches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, AlertCircle } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your companies...</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to create a company profile first before finding investor matches. 
            <a href="/dashboard" className="ml-1 underline hover:no-underline">
              Go to Dashboard
            </a>
          </AlertDescription>
        </Alert>
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