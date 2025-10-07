import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link as LinkIcon, Unlink } from "lucide-react";

interface Integration {
  name: string;
  key: string;
  description: string;
  icon: string;
}

const integrations: Integration[] = [
  { name: "Trello", key: "trello_api_key", description: "Sync tasks with Trello boards", icon: "📋" },
  { name: "Slack", key: "slack_webhook", description: "Receive notifications in Slack", icon: "💬" },
  { name: "QuickBooks", key: "quickbooks_api_key", description: "Sync financial data", icon: "💰" },
  { name: "Google Analytics", key: "ga_tracking_id", description: "Track user behavior", icon: "📊" },
  { name: "Stripe", key: "stripe_api_key", description: "Payment processing", icon: "💳" },
];

export const IntegrationsSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [connectedKeys, setConnectedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadIntegrations = async () => {
      if (!user) return;
      
      const { data } = await supabase.auth.getUser();
      if (data?.user?.user_metadata?.integrations) {
        const savedIntegrations = data.user.user_metadata.integrations;
        setConnectedKeys(new Set(Object.keys(savedIntegrations).filter(k => savedIntegrations[k])));
      }
    };
    
    loadIntegrations();
  }, [user]);

  const handleConnect = async (integration: Integration) => {
    if (!user) return;
    
    const apiKey = apiKeys[integration.key];
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: `Please enter your ${integration.name} API key`,
        variant: "destructive",
      });
      return;
    }

    setLoading(integration.key);
    try {
      const { data } = await supabase.auth.getUser();
      const currentIntegrations = data?.user?.user_metadata?.integrations || {};

      const { error } = await supabase.auth.updateUser({
        data: {
          integrations: {
            ...currentIntegrations,
            [integration.key]: apiKey,
          }
        }
      });

      if (error) throw error;

      setConnectedKeys(new Set([...connectedKeys, integration.key]));
      setApiKeys({ ...apiKeys, [integration.key]: "" });

      toast({
        title: "Integration connected",
        description: `${integration.name} has been connected successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    if (!user) return;

    setLoading(integration.key);
    try {
      const { data } = await supabase.auth.getUser();
      const currentIntegrations = data?.user?.user_metadata?.integrations || {};
      delete currentIntegrations[integration.key];

      const { error } = await supabase.auth.updateUser({
        data: { integrations: currentIntegrations }
      });

      if (error) throw error;

      const newConnected = new Set(connectedKeys);
      newConnected.delete(integration.key);
      setConnectedKeys(newConnected);

      toast({
        title: "Integration disconnected",
        description: `${integration.name} has been disconnected.`,
      });
    } catch (error: any) {
      toast({
        title: "Disconnection failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {integrations.map((integration) => {
        const isConnected = connectedKeys.has(integration.key);
        const isLoading = loading === integration.key;

        return (
          <Card key={integration.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
                {isConnected && (
                  <Badge variant="secondary" className="gap-1">
                    <LinkIcon className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {!isConnected ? (
                  <>
                    <div className="flex-1">
                      <Label htmlFor={integration.key} className="sr-only">
                        API Key
                      </Label>
                      <Input
                        id={integration.key}
                        type="password"
                        placeholder={`Enter ${integration.name} API key`}
                        value={apiKeys[integration.key] || ""}
                        onChange={(e) =>
                          setApiKeys({ ...apiKeys, [integration.key]: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      onClick={() => handleConnect(integration)}
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Connect
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => handleDisconnect(integration)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Unlink className="mr-2 h-4 w-4" />
                    )}
                    Disconnect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
