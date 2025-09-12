import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, Building, Target, Users } from 'lucide-react';

export const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    company_name: profile?.company_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
  });

  const [companyData, setCompanyData] = useState({
    name: '',
    description: '',
    industry: '',
    stage: '',
    website_url: '',
    location: '',
    employee_count: 1,
    funding_goal: '',
  });

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
    'Entertainment', 'Food & Beverage', 'Manufacturing', 'Real Estate',
    'Transportation', 'Energy', 'Other'
  ];

  const stages = [
    { value: 'idea', label: 'Idea Stage' },
    { value: 'mvp', label: 'MVP Development' },
    { value: 'growth', label: 'Growth Stage' },
    { value: 'scale', label: 'Scaling' }
  ];

  const handleProfileUpdate = async () => {
    setLoading(true);
    
    const { error } = await updateProfile({
      ...profileData,
    });

    if (!error) {
      setStep(2);
    }
    
    setLoading(false);
  };

  const handleCompanyCreate = async () => {
    if (!user) return;
    
    setLoading(true);

    try {
      // Create company
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          owner_id: user.id,
          name: companyData.name,
          description: companyData.description,
          industry: companyData.industry,
          stage: companyData.stage,
          website_url: companyData.website_url,
          location: companyData.location,
          employee_count: companyData.employee_count,
          funding_goal: companyData.funding_goal ? parseFloat(companyData.funding_goal) : null,
        });

      if (companyError) throw companyError;

      // Mark onboarding as completed
      const { error: profileError } = await updateProfile({
        onboarding_completed: true,
        company_name: companyData.name,
      });

      if (profileError) throw profileError;

      toast({
        title: "Welcome to Auto-CEO!",
        description: "Your profile and company have been set up successfully.",
      });

    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            {step === 1 ? <Users className="h-6 w-6" /> : <Building className="h-6 w-6" />}
            Welcome to Auto-CEO
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? "Let's complete your profile to get started"
              : "Tell us about your company to personalize your experience"
            }
          </CardDescription>
          <div className="flex items-center justify-center mt-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name (Optional)</Label>
                <Input
                  id="company_name"
                  placeholder="Your company name"
                  value={profileData.company_name}
                  onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself and your entrepreneurial journey..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <Button onClick={handleProfileUpdate} className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company_name_required">Company Name *</Label>
                <Input
                  id="company_name_required"
                  placeholder="Your company name"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your company does..."
                  value={companyData.description}
                  onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    value={companyData.industry}
                    onValueChange={(value) => setCompanyData({ ...companyData, industry: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Company Stage *</Label>
                  <Select
                    value={companyData.stage}
                    onValueChange={(value) => setCompanyData({ ...companyData, stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL (Optional)</Label>
                  <Input
                    id="website_url"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={companyData.website_url}
                    onChange={(e) => setCompanyData({ ...companyData, website_url: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={companyData.location}
                    onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_count">Team Size</Label>
                  <Input
                    id="employee_count"
                    type="number"
                    min="1"
                    value={companyData.employee_count}
                    onChange={(e) => setCompanyData({ ...companyData, employee_count: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="funding_goal">Funding Goal (USD, Optional)</Label>
                  <Input
                    id="funding_goal"
                    type="number"
                    placeholder="100000"
                    value={companyData.funding_goal}
                    onChange={(e) => setCompanyData({ ...companyData, funding_goal: e.target.value })}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCompanyCreate} 
                className="w-full" 
                disabled={loading || !companyData.name || !companyData.description || !companyData.industry || !companyData.stage}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Setup
                <Target className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};