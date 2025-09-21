import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InvestorCard } from "./InvestorCard";
import { PitchEmailDialog } from "./PitchEmailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter, TrendingUp } from "lucide-react";

interface InvestorMatch {
  investor: any;
  match_score: number;
  reasons: string[];
}

interface InvestorMatchesProps {
  companyId: string;
}

export function InvestorMatches({ companyId }: InvestorMatchesProps) {
  const [matches, setMatches] = useState<InvestorMatch[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<InvestorMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedInvestor, setSelectedInvestor] = useState<string | null>(null);
  const [pitchDialogOpen, setPitchDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const findMatches = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('match-investors', {
        body: { company_id: companyId }
      });

      if (error) throw error;

      setMatches(data.matches || []);
      setFilteredMatches(data.matches || []);
      
      toast({
        title: "Investor Matches Found",
        description: `Found ${data.matches?.length || 0} potential investors for your company.`
      });
    } catch (error: any) {
      console.error('Error finding matches:', error);
      toast({
        title: "Error",
        description: "Failed to find investor matches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePitch = (investorId: string) => {
    setSelectedInvestor(investorId);
    setPitchDialogOpen(true);
  };

  useEffect(() => {
    let filtered = matches;

    if (searchTerm) {
      filtered = filtered.filter(match => 
        match.investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.investor.firm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.investor.industry_focus?.some((industry: string) => 
          industry.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (stageFilter !== "all") {
      filtered = filtered.filter(match =>
        match.investor.investment_stage?.includes(stageFilter)
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(match =>
        match.investor.investor_type === typeFilter
      );
    }

    setFilteredMatches(filtered);
  }, [matches, searchTerm, stageFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investor Matches</h2>
          <p className="text-muted-foreground">
            AI-powered investor matching based on your company profile
          </p>
        </div>
        <Button 
          onClick={findMatches} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
          Find Matches
        </Button>
      </div>

      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Series A">Series A</SelectItem>
                  <SelectItem value="Series B">Series B</SelectItem>
                  <SelectItem value="Growth">Growth</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="VC">Venture Capital</SelectItem>
                  <SelectItem value="Angel">Angel Investor</SelectItem>
                  <SelectItem value="PE">Private Equity</SelectItem>
                  <SelectItem value="Corporate">Corporate VC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredMatches.length} matches found
            </Badge>
            {filteredMatches.length > 0 && (
              <Badge variant="outline">
                Avg. Score: {Math.round(filteredMatches.reduce((sum, match) => sum + match.match_score, 0) / filteredMatches.length)}%
              </Badge>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Finding the best investor matches...</p>
          </div>
        </div>
      )}

      {!loading && filteredMatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <InvestorCard
              key={match.investor.id}
              investor={match.investor}
              matchScore={match.match_score}
              matchReasons={match.reasons}
              onGeneratePitch={handleGeneratePitch}
            />
          ))}
        </div>
      )}

      {!loading && matches.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Matches Yet</h3>
          <p className="text-muted-foreground mb-4">
            Click "Find Matches" to discover investors that align with your company profile.
          </p>
        </div>
      )}

      {!loading && matches.length > 0 && filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Results Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}

      <PitchEmailDialog
        open={pitchDialogOpen}
        onOpenChange={setPitchDialogOpen}
        companyId={companyId}
        investorId={selectedInvestor}
      />
    </div>
  );
}