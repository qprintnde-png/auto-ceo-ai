import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AddTeamMemberDialog } from "@/components/team/AddTeamMemberDialog";
import { CandidateFinder } from "@/components/team/CandidateFinder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Plus, 
  Search, 
  Building2, 
  AlertCircle, 
  Mail, 
  ExternalLink,
  DollarSign,
  Calendar
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  department?: string;
  employment_type: string;
  skills?: string[];
  salary?: number;
  hourly_rate?: number;
  equity_percentage?: number;
  bio?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status: string;
  start_date?: string;
  created_at: string;
}

export default function Team() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [candidateFinderOpen, setCandidateFinderOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCompany) {
      fetchTeamMembers();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
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

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('company_id', selectedCompany)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <Users className="h-8 w-8 animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading your team...</p>
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
            You need to create a company profile first before managing your team. 
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
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">
              Manage your team members and find new talent
            </p>
          </div>
        </div>

        {companies.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Select Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a company..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={() => setAddMemberDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
          <Button 
            variant="outline"
            onClick={() => setCandidateFinderOpen(true)}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Find Candidates
          </Button>
        </div>
      </div>

      {selectedCompany && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Team Members {selectedCompanyData && `- ${selectedCompanyData.name}`}
            </h2>
            <Badge variant="secondary">
              {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {teamMembers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Team Members Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your team by adding members or finding candidates.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setAddMemberDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                  <Button variant="outline" onClick={() => setCandidateFinderOpen(true)}>
                    <Search className="h-4 w-4 mr-2" />
                    Find Candidates
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {member.department && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Department:</span>
                          <span className="font-medium">{member.department}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{member.employment_type}</span>
                      </div>

                      {member.salary && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Salary:</span>
                          <div className="flex items-center font-medium">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {member.salary.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {member.hourly_rate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Rate:</span>
                          <div className="flex items-center font-medium">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {member.hourly_rate}/hr
                          </div>
                        </div>
                      )}

                      {member.equity_percentage && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Equity:</span>
                          <span className="font-medium">{member.equity_percentage}%</span>
                        </div>
                      )}

                      {member.start_date && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Start Date:</span>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="font-medium">
                              {new Date(member.start_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {member.skills && member.skills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {member.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {member.bio}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      {member.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {member.linkedin_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(member.linkedin_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}

                      {member.portfolio_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(member.portfolio_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <AddTeamMemberDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        companyId={selectedCompany}
        onTeamMemberAdded={fetchTeamMembers}
      />

      <CandidateFinder
        open={candidateFinderOpen}
        onOpenChange={setCandidateFinderOpen}
        companyId={selectedCompany}
      />
    </div>
  );
}