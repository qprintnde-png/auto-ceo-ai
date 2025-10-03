import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Settings, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Company {
  id: string;
  name: string;
  stage: string;
  industry: string;
  current_funding: number;
  funding_goal: number;
  employee_count: number;
  description: string;
  created_at: string;
}

interface CompanySelectorProps {
  selectedCompany: Company | null;
  onCompanySelect: (company: Company | null) => void;
}

export const CompanySelector = ({ selectedCompany, onCompanySelect }: CompanySelectorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    stage: '',
    description: '',
    funding_goal: '',
  });

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
      
      // Auto-select first company if none selected
      if (!selectedCompany && data && data.length > 0) {
        onCompanySelect(data[0]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch companies",
        variant: "destructive",
      });
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.industry) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: newCompany.name,
          industry: newCompany.industry,
          stage: newCompany.stage,
          description: newCompany.description,
          funding_goal: newCompany.funding_goal ? parseFloat(newCompany.funding_goal) : null,
          owner_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setCompanies(prev => [data, ...prev]);
      onCompanySelect(data);
      setIsAddingCompany(false);
      setNewCompany({
        name: '',
        industry: '',
        stage: '',
        description: '',
        funding_goal: '',
      });

      toast({
        title: "Success",
        description: "Company added successfully",
      });
    } catch (error) {
      console.error('Error adding company:', error);
      toast({
        title: "Error",
        description: "Failed to add company",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  return (
    <Card className="shadow-soft bg-card-gradient border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Portfolio Companies
          </CardTitle>
          <Dialog open={isAddingCompany} onOpenChange={setIsAddingCompany}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary-gradient hover:opacity-90">
                <Plus className="h-4 w-4 mr-1" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
                <DialogDescription>
                  Create a new company to add to your portfolio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={newCompany.industry} onValueChange={(value) => setNewCompany(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Select value={newCompany.stage} onValueChange={(value) => setNewCompany(prev => ({ ...prev, stage: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Idea">Idea</SelectItem>
                      <SelectItem value="MVP">MVP</SelectItem>
                      <SelectItem value="Seed">Seed</SelectItem>
                      <SelectItem value="Series A">Series A</SelectItem>
                      <SelectItem value="Series B">Series B</SelectItem>
                      <SelectItem value="Growth">Growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="funding_goal">Funding Goal ($)</Label>
                  <Input
                    id="funding_goal"
                    type="number"
                    value={newCompany.funding_goal}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, funding_goal: e.target.value }))}
                    placeholder="100000"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCompany.description}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the company"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleAddCompany} 
                  disabled={loading}
                  className="w-full bg-primary-gradient hover:opacity-90"
                >
                  {loading ? 'Adding...' : 'Add Company'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No companies yet</p>
              <Button 
                onClick={() => setIsAddingCompany(true)}
                className="bg-primary-gradient hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Company
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Label>Select Active Company</Label>
                <Select 
                  value={selectedCompany?.id || ''} 
                  onValueChange={(value) => {
                    const company = companies.find(c => c.id === value);
                    onCompanySelect(company || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCompany && (
                <div className="p-4 rounded-lg bg-muted/10 border border-border/50 shadow-soft">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{selectedCompany.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedCompany.industry}</p>
                    </div>
                    <Badge variant="secondary">{selectedCompany.stage}</Badge>
                  </div>
                  
                  {selectedCompany.description && (
                    <p className="text-sm text-muted-foreground mb-3">{selectedCompany.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Funding:</span>
                      <p className="font-medium">{formatCurrency(selectedCompany.current_funding || 0)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Funding Goal:</span>
                      <p className="font-medium">{formatCurrency(selectedCompany.funding_goal || 0)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Link to="/business-plan">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Business Plan
                      </Button>
                    </Link>
                    <Link to="/financial">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Financials
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};