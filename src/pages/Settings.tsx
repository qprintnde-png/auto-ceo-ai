import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { DataSettings } from "@/components/settings/DataSettings";

const Settings = () => {
  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full overflow-x-auto flex h-auto">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
          <TabsTrigger value="account" className="text-xs sm:text-sm">Account</TabsTrigger>
          <TabsTrigger value="company" className="text-xs sm:text-sm">Company</TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs sm:text-sm">Preferences</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs sm:text-sm">Integrations</TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">Security</TabsTrigger>
          <TabsTrigger value="data" className="text-xs sm:text-sm">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <CompanySettings />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <PreferencesSettings />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <DataSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
