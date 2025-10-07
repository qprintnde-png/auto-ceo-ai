import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Smartphone, Monitor, LogOut, Info } from "lucide-react";
import { format } from "date-fns";

interface Session {
  id: string;
  created_at: string;
  user_agent?: string;
  ip?: string;
  current?: boolean;
}

export const SecuritySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      // In a real implementation, you'd fetch all sessions from Supabase
      // For now, we'll show the current session
      if (data.session) {
        setSessions([
          {
            id: data.session.access_token.substring(0, 16),
            created_at: new Date().toISOString(),
            user_agent: navigator.userAgent,
            current: true,
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error loading sessions:", error);
    }
  };

  const handleSignOutAllDevices = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      toast({
        title: "Signed out successfully",
        description: "You've been signed out from all devices.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />;
    if (userAgent.includes("Mobile")) return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceName = (userAgent?: string) => {
    if (!userAgent) return "Unknown Device";
    if (userAgent.includes("Mobile")) return "Mobile Device";
    if (userAgent.includes("Chrome")) return "Chrome Browser";
    if (userAgent.includes("Firefox")) return "Firefox Browser";
    if (userAgent.includes("Safari")) return "Safari Browser";
    return "Desktop Browser";
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Two-factor authentication (2FA) is coming soon. Stay tuned for enhanced security features.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions across devices
              </CardDescription>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOutAllDevices}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Sign Out All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions found.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex gap-3">
                  <div className="mt-1 text-muted-foreground">
                    {getDeviceIcon(session.user_agent)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{getDeviceName(session.user_agent)}</p>
                      {session.current && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.ip || "IP not available"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Active since {format(new Date(session.created_at), "PPp")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">Not enabled</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
