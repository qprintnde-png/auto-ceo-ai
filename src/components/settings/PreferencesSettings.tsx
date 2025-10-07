import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Preferences {
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_digest: boolean;
  task_reminders: boolean;
  investor_updates: boolean;
  default_dashboard_view: string;
  timezone: string;
}

export const PreferencesSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    email_notifications: true,
    push_notifications: false,
    weekly_digest: true,
    task_reminders: true,
    investor_updates: true,
    default_dashboard_view: "overview",
    timezone: "UTC",
  });

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Store preferences in user metadata
      const { error } = await supabase.auth.updateUser({
        data: { preferences }
      });

      if (error) throw error;

      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      const { data } = await supabase.auth.getUser();
      if (data?.user?.user_metadata?.preferences) {
        setPreferences(data.user.user_metadata.preferences);
      }
    };
    
    loadPreferences();
  }, [user]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage how you receive updates and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex flex-col gap-1 cursor-pointer">
              <span className="font-medium">Email Notifications</span>
              <span className="text-sm text-muted-foreground">Receive updates via email</span>
            </Label>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, email_notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="flex flex-col gap-1 cursor-pointer">
              <span className="font-medium">Push Notifications</span>
              <span className="text-sm text-muted-foreground">Browser push notifications</span>
            </Label>
            <Switch
              id="push-notifications"
              checked={preferences.push_notifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, push_notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="weekly-digest" className="flex flex-col gap-1 cursor-pointer">
              <span className="font-medium">Weekly Digest</span>
              <span className="text-sm text-muted-foreground">Summary of your week's activity</span>
            </Label>
            <Switch
              id="weekly-digest"
              checked={preferences.weekly_digest}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, weekly_digest: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="task-reminders" className="flex flex-col gap-1 cursor-pointer">
              <span className="font-medium">Task Reminders</span>
              <span className="text-sm text-muted-foreground">Get reminded about upcoming tasks</span>
            </Label>
            <Switch
              id="task-reminders"
              checked={preferences.task_reminders}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, task_reminders: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="investor-updates" className="flex flex-col gap-1 cursor-pointer">
              <span className="font-medium">Investor Updates</span>
              <span className="text-sm text-muted-foreground">New investor match notifications</span>
            </Label>
            <Switch
              id="investor-updates"
              checked={preferences.investor_updates}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, investor_updates: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Preferences</CardTitle>
          <CardDescription>
            Customize your dashboard experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-view">Default Dashboard View</Label>
            <Select
              value={preferences.default_dashboard_view}
              onValueChange={(value) =>
                setPreferences({ ...preferences, default_dashboard_view: value })
              }
            >
              <SelectTrigger id="default-view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="metrics">Metrics</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="activity">Activity Feed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) =>
                setPreferences({ ...preferences, timezone: value })
              }
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Preferences
      </Button>
    </div>
  );
};
