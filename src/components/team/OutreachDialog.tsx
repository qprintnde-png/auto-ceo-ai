import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Copy, Send } from "lucide-react";

interface OutreachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: any;
  jobRequirement: any;
}

export function OutreachDialog({ 
  open, 
  onOpenChange, 
  candidate, 
  jobRequirement 
}: OutreachDialogProps) {
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState("outreach");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  
  const { toast } = useToast();

  const generateOutreach = async () => {
    if (!candidate || !jobRequirement) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-outreach', {
        body: { 
          candidate,
          job_requirement: jobRequirement,
          message_type: messageType
        }
      });

      if (error) throw error;

      setSubject(data.subject);
      setBody(data.body);
      
      toast({
        title: "Message Generated",
        description: "Your personalized outreach message is ready!"
      });
    } catch (error: any) {
      console.error('Error generating outreach:', error);
      toast({
        title: "Error",
        description: "Failed to generate outreach message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied to your clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please select and copy manually.",
        variant: "destructive"
      });
    }
  };

  const openEmailClient = () => {
    const emailBody = encodeURIComponent(body);
    const emailSubject = encodeURIComponent(subject);
    const mailtoLink = `mailto:${candidate?.email}?subject=${emailSubject}&body=${emailBody}`;
    window.open(mailtoLink);
  };

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSubject("");
      setBody("");
      setMessageType("outreach");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Candidate
            {candidate && (
              <span className="text-muted-foreground font-normal">
                - {candidate.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!subject && !body && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="messageType">Message Type</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outreach">Initial Outreach</SelectItem>
                    <SelectItem value="interview_invite">Interview Invitation</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="offer">Job Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateOutreach} 
                disabled={loading || !candidate}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Message...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Generate Outreach Message
                  </>
                )}
              </Button>
            </div>
          )}

          {(subject || body) && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(subject)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="body">Message Body</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(body)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Message content..."
                  className="min-h-[300px]"
                />
              </div>

              {candidate?.email && (
                <div>
                  <Label>Candidate Email</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    {candidate.email}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={openEmailClient}
                  disabled={!candidate?.email || !subject || !body}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Open in Email Client
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`Subject: ${subject}\n\n${body}`)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>

                <Button
                  variant="secondary"
                  onClick={generateOutreach}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}