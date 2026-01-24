import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SectionProgress, QueueStatus } from '@/components/business-plan/GenerationProgress';

interface StreamingGenerationResult {
  businessPlanId: string | null;
  error: string | null;
}

interface UseStreamingGenerationReturn {
  sections: SectionProgress[];
  isGenerating: boolean;
  queueStatus: QueueStatus | null;
  generatePlan: (companyId: string, businessIdea: any) => Promise<StreamingGenerationResult>;
  resetProgress: () => void;
}

const initialSections: SectionProgress[] = [
  { name: 'executiveSummary', displayName: 'Executive Summary', status: 'pending' },
  { name: 'marketAnalysis', displayName: 'Market Analysis', status: 'pending' },
  { name: 'competitiveAnalysis', displayName: 'Competitive Analysis', status: 'pending' },
  { name: 'marketingStrategy', displayName: 'Marketing Strategy', status: 'pending' },
  { name: 'operationsPlan', displayName: 'Operations Plan', status: 'pending' },
  { name: 'financialProjections', displayName: 'Financial Projections', status: 'pending' },
];

export function useStreamingGeneration(): UseStreamingGenerationReturn {
  const [sections, setSections] = useState<SectionProgress[]>(initialSections);
  const [isGenerating, setIsGenerating] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetProgress = useCallback(() => {
    setSections(initialSections.map(s => ({ 
      ...s, 
      status: 'pending', 
      providerId: undefined, 
      fallbacksUsed: undefined,
      queueWaitMs: undefined 
    })));
    setQueueStatus(null);
  }, []);

  const updateSectionStatus = useCallback((
    name: string, 
    status: SectionProgress['status'],
    providerId?: string,
    fallbacksUsed?: number,
    queueWaitMs?: number
  ) => {
    setSections(prev => prev.map(s => 
      s.name === name 
        ? { ...s, status, providerId, fallbacksUsed, queueWaitMs } 
        : s
    ));
  }, []);

  const generatePlan = useCallback(async (
    companyId: string, 
    businessIdea: any
  ): Promise<StreamingGenerationResult> => {
    setIsGenerating(true);
    resetProgress();
    
    // Set all to generating initially since they run in parallel
    setSections(prev => prev.map(s => ({ ...s, status: 'generating' })));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch(
        'https://vchpruahywmdbhpociih.supabase.co/functions/v1/generate-business-plan',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjaHBydWFoeXdtZGJocG9jaWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODU5MjAsImV4cCI6MjA3MzI2MTkyMH0.yETbMVgY8PpCrjwSMxssPaTwNfbAlrTALH2R6-IJoVc',
          },
          body: JSON.stringify({
            companyId,
            businessIdea,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate business plan');
      }

      const contentType = response.headers.get('content-type');
      
      // Check if response is SSE stream
      if (contentType?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let businessPlanId: string | null = null;

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            const lines = text.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'generation_start') {
                    // Initialize queue status from the generation start event
                    if (data.queueConfig) {
                      setQueueStatus({
                        depth: data.initialQueueStatus?.depth || 0,
                        active: data.initialQueueStatus?.active || 0,
                        maxConcurrent: data.queueConfig.maxConcurrent || 6,
                        maxPerProvider: data.queueConfig.maxPerProvider || 3,
                      });
                    }
                  } else if (data.type === 'section_start') {
                    updateSectionStatus(data.section, 'generating');
                    // Update queue status with live data
                    if (data.queueDepth !== undefined || data.activeRequests !== undefined) {
                      setQueueStatus(prev => prev ? {
                        ...prev,
                        depth: data.queueDepth ?? prev.depth,
                        active: data.activeRequests ?? prev.active,
                      } : null);
                    }
                  } else if (data.type === 'section_complete') {
                    updateSectionStatus(
                      data.section, 
                      data.fromCache ? 'cached' : 'completed',
                      data.providerId,
                      data.fallbacksUsed,
                      data.queueWaitMs
                    );
                  } else if (data.type === 'section_error') {
                    updateSectionStatus(data.section, 'failed');
                  } else if (data.type === 'complete') {
                    businessPlanId = data.businessPlanId;
                    // Mark any remaining as completed
                    setSections(prev => prev.map(s => ({
                      ...s,
                      status: s.status === 'generating' ? 'completed' : s.status
                    })));
                  } else if (data.type === 'error') {
                    throw new Error(data.message);
                  }
                } catch (parseError) {
                  // Ignore parse errors for malformed events
                  console.warn('Failed to parse SSE event:', parseError);
                }
              }
            }
          }
        }

        return { businessPlanId, error: null };
      } else {
        // Fallback for non-streaming response
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        // Mark all as completed
        setSections(prev => prev.map(s => ({ ...s, status: 'completed' })));
        
        return { 
          businessPlanId: data.businessPlan?.id || data.businessPlanId, 
          error: null 
        };
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { businessPlanId: null, error: 'Generation cancelled' };
      }
      
      // Mark remaining sections as failed
      setSections(prev => prev.map(s => ({
        ...s,
        status: s.status === 'generating' ? 'failed' : s.status
      })));
      
      return { businessPlanId: null, error: error.message };
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [resetProgress, updateSectionStatus]);

  return {
    sections,
    isGenerating,
    queueStatus,
    generatePlan,
    resetProgress,
  };
}
