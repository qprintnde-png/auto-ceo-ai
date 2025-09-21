import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Mail, 
  ExternalLink,
  TrendingUp 
} from "lucide-react";

interface InvestorCardProps {
  investor: {
    id: string;
    name: string;
    firm_name?: string;
    investor_type: string;
    industry_focus?: string[];
    investment_stage?: string[];
    geographic_focus?: string[];
    min_investment?: number;
    max_investment?: number;
    bio?: string;
    email?: string;
    linkedin_url?: string;
    website_url?: string;
  };
  matchScore?: number;
  matchReasons?: string[];
  onGeneratePitch?: (investorId: string) => void;
  onContactInvestor?: (investorId: string) => void;
}

export function InvestorCard({ 
  investor, 
  matchScore, 
  matchReasons,
  onGeneratePitch,
  onContactInvestor 
}: InvestorCardProps) {
  const getScoreColor = (score?: number) => {
    if (!score) return "secondary";
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "outline";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(investor.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{investor.name}</CardTitle>
              {investor.firm_name && (
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Building2 className="h-4 w-4 mr-1" />
                  {investor.firm_name}
                </div>
              )}
            </div>
          </div>
          {matchScore && (
            <Badge variant={getScoreColor(matchScore)} className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {matchScore}% Match
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs">
            {investor.investor_type}
          </Badge>
          
          {investor.industry_focus && investor.industry_focus.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">Industry Focus</h4>
              <div className="flex flex-wrap gap-1">
                {investor.industry_focus.slice(0, 3).map((industry) => (
                  <Badge key={industry} variant="secondary" className="text-xs">
                    {industry}
                  </Badge>
                ))}
                {investor.industry_focus.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{investor.industry_focus.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {investor.investment_stage && investor.investment_stage.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">Investment Stage</h4>
              <div className="flex flex-wrap gap-1">
                {investor.investment_stage.map((stage) => (
                  <Badge key={stage} variant="outline" className="text-xs">
                    {stage}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(investor.min_investment || investor.max_investment) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-1" />
              {investor.min_investment && investor.max_investment ? (
                `$${(investor.min_investment / 1000000).toFixed(1)}M - $${(investor.max_investment / 1000000).toFixed(1)}M`
              ) : investor.min_investment ? (
                `$${(investor.min_investment / 1000000).toFixed(1)}M+`
              ) : (
                `Up to $${(investor.max_investment! / 1000000).toFixed(1)}M`
              )}
            </div>
          )}

          {investor.geographic_focus && investor.geographic_focus.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {investor.geographic_focus.slice(0, 2).join(', ')}
              {investor.geographic_focus.length > 2 && ' +more'}
            </div>
          )}
        </div>

        {investor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {investor.bio}
          </p>
        )}

        {matchReasons && matchReasons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Why this is a good match:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {matchReasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onGeneratePitch && (
            <Button 
              onClick={() => onGeneratePitch(investor.id)}
              variant="default"
              size="sm"
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-1" />
              Generate Pitch
            </Button>
          )}
          
          <div className="flex gap-1">
            {investor.email && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`mailto:${investor.email}`, '_blank')}
              >
                <Mail className="h-4 w-4" />
              </Button>
            )}
            
            {investor.linkedin_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(investor.linkedin_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}