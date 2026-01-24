import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, AlertCircle, Zap, Database, Clock, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface SectionProgress {
  name: string;
  displayName: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'cached';
  providerId?: string;
  fallbacksUsed?: number;
  queueWaitMs?: number;
}

export interface QueueStatus {
  depth: number;
  active: number;
  maxConcurrent: number;
  maxPerProvider: number;
}

interface GenerationProgressProps {
  sections: SectionProgress[];
  isGenerating: boolean;
  queueStatus?: QueueStatus;
}

const sectionDisplayNames: Record<string, string> = {
  executiveSummary: 'Executive Summary',
  marketAnalysis: 'Market Analysis',
  competitiveAnalysis: 'Competitive Analysis',
  marketingStrategy: 'Marketing Strategy',
  operationsPlan: 'Operations Plan',
  financialProjections: 'Financial Projections',
};

const providerLabels: Record<string, { name: string; color: string }> = {
  'gemini-flash': { name: 'Gemini Flash', color: 'text-blue-500' },
  'gemini-pro': { name: 'Gemini Pro', color: 'text-purple-500' },
  'gpt-5-mini': { name: 'GPT-5 Mini', color: 'text-green-500' },
  'gpt-5-nano': { name: 'GPT-5 Nano', color: 'text-orange-500' },
  'cache': { name: 'Cached', color: 'text-muted-foreground' },
};

const GenerationProgress = ({ sections, isGenerating, queueStatus }: GenerationProgressProps) => {
  const completedCount = sections.filter(
    s => s.status === 'completed' || s.status === 'cached'
  ).length;
  const generatingCount = sections.filter(s => s.status === 'generating').length;
  const pendingCount = sections.filter(s => s.status === 'pending').length;
  const progress = sections.length > 0 ? (completedCount / sections.length) * 100 : 0;
  const fallbacksUsed = sections.reduce((acc, s) => acc + (s.fallbacksUsed || 0), 0);
  const avgQueueWait = sections
    .filter(s => s.queueWaitMs && s.queueWaitMs > 0)
    .reduce((acc, s, _, arr) => acc + (s.queueWaitMs || 0) / arr.length, 0);

  if (!isGenerating && completedCount === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 p-6 bg-muted/30 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-sm">Generating Business Plan</h4>
            
            {/* Queue Status Badge */}
            {isGenerating && queueStatus && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Layers className="h-3 w-3" />
                    {queueStatus.active}/{queueStatus.maxConcurrent} active
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Request Queue Status</p>
                    <p>Active requests: {queueStatus.active}/{queueStatus.maxConcurrent}</p>
                    <p>Queued: {pendingCount} pending</p>
                    <p>Max per provider: {queueStatus.maxPerProvider}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Average Queue Wait Badge */}
            {avgQueueWait > 100 && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Clock className="h-3 w-3" />
                    ~{Math.round(avgQueueWait)}ms wait
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average queue wait time: {Math.round(avgQueueWait)}ms</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Fallbacks Badge */}
            {fallbacksUsed > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Zap className="h-3 w-3" />
                    {fallbacksUsed} fallback{fallbacksUsed > 1 ? 's' : ''}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Intelligent routing used {fallbacksUsed} fallback provider{fallbacksUsed > 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {isGenerating && generatingCount > 0 && (
              <span className="text-primary">{generatingCount} processing</span>
            )}
            <span>{completedCount}/{sections.length} sections</span>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sections.map((section) => {
            const providerInfo = section.providerId ? providerLabels[section.providerId] : null;
            
            return (
              <Tooltip key={section.name}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md text-sm transition-all duration-300 cursor-default",
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
                    {section.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {section.status === 'cached' && (
                      <Database className="h-4 w-4" />
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
                    {section.fallbacksUsed && section.fallbacksUsed > 0 && (
                      <Zap className="h-3 w-3 text-amber-500" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {section.status === 'generating' && <p>Generating with AI...</p>}
                  {section.status === 'completed' && providerInfo && (
                    <div className="space-y-1">
                      <p>Generated by <span className={providerInfo.color}>{providerInfo.name}</span>
                        {section.fallbacksUsed && section.fallbacksUsed > 0 && (
                          <span className="text-muted-foreground"> (via fallback)</span>
                        )}
                      </p>
                      {section.queueWaitMs && section.queueWaitMs > 50 && (
                        <p className="text-muted-foreground">Queue wait: {section.queueWaitMs}ms</p>
                      )}
                    </div>
                  )}
                  {section.status === 'cached' && <p>Retrieved from cache (bypassed queue)</p>}
                  {section.status === 'failed' && <p>Generation failed</p>}
                  {section.status === 'pending' && <p>Queued, waiting to start</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default GenerationProgress;
