import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SectionProgress {
  name: string;
  displayName: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'cached';
}

interface GenerationProgressProps {
  sections: SectionProgress[];
  isGenerating: boolean;
}

const sectionDisplayNames: Record<string, string> = {
  executiveSummary: 'Executive Summary',
  marketAnalysis: 'Market Analysis',
  competitiveAnalysis: 'Competitive Analysis',
  marketingStrategy: 'Marketing Strategy',
  operationsPlan: 'Operations Plan',
  financialProjections: 'Financial Projections',
};

const GenerationProgress = ({ sections, isGenerating }: GenerationProgressProps) => {
  const completedCount = sections.filter(
    s => s.status === 'completed' || s.status === 'cached'
  ).length;
  const progress = sections.length > 0 ? (completedCount / sections.length) * 100 : 0;

  if (!isGenerating && completedCount === 0) {
    return null;
  }

  return (
    <div className="space-y-4 p-6 bg-muted/30 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Generating Business Plan</h4>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{sections.length} sections
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {sections.map((section) => (
          <div
            key={section.name}
            className={cn(
              "flex items-center gap-2 p-2 rounded-md text-sm transition-all duration-300",
              section.status === 'pending' && "text-muted-foreground bg-muted/50",
              section.status === 'generating' && "text-primary bg-primary/10 animate-pulse",
              section.status === 'completed' && "text-green-600 dark:text-green-400 bg-green-500/10",
              section.status === 'cached' && "text-blue-600 dark:text-blue-400 bg-blue-500/10",
              section.status === 'failed' && "text-destructive bg-destructive/10"
            )}
          >
            {section.status === 'pending' && (
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
            )}
            {section.status === 'generating' && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {(section.status === 'completed' || section.status === 'cached') && (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {section.status === 'failed' && (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="truncate text-xs font-medium">
              {sectionDisplayNames[section.name] || section.displayName}
            </span>
            {section.status === 'cached' && (
              <span className="text-[10px] opacity-70">(cached)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerationProgress;
