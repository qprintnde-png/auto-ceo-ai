import { useState } from "react";
import { Copy, Check, Link, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  resourceType: string;
  resourceId: string;
}

export const ShareDialog = ({
  open,
  onOpenChange,
  title,
  resourceType,
  resourceId,
}: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const { toast } = useToast();

  // Generate a shareable link (public link concept - would need a public route)
  const shareLink = `${window.location.origin}/shared/${resourceType}/${resourceId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleEmailInvite = () => {
    if (!emailInput.trim()) return;
    
    // Open mailto with pre-filled content
    const subject = encodeURIComponent(`Check out: ${title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to share "${title}" with you.\n\nView it here: ${shareLink}\n\nBest regards`
    );
    window.open(`mailto:${emailInput}?subject=${subject}&body=${body}`);
    
    toast({
      title: "Email opened",
      description: `Opening email client to share with ${emailInput}`,
    });
    setEmailInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Share "{title}"
          </DialogTitle>
          <DialogDescription>
            Share this {resourceType} with team members or investors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Link sharing toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Public link</Label>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can view
              </p>
            </div>
            <Switch checked={linkEnabled} onCheckedChange={setLinkEnabled} />
          </div>

          {/* Copy link */}
          {linkEnabled && (
            <div className="space-y-2">
              <Label className="text-sm">Share link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="text-xs font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Email invite */}
          <div className="space-y-2">
            <Label className="text-sm">Invite via email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailInvite()}
              />
              <Button
                variant="outline"
                onClick={handleEmailInvite}
                disabled={!emailInput.trim()}
                className="shrink-0"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
