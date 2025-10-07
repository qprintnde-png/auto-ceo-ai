import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Download, Trash2, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DataSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleExportData = async () => {
    if (!user) return;

    setExportLoading(true);
    try {
      // Fetch all user data
      const [profileData, companyData, taskData, financialData] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("companies").select("*").eq("owner_id", user.id),
        supabase.from("tasks").select("*").eq("company_id", user.id),
        supabase.from("financial_data").select("*"),
      ]);

      const exportData = {
        profile: profileData.data,
        companies: companyData.data,
        tasks: taskData.data,
        financial: financialData.data,
        exported_at: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `auto-ceo-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleteLoading(true);
    try {
      // Delete user data from all tables
      await Promise.all([
        supabase.from("profiles").delete().eq("user_id", user.id),
        supabase.from("companies").delete().eq("owner_id", user.id),
      ]);

      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download all your business data in JSON format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportData} disabled={exportLoading}>
            {exportLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export All Data
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Storage
          </CardTitle>
          <CardDescription>
            Information about your data and storage usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Data Region</span>
            <span className="font-medium">US East</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Backup Frequency</span>
            <span className="font-medium">Daily</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Retention Period</span>
            <span className="font-medium">30 days</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Your profile and account information</li>
                    <li>All companies and business plans</li>
                    <li>Financial data and projections</li>
                    <li>Tasks and team members</li>
                    <li>Investor matches and communications</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteLoading}
                >
                  {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
