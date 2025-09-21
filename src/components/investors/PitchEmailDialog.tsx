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

interface PitchEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  investorId: string | null;
}

export function PitchEmailDialog({ 
  open, 
  onOpenChange, 
  companyId, 
  investorId 
}: PitchEmailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("professional");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [investorEmail, setInvestorEmail] = useState("");
  const [investorName, setInvestorName] = useState("");
  
  const { toast } = useToast();

  const generatePitchEmail = async () => {
    if (!investorId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-pitch-email', {
        body: { 
          company_id: companyId,
          investor_id: investorId,
          tone 
        }
      });

      if (error) throw error;

      setSubject(data.subject);
      setBody(data.body);
      setInvestorEmail(data.investor_email || "");
      setInvestorName(data.investor_name || "");
      
      toast({
        title: "Pitch Email Generated",
        description: "Your personalized pitch email is ready!"
      });
    } catch (error: any) {
      console.error('Error generating pitch email:', error);
      toast({
        title: "Error",
        description: "Failed to generate pitch email. Please try again.",
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
        description: "Email content has been copied to your clipboard."
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
    const mailtoLink = `mailto:${investorEmail}?subject=${emailSubject}&body=${emailBody}`;
    window.open(mailtoLink);
  };

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setSubject("");
      setBody("");
      setInvestorEmail("");
      setInvestorName("");
      setTone("professional");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Generate Pitch Email
            {investorName && (
              <span className="text-muted-foreground font-normal">
                for {investorName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!subject && !body && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="tone">Email Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generatePitchEmail} 
                disabled={loading || !investorId}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Pitch Email...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Generate Pitch Email
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
                  <Label htmlFor="body">Email Body</Label>
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
                  placeholder="Email content..."
                  className="min-h-[300px]"
                />
              </div>

              {investorEmail && (
                <div>
                  <Label htmlFor="investor-email">Investor Email</Label>
                  <Input
                    id="investor-email"
                    value={investorEmail}
                    onChange={(e) => setInvestorEmail(e.target.value)}
                    placeholder="investor@email.com"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={openEmailClient}
                  disabled={!investorEmail || !subject || !body}
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
                  onClick={generatePitchEmail}
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