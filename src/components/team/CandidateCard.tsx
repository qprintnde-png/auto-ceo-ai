import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  Calendar,
  Star,
  Clock,
  Award
} from "lucide-react";

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    email: string;
    location: string;
    years_experience: number;
    skills: string[];
    bio: string;
    hourly_rate: number;
    portfolio_url?: string;
    linkedin_url?: string;
    match_score: number;
    fit_reason: string;
    availability?: string;
    response_time?: string;
    rating?: string;
    completed_projects?: number;
    success_rate?: string;
    last_active?: string;
  };
  onContact?: (candidate: any) => void;
  onViewProfile?: (candidate: any) => void;
}

export function CandidateCard({ candidate, onContact, onViewProfile }: CandidateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 75) return "secondary";
    if (score >= 60) return "outline";
    return "destructive";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{candidate.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {candidate.location}
              </div>
            </div>
          </div>
          <Badge variant={getScoreColor(candidate.match_score)} className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {candidate.match_score}% Match
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Experience:</span>
            <span className="font-medium">{candidate.years_experience} years</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rate:</span>
            <div className="flex items-center font-medium">
              <DollarSign className="h-3 w-3 mr-1" />
              ${candidate.hourly_rate}/hr
            </div>
          </div>

          {candidate.availability && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available:</span>
              <span className="font-medium">{candidate.availability}</span>
            </div>
          )}

          {candidate.response_time && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Response time:</span>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span className="font-medium">{candidate.response_time}</span>
              </div>
            </div>
          )}

          {candidate.rating && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rating:</span>
              <div className="flex items-center">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{candidate.rating}</span>
              </div>
            </div>
          )}

          {candidate.completed_projects && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Projects:</span>
              <div className="flex items-center">
                <Award className="h-3 w-3 mr-1" />
                <span className="font-medium">{candidate.completed_projects}</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Skills</h4>
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{candidate.skills.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Why they're a good fit:</h4>
          <p className="text-xs text-muted-foreground">{candidate.fit_reason}</p>
        </div>

        {candidate.bio && (
          <div>
            <h4 className="text-sm font-medium mb-1">Bio</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {candidate.bio}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onContact && (
            <Button 
              onClick={() => onContact(candidate)}
              size="sm"
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-1" />
              Contact
            </Button>
          )}
          
          <div className="flex gap-1">
            {candidate.portfolio_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(candidate.portfolio_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            
            {candidate.linkedin_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(candidate.linkedin_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {candidate.last_active && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            Last active: {candidate.last_active}
          </div>
        )}
      </CardContent>
    </Card>
  );
}