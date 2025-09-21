import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CandidateCard } from "./CandidateCard";
import { OutreachDialog } from "./OutreachDialog";
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
import { Loader2, Search, Plus, X } from "lucide-react";

const jobRequirementSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  experience_level: z.string().min(1, "Experience level is required"),
  employment_type: z.string().min(1, "Employment type is required"),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  description: z.string().min(1, "Job description is required"),
});

type JobRequirementForm = z.infer<typeof jobRequirementSchema>;

interface CandidateFinderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export function CandidateFinder({ open, onOpenChange, companyId }: CandidateFinderProps) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'requirements' | 'results'>('requirements');
  const [skillInput, setSkillInput] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [outreachDialogOpen, setOutreachDialogOpen] = useState(false);
  const [jobRequirement, setJobRequirement] = useState<any>(null);
  
  const { toast } = useToast();

  const form = useForm<JobRequirementForm>({
    resolver: zodResolver(jobRequirementSchema),
    defaultValues: {
      title: "",
      department: "",
      skills: [],
      experience_level: "",
      employment_type: "",
      description: "",
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

  const findCandidates = async (data: JobRequirementForm) => {
    try {
      setLoading(true);
      
      const { data: results, error } = await supabase.functions.invoke('find-candidates', {
        body: { 
          job_requirement: data
        }
      });

      if (error) throw error;

      setCandidates(results.candidates || []);
      setJobRequirement(results.job_requirement);
      setStep('results');
      
      toast({
        title: "Candidates Found",
        description: `Found ${results.candidates?.length || 0} qualified candidates for this role.`
      });
    } catch (error: any) {
      console.error('Error finding candidates:', error);
      toast({
        title: "Error",
        description: "Failed to find candidates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setOutreachDialogOpen(true);
  };

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSkillInput("");
      setCandidates([]);
      setStep('requirements');
      setJobRequirement(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {step === 'requirements' ? 'Find Candidates' : 'Candidate Results'}
            </DialogTitle>
          </DialogHeader>

          {step === 'requirements' && (
            <form onSubmit={form.handleSubmit(findCandidates)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Senior Software Engineer"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    {...form.register("department")}
                    placeholder="Engineering"
                  />
                  {form.formState.errors.department && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.department.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Experience Level *</Label>
                  <Select onValueChange={(value) => form.setValue("experience_level", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                      <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.experience_level && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.experience_level.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Employment Type *</Label>
                  <Select onValueChange={(value) => form.setValue("employment_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.employment_type && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.employment_type.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Required Skills *</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a required skill"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min">Budget Min ($/hour)</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    {...form.register("budget_min", { valueAsNumber: true })}
                    placeholder="50"
                  />
                </div>

                <div>
                  <Label htmlFor="budget_max">Budget Max ($/hour)</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    {...form.register("budget_max", { valueAsNumber: true })}
                    placeholder="150"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className="min-h-[120px]"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Finding Candidates...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Candidates
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 'results' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Qualified Candidates</h3>
                  <p className="text-sm text-muted-foreground">
                    {candidates.length} candidates found for {jobRequirement?.title}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setStep('requirements')}
                >
                  New Search
                </Button>
              </div>

              {candidates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onContact={handleContactCandidate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Candidates Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your requirements and search again.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <OutreachDialog
        open={outreachDialogOpen}
        onOpenChange={setOutreachDialogOpen}
        candidate={selectedCandidate}
        jobRequirement={jobRequirement}
      />
    </>
  );
}