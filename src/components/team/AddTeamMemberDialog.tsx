import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  role: z.string().min(1, "Role is required"),
  department: z.string().optional(),
  employment_type: z.string().min(1, "Employment type is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  salary: z.number().optional(),
  hourly_rate: z.number().optional(),
  equity_percentage: z.number().optional(),
  bio: z.string().optional(),
  linkedin_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  start_date: z.string().optional(),
});

type TeamMemberForm = z.infer<typeof teamMemberSchema>;

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onTeamMemberAdded: () => void;
}

export function AddTeamMemberDialog({ 
  open, 
  onOpenChange, 
  companyId, 
  onTeamMemberAdded 
}: AddTeamMemberDialogProps) {
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const { toast } = useToast();

  const form = useForm<TeamMemberForm>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      department: "",
      employment_type: "",
      skills: [],
      bio: "",
      linkedin_url: "",
      portfolio_url: "",
    },
  });

  const watchedSkills = form.watch("skills");

  const addSkill = () => {
    if (skillInput.trim() && !watchedSkills.includes(skillInput.trim())) {
      form.setValue("skills", [...watchedSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    form.setValue("skills", watchedSkills.filter(skill => skill !== skillToRemove));
  };

  const onSubmit = async (data: TeamMemberForm) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('team_members')
        .insert({
          company_id: companyId,
          name: data.name,
          email: data.email || null,
          role: data.role,
          department: data.department || null,
          employment_type: data.employment_type,
          skills: data.skills,
          salary: data.salary || null,
          hourly_rate: data.hourly_rate || null,
          equity_percentage: data.equity_percentage || null,
          bio: data.bio || null,
          linkedin_url: data.linkedin_url || null,
          portfolio_url: data.portfolio_url || null,
          start_date: data.start_date || null,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Team Member Added",
        description: `${data.name} has been added to your team.`,
      });

      form.reset();
      onTeamMemberAdded();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSkillInput("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="John Doe"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                {...form.register("role")}
                placeholder="Software Engineer"
              />
              {form.formState.errors.role && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                {...form.register("department")}
                placeholder="Engineering"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="employment_type">Employment Type *</Label>
            <Select onValueChange={(value) => form.setValue("employment_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="intern">Intern</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.employment_type && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.employment_type.message}
              </p>
            )}
          </div>

          <div>
            <Label>Skills *</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
            {form.formState.errors.skills && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.skills.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salary">Annual Salary ($)</Label>
              <Input
                id="salary"
                type="number"
                {...form.register("salary", { valueAsNumber: true })}
                placeholder="75000"
              />
            </div>

            <div>
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                {...form.register("hourly_rate", { valueAsNumber: true })}
                placeholder="50"
              />
            </div>

            <div>
              <Label htmlFor="equity_percentage">Equity (%)</Label>
              <Input
                id="equity_percentage"
                type="number"
                step="0.01"
                max="100"
                {...form.register("equity_percentage", { valueAsNumber: true })}
                placeholder="1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...form.register("bio")}
              placeholder="Brief description of the team member..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                {...form.register("linkedin_url")}
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            <div>
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                {...form.register("portfolio_url")}
                placeholder="https://johndoe.dev"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              {...form.register("start_date")}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}