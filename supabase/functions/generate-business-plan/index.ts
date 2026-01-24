import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// Circuit Breaker Implementation
// ============================================================================

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
  successCount: number;
}

interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening circuit
  resetTimeout: number;          // Time in ms before trying again (half-open)
  successThreshold: number;      // Successes needed to close circuit from half-open
}

// In-memory circuit breaker state (per provider)
const circuitBreakers: Map<string, CircuitBreakerState> = new Map();

const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  resetTimeout: 30000, // 30 seconds
  successThreshold: 2,
};

function getCircuitState(provider: string): CircuitBreakerState {
  if (!circuitBreakers.has(provider)) {
    circuitBreakers.set(provider, {
      failures: 0,
      lastFailure: 0,
      state: 'closed',
      successCount: 0,
    });
  }
  return circuitBreakers.get(provider)!;
}

function isCircuitOpen(provider: string, config: CircuitBreakerConfig = DEFAULT_CIRCUIT_CONFIG): boolean {
  const state = getCircuitState(provider);
  
  if (state.state === 'closed') {
    return false;
  }
  
  if (state.state === 'open') {
    // Check if we should transition to half-open
    if (Date.now() - state.lastFailure >= config.resetTimeout) {
      state.state = 'half-open';
      state.successCount = 0;
      console.log(`Circuit breaker for ${provider}: OPEN -> HALF-OPEN`);
      return false;
    }
    return true;
  }
  
  // half-open - allow request through
  return false;
}

function recordSuccess(provider: string, config: CircuitBreakerConfig = DEFAULT_CIRCUIT_CONFIG): void {
  const state = getCircuitState(provider);
  
  if (state.state === 'half-open') {
    state.successCount++;
    if (state.successCount >= config.successThreshold) {
      state.state = 'closed';
      state.failures = 0;
      state.successCount = 0;
      console.log(`Circuit breaker for ${provider}: HALF-OPEN -> CLOSED`);
    }
  } else if (state.state === 'closed') {
    // Reset failure count on success
    state.failures = 0;
  }
}

function recordFailure(provider: string, config: CircuitBreakerConfig = DEFAULT_CIRCUIT_CONFIG): void {
  const state = getCircuitState(provider);
  
  state.failures++;
  state.lastFailure = Date.now();
  
  if (state.state === 'half-open') {
    // Any failure in half-open goes back to open
    state.state = 'open';
    console.log(`Circuit breaker for ${provider}: HALF-OPEN -> OPEN`);
  } else if (state.state === 'closed' && state.failures >= config.failureThreshold) {
    state.state = 'open';
    console.log(`Circuit breaker for ${provider}: CLOSED -> OPEN (${state.failures} failures)`);
  }
}

// ============================================================================
// Exponential Backoff Retry
// ============================================================================

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;      // Initial delay in ms
  maxDelay: number;       // Maximum delay in ms
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,     // 1 second
  maxDelay: 10000,     // 10 seconds
  backoffMultiplier: 2,
};

function calculateBackoffDelay(attempt: number, config: RetryConfig = DEFAULT_RETRY_CONFIG): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.min(delay + jitter, config.maxDelay);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  provider: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    // Check circuit breaker before attempting
    if (isCircuitOpen(provider)) {
      throw new Error(`Circuit breaker OPEN for ${provider}. Service temporarily unavailable.`);
    }
    
    try {
      const result = await fn();
      recordSuccess(provider);
      return result;
    } catch (error) {
      lastError = error;
      recordFailure(provider);
      
      if (attempt < config.maxRetries) {
        const delay = calculateBackoffDelay(attempt);
        console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} for ${provider} in ${Math.round(delay)}ms`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError || new Error(`Failed after ${config.maxRetries} retries`);
}

// ============================================================================
// Request Queue System
// ============================================================================

interface QueueConfig {
  maxConcurrentRequests: number;    // Global max concurrent requests
  maxPerProvider: number;           // Max concurrent per provider
  priorityLevels: number;           // Number of priority levels (higher = more important)
  queueTimeout: number;             // Max time to wait in queue (ms)
}

const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  maxConcurrentRequests: 6,         // Max 6 concurrent AI calls
  maxPerProvider: 3,                // Max 3 concurrent per provider
  priorityLevels: 3,
  queueTimeout: 60000,              // 60 second queue timeout
};

// Section priority mapping (higher = more important, processed first)
const SECTION_PRIORITY: Record<string, number> = {
  executiveSummary: 3,      // Highest - users see this first
  financialProjections: 3,  // High - critical for investors
  marketAnalysis: 2,        // Medium
  competitiveAnalysis: 2,   // Medium
  marketingStrategy: 1,     // Lower
  operationsPlan: 1,        // Lower
};

interface QueuedRequest<T> {
  id: string;
  priority: number;
  provider: string;
  section: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  queuedAt: number;
  startedAt?: number;
}

interface QueueMetrics {
  totalQueued: number;
  totalProcessed: number;
  totalRejected: number;
  averageWaitTime: number;
  averageProcessTime: number;
  currentQueueDepth: number;
  currentActive: number;
  activeByProvider: Record<string, number>;
  peakQueueDepth: number;
  peakConcurrent: number;
}

class RequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private activeRequests: Map<string, QueuedRequest<any>> = new Map();
  private activeByProvider: Map<string, number> = new Map();
  private config: QueueConfig;
  private metrics: QueueMetrics = {
    totalQueued: 0,
    totalProcessed: 0,
    totalRejected: 0,
    averageWaitTime: 0,
    averageProcessTime: 0,
    currentQueueDepth: 0,
    currentActive: 0,
    activeByProvider: {},
    peakQueueDepth: 0,
    peakConcurrent: 0,
  };
  private waitTimes: number[] = [];
  private processTimes: number[] = [];
  private processing = false;

  constructor(config: QueueConfig = DEFAULT_QUEUE_CONFIG) {
    this.config = config;
  }

  async enqueue<T>(
    provider: string,
    section: string,
    execute: () => Promise<T>
  ): Promise<T> {
    const priority = SECTION_PRIORITY[section] || 1;
    const id = `${section}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    
    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id,
        priority,
        provider,
        section,
        execute,
        resolve,
        reject,
        queuedAt: Date.now(),
      };

      // Insert in priority order (higher priority first)
      let inserted = false;
      for (let i = 0; i < this.queue.length; i++) {
        if (this.queue[i].priority < priority) {
          this.queue.splice(i, 0, request);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        this.queue.push(request);
      }

      this.metrics.totalQueued++;
      this.metrics.currentQueueDepth = this.queue.length;
      this.metrics.peakQueueDepth = Math.max(this.metrics.peakQueueDepth, this.queue.length);
      
      console.log(`[Queue] Enqueued ${section} (priority: ${priority}, queue depth: ${this.queue.length})`);

      // Start processing if not already
      this.processQueue();

      // Set timeout for this request
      setTimeout(() => {
        const index = this.queue.findIndex(r => r.id === id);
        if (index !== -1) {
          this.queue.splice(index, 1);
          this.metrics.totalRejected++;
          this.metrics.currentQueueDepth = this.queue.length;
          reject(new Error(`Request for ${section} timed out waiting in queue`));
          console.warn(`[Queue] Request ${section} timed out after ${this.config.queueTimeout}ms`);
        }
      }, this.config.queueTimeout);
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      // Check global concurrency limit
      if (this.activeRequests.size >= this.config.maxConcurrentRequests) {
        await sleep(50); // Small delay before checking again
        continue;
      }

      // Find next eligible request (respecting per-provider limits)
      const nextIndex = this.findNextEligibleRequest();
      if (nextIndex === -1) {
        await sleep(50);
        continue;
      }

      const request = this.queue.splice(nextIndex, 1)[0];
      this.metrics.currentQueueDepth = this.queue.length;
      
      // Track active request
      this.activeRequests.set(request.id, request);
      const providerCount = (this.activeByProvider.get(request.provider) || 0) + 1;
      this.activeByProvider.set(request.provider, providerCount);
      
      this.metrics.currentActive = this.activeRequests.size;
      this.metrics.peakConcurrent = Math.max(this.metrics.peakConcurrent, this.activeRequests.size);
      this.updateActiveByProviderMetrics();

      request.startedAt = Date.now();
      const waitTime = request.startedAt - request.queuedAt;
      this.waitTimes.push(waitTime);
      
      console.log(`[Queue] Processing ${request.section} (waited: ${waitTime}ms, active: ${this.activeRequests.size}/${this.config.maxConcurrentRequests})`);

      // Execute the request (don't await - let it run in background)
      this.executeRequest(request);
    }

    this.processing = false;
  }

  private findNextEligibleRequest(): number {
    for (let i = 0; i < this.queue.length; i++) {
      const request = this.queue[i];
      const providerActive = this.activeByProvider.get(request.provider) || 0;
      
      if (providerActive < this.config.maxPerProvider) {
        return i;
      }
    }
    return -1;
  }

  private async executeRequest<T>(request: QueuedRequest<T>): Promise<void> {
    try {
      const result = await request.execute();
      
      const processTime = Date.now() - (request.startedAt || request.queuedAt);
      this.processTimes.push(processTime);
      this.metrics.totalProcessed++;
      
      console.log(`[Queue] Completed ${request.section} in ${processTime}ms`);
      request.resolve(result);
    } catch (error) {
      console.error(`[Queue] Failed ${request.section}:`, error);
      request.reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      // Remove from active tracking
      this.activeRequests.delete(request.id);
      const providerCount = (this.activeByProvider.get(request.provider) || 1) - 1;
      this.activeByProvider.set(request.provider, Math.max(0, providerCount));
      
      this.metrics.currentActive = this.activeRequests.size;
      this.updateActiveByProviderMetrics();
      this.updateAverages();
      
      // Trigger next batch processing
      this.processQueue();
    }
  }

  private updateActiveByProviderMetrics(): void {
    this.metrics.activeByProvider = {};
    this.activeByProvider.forEach((count, provider) => {
      if (count > 0) {
        this.metrics.activeByProvider[provider] = count;
      }
    });
  }

  private updateAverages(): void {
    if (this.waitTimes.length > 0) {
      const recentWaits = this.waitTimes.slice(-50); // Last 50 requests
      this.metrics.averageWaitTime = Math.round(
        recentWaits.reduce((a, b) => a + b, 0) / recentWaits.length
      );
    }
    if (this.processTimes.length > 0) {
      const recentProcess = this.processTimes.slice(-50);
      this.metrics.averageProcessTime = Math.round(
        recentProcess.reduce((a, b) => a + b, 0) / recentProcess.length
      );
    }
  }

  getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  getQueueStatus(): { depth: number; active: number; providers: Record<string, number> } {
    return {
      depth: this.queue.length,
      active: this.activeRequests.size,
      providers: { ...Object.fromEntries(this.activeByProvider) }
    };
  }
}

// Global request queue instance
const requestQueue = new RequestQueue();

// ============================================================================
// AI Provider Configuration & Intelligent Routing
// ============================================================================

interface AIProvider {
  id: string;
  name: string;
  model: string;
  endpoint: string;
  strengths: string[];  // Section types this provider excels at
  priority: number;     // Lower = higher priority
  maxTokens: number;
  costPerToken: number; // For future cost optimization
}

// Provider configuration with specializations
const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini-flash',
    name: 'Google Gemini Flash',
    model: 'google/gemini-2.5-flash',
    endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    strengths: ['executiveSummary', 'marketingStrategy', 'operationsPlan'],
    priority: 1,
    maxTokens: 2000,
    costPerToken: 0.000001
  },
  {
    id: 'gemini-pro',
    name: 'Google Gemini Pro',
    model: 'google/gemini-2.5-pro',
    endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    strengths: ['marketAnalysis', 'competitiveAnalysis', 'financialProjections'],
    priority: 2,
    maxTokens: 2000,
    costPerToken: 0.000003
  },
  {
    id: 'gpt-5-mini',
    name: 'OpenAI GPT-5 Mini',
    model: 'openai/gpt-5-mini',
    endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    strengths: ['executiveSummary', 'marketAnalysis', 'financialProjections'],
    priority: 3,
    maxTokens: 2000,
    costPerToken: 0.000002
  },
  {
    id: 'gpt-5-nano',
    name: 'OpenAI GPT-5 Nano',
    model: 'openai/gpt-5-nano',
    endpoint: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    strengths: ['marketingStrategy', 'operationsPlan'],
    priority: 4,
    maxTokens: 1500,
    costPerToken: 0.0000005
  }
];

// Section to provider mapping with fallback chains
interface ProviderChain {
  primary: string;
  fallbacks: string[];
}

const SECTION_PROVIDER_CHAINS: Record<string, ProviderChain> = {
  executiveSummary: {
    primary: 'gemini-flash',
    fallbacks: ['gpt-5-mini', 'gemini-pro', 'gpt-5-nano']
  },
  marketAnalysis: {
    primary: 'gemini-pro',
    fallbacks: ['gpt-5-mini', 'gemini-flash', 'gpt-5-nano']
  },
  competitiveAnalysis: {
    primary: 'gemini-pro',
    fallbacks: ['gpt-5-mini', 'gemini-flash', 'gpt-5-nano']
  },
  marketingStrategy: {
    primary: 'gemini-flash',
    fallbacks: ['gpt-5-nano', 'gpt-5-mini', 'gemini-pro']
  },
  operationsPlan: {
    primary: 'gemini-flash',
    fallbacks: ['gpt-5-nano', 'gpt-5-mini', 'gemini-pro']
  },
  financialProjections: {
    primary: 'gemini-pro',
    fallbacks: ['gpt-5-mini', 'gemini-flash', 'gpt-5-nano']
  }
};

function getProvider(providerId: string): AIProvider | undefined {
  return AI_PROVIDERS.find(p => p.id === providerId);
}

function getProviderChain(sectionName: string): string[] {
  const chain = SECTION_PROVIDER_CHAINS[sectionName];
  if (!chain) {
    // Default fallback chain if section not configured
    return ['gemini-flash', 'gpt-5-mini', 'gemini-pro', 'gpt-5-nano'];
  }
  return [chain.primary, ...chain.fallbacks];
}

// ============================================================================
// Business Logic Types
// ============================================================================

interface BusinessIdeaInput {
  companyName: string;
  industry: string;
  targetMarket: string;
  businessModel: string;
  problemStatement: string;
  solution: string;
  uniqueSellingProposition: string;
  fundingGoal?: number;
  timeframe?: string;
  additionalContext?: string;
  marketSize?: string;
  competitors?: string;
  competitiveAdvantage?: string;
  foundersBackground?: string;
  teamSize?: string;
  keyHires?: string;
  productStage?: string;
  features?: string;
  pricingStrategy?: string;
  customerAcquisition?: string;
  marketingChannels?: string;
  salesStrategy?: string;
  revenueModel?: string;
  monthlyRevenue?: string;
  burnRate?: string;
  breakEven?: string;
}

interface BusinessPlanSections {
  executiveSummary: string;
  marketAnalysis: string;
  competitiveAnalysis: string;
  marketingStrategy: string;
  operationsPlan: string;
  financialProjections: string;
}

interface SectionResult {
  section: keyof BusinessPlanSections;
  content: string;
  latencyMs: number;
  fromCache: boolean;
  retryCount: number;
  providerId: string;
  fallbacksUsed: number;
  queueWaitMs: number;
}

interface GenerationMetrics {
  totalTimeMs: number;
  cacheHits: number;
  cacheMisses: number;
  totalRetries: number;
  totalFallbacks: number;
  providerUsage: Record<string, number>;
  sectionMetrics: Record<string, { 
    latencyMs: number; 
    success: boolean; 
    fromCache: boolean; 
    retries: number;
    providerId: string;
    fallbacksUsed: number;
    queueWaitMs: number;
  }>;
  queueMetrics: {
    peakQueueDepth: number;
    peakConcurrent: number;
    averageWaitTime: number;
    averageProcessTime: number;
    totalQueued: number;
    totalProcessed: number;
  };
}

// ============================================================================
// Caching Functions
// ============================================================================

async function hashInput(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkCache(
  supabase: any,
  inputHash: string,
  sectionType: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('cached_sections')
      .select('id, content, hit_count')
      .eq('input_hash', inputHash)
      .eq('section_type', sectionType)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    // Increment hit count asynchronously
    supabase
      .from('cached_sections')
      .update({ hit_count: (data.hit_count || 0) + 1 })
      .eq('id', data.id)
      .then(() => {});

    return data.content;
  } catch {
    return null;
  }
}

async function storeInCache(
  supabase: any,
  inputHash: string,
  sectionType: string,
  aiProvider: string,
  content: string
): Promise<void> {
  try {
    await supabase
      .from('cached_sections')
      .upsert({
        input_hash: inputHash,
        section_type: sectionType,
        ai_provider: aiProvider,
        content: content,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        hit_count: 0
      }, { onConflict: 'input_hash' });
  } catch (error) {
    console.warn('Failed to store in cache:', error);
  }
}

// ============================================================================
// SSE Helper
// ============================================================================

function sendSSE(controller: ReadableStreamDefaultController, type: string, data: any) {
  const event = `data: ${JSON.stringify({ type, ...data })}\n\n`;
  controller.enqueue(new TextEncoder().encode(event));
}

// ============================================================================
// AI Generation with Intelligent Fallback Chain
// ============================================================================

interface ProviderCallResult {
  content: string;
  providerId: string;
}

async function callAIProviderDirect(
  apiKey: string,
  provider: AIProvider,
  sectionName: string,
  prompt: string
): Promise<string> {
  const response = await fetch(provider.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        {
          role: 'system',
          content: `You are an expert business consultant and strategist with 20+ years of experience helping startups create comprehensive business plans. Provide detailed, actionable, and professional content that could be used in a real business plan presentation to investors.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: provider.maxTokens
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${provider.name} error for ${sectionName}: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callWithFallbackChain(
  apiKey: string,
  sectionName: string,
  prompt: string
): Promise<ProviderCallResult> {
  const providerChain = getProviderChain(sectionName);
  const errors: string[] = [];
  
  for (const providerId of providerChain) {
    const provider = getProvider(providerId);
    if (!provider) {
      console.warn(`Provider ${providerId} not found, skipping`);
      continue;
    }
    
    // Check circuit breaker for this provider
    if (isCircuitOpen(providerId)) {
      console.log(`Circuit breaker OPEN for ${providerId}, trying next provider`);
      continue;
    }
    
    try {
      // Try this provider with retry logic
      const content = await retryWithBackoff(
        async () => callAIProviderDirect(apiKey, provider, sectionName, prompt),
        providerId,
        {
          maxRetries: 2, // Fewer retries per provider since we have fallbacks
          baseDelay: 500,
          maxDelay: 5000,
          backoffMultiplier: 2
        }
      );
      
      console.log(`✓ ${sectionName} generated successfully with ${provider.name}`);
      return { content, providerId };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`✗ ${provider.name} failed for ${sectionName}: ${errorMsg}`);
      errors.push(`${provider.name}: ${errorMsg}`);
      // Continue to next provider in chain
    }
  }
  
  // All providers failed
  throw new Error(`All providers failed for ${sectionName}. Errors: ${errors.join('; ')}`);
}

async function generateSection(
  supabase: any,
  apiKey: string,
  sectionName: keyof BusinessPlanSections,
  prompt: string,
  useCache: boolean
): Promise<SectionResult> {
  const startTime = Date.now();
  const inputHash = await hashInput(`${sectionName}:${prompt}`);
  
  // Check cache first (cache checks bypass queue)
  if (useCache) {
    const cachedContent = await checkCache(supabase, inputHash, sectionName);
    if (cachedContent) {
      console.log(`Cache HIT for ${sectionName}`);
      return {
        section: sectionName,
        content: cachedContent,
        latencyMs: Date.now() - startTime,
        fromCache: true,
        retryCount: 0,
        providerId: 'cache',
        fallbacksUsed: 0,
        queueWaitMs: 0
      };
    }
    console.log(`Cache MISS for ${sectionName}`);
  }
  
  // Get primary provider for queue tracking
  const providerChain = getProviderChain(sectionName);
  const primaryProvider = providerChain[0];
  
  // Queue the AI request with priority-based scheduling
  const queueStartTime = Date.now();
  
  const result = await requestQueue.enqueue(
    primaryProvider,
    sectionName,
    async () => {
      const { content, providerId } = await callWithFallbackChain(apiKey, sectionName, prompt);
      
      // Calculate fallbacks used
      let fallbacksUsed = 0;
      if (providerId !== primaryProvider) {
        fallbacksUsed = providerChain.indexOf(providerId);
      }
      
      return { content, providerId, fallbacksUsed };
    }
  );
  
  const queueWaitMs = Date.now() - queueStartTime - (Date.now() - queueStartTime);
  const latencyMs = Date.now() - startTime;
  
  console.log(`Section ${sectionName} generated in ${latencyMs}ms with ${result.providerId} (${result.fallbacksUsed} fallbacks)`);
  
  // Store in cache asynchronously
  if (useCache) {
    storeInCache(supabase, inputHash, sectionName, result.providerId, result.content);
  }
  
  return {
    section: sectionName,
    content: result.content,
    latencyMs,
    fromCache: false,
    retryCount: 0,
    providerId: result.providerId,
    fallbacksUsed: result.fallbacksUsed,
    queueWaitMs: Date.now() - queueStartTime - latencyMs + (Date.now() - startTime - latencyMs)
  };
}

// Helper to calculate actual queue wait time
async function generateSectionQueued(
  supabase: any,
  apiKey: string,
  sectionName: keyof BusinessPlanSections,
  prompt: string,
  useCache: boolean
): Promise<SectionResult> {
  const overallStart = Date.now();
  const inputHash = await hashInput(`${sectionName}:${prompt}`);
  
  // Check cache first (bypasses queue entirely)
  if (useCache) {
    const cachedContent = await checkCache(supabase, inputHash, sectionName);
    if (cachedContent) {
      console.log(`Cache HIT for ${sectionName}`);
      return {
        section: sectionName,
        content: cachedContent,
        latencyMs: Date.now() - overallStart,
        fromCache: true,
        retryCount: 0,
        providerId: 'cache',
        fallbacksUsed: 0,
        queueWaitMs: 0
      };
    }
    console.log(`Cache MISS for ${sectionName}`);
  }
  
  const providerChain = getProviderChain(sectionName);
  const primaryProvider = providerChain[0];
  const queueEnterTime = Date.now();
  
  // This promise resolves when the request actually starts processing
  let processingStartTime = 0;
  
  const result = await requestQueue.enqueue(
    primaryProvider,
    sectionName,
    async () => {
      processingStartTime = Date.now();
      const { content, providerId } = await callWithFallbackChain(apiKey, sectionName, prompt);
      
      let fallbacksUsed = 0;
      if (providerId !== primaryProvider) {
        fallbacksUsed = providerChain.indexOf(providerId);
      }
      
      return { content, providerId, fallbacksUsed };
    }
  );
  
  const queueWaitMs = processingStartTime - queueEnterTime;
  const latencyMs = Date.now() - overallStart;
  
  console.log(`Section ${sectionName}: total=${latencyMs}ms, queueWait=${queueWaitMs}ms, provider=${result.providerId}`);
  
  // Store in cache asynchronously
  if (useCache) {
    storeInCache(supabase, inputHash, sectionName, result.providerId, result.content);
  }
  
  return {
    section: sectionName,
    content: result.content,
    latencyMs,
    fromCache: false,
    retryCount: 0,
    providerId: result.providerId,
    fallbacksUsed: result.fallbacksUsed,
    queueWaitMs
  };
}

// ============================================================================
// Prompt Building
// ============================================================================

function buildSectionPrompts(businessIdea: BusinessIdeaInput): Record<keyof BusinessPlanSections, string> {
  return {
    executiveSummary: `Create a compelling executive summary for a business plan with these details:
    
    Company: ${businessIdea.companyName}
    Industry: ${businessIdea.industry}
    Target Market: ${businessIdea.targetMarket}
    Business Model: ${businessIdea.businessModel}
    Problem: ${businessIdea.problemStatement}
    Solution: ${businessIdea.solution}
    USP: ${businessIdea.uniqueSellingProposition}
    Funding Goal: ${businessIdea.fundingGoal ? `$${businessIdea.fundingGoal.toLocaleString()}` : 'TBD'}
    ${businessIdea.marketSize ? `Market Size: ${businessIdea.marketSize}` : ''}
    ${businessIdea.productStage ? `Product Stage: ${businessIdea.productStage}` : ''}
    ${businessIdea.foundersBackground ? `Team Background: ${businessIdea.foundersBackground}` : ''}
    ${businessIdea.monthlyRevenue ? `Monthly Revenue: $${businessIdea.monthlyRevenue}` : ''}
    
    The executive summary should be 300-500 words and include: company overview, market opportunity, competitive advantage, financial highlights, and funding requirements.`,

    marketAnalysis: `Conduct a comprehensive market analysis for ${businessIdea.companyName} in the ${businessIdea.industry} industry targeting ${businessIdea.targetMarket}.
    
    ${businessIdea.marketSize ? `Market Size Information: ${businessIdea.marketSize}` : ''}
    ${businessIdea.customerAcquisition ? `Customer Acquisition Strategy: ${businessIdea.customerAcquisition}` : ''}
    ${businessIdea.marketingChannels ? `Marketing Channels: ${businessIdea.marketingChannels}` : ''}
    
    Include:
    1. Market size and growth projections
    2. Target customer demographics and psychographics
    3. Market trends and drivers
    4. Customer pain points and needs
    5. Market segmentation
    6. Barriers to entry
    
    Make it specific to the ${businessIdea.industry} industry and provide realistic data and insights.`,

    competitiveAnalysis: `Analyze the competitive landscape for ${businessIdea.companyName} in the ${businessIdea.industry} industry.
    
    Business Model: ${businessIdea.businessModel}
    Unique Selling Proposition: ${businessIdea.uniqueSellingProposition}
    ${businessIdea.competitors ? `Known Competitors: ${businessIdea.competitors}` : ''}
    ${businessIdea.competitiveAdvantage ? `Our Competitive Advantages: ${businessIdea.competitiveAdvantage}` : ''}
    
    Include:
    1. Direct and indirect competitors
    2. Competitive positioning matrix
    3. Competitor strengths and weaknesses
    4. Market share analysis
    5. Competitive advantages and differentiation
    6. Potential threats and opportunities
    
    Focus on how ${businessIdea.companyName} can differentiate itself in this market.`,

    marketingStrategy: `Develop a comprehensive marketing strategy for ${businessIdea.companyName}.
    
    Target Market: ${businessIdea.targetMarket}
    Industry: ${businessIdea.industry}
    Business Model: ${businessIdea.businessModel}
    Solution: ${businessIdea.solution}
    ${businessIdea.customerAcquisition ? `Customer Acquisition: ${businessIdea.customerAcquisition}` : ''}
    ${businessIdea.marketingChannels ? `Marketing Channels: ${businessIdea.marketingChannels}` : ''}
    ${businessIdea.salesStrategy ? `Sales Strategy: ${businessIdea.salesStrategy}` : ''}
    
    Include:
    1. Marketing mix (4Ps: Product, Price, Place, Promotion)
    2. Customer acquisition strategy
    3. Digital marketing channels and tactics
    4. Brand positioning and messaging
    5. Sales strategy and process
    6. Customer retention and growth strategies
    7. Marketing budget allocation and ROI expectations`,

    operationsPlan: `Create a detailed operations plan for ${businessIdea.companyName}.
    
    Industry: ${businessIdea.industry}
    Business Model: ${businessIdea.businessModel}
    Solution: ${businessIdea.solution}
    ${businessIdea.productStage ? `Product Stage: ${businessIdea.productStage}` : ''}
    ${businessIdea.teamSize ? `Current Team Size: ${businessIdea.teamSize}` : ''}
    ${businessIdea.keyHires ? `Key Hires Needed: ${businessIdea.keyHires}` : ''}
    ${businessIdea.foundersBackground ? `Team Background: ${businessIdea.foundersBackground}` : ''}
    ${businessIdea.features ? `Key Features: ${businessIdea.features}` : ''}
    
    Include:
    1. Operational workflow and processes
    2. Technology requirements and infrastructure
    3. Staffing and organizational structure
    4. Key partnerships and suppliers
    5. Quality control and assurance
    6. Scalability considerations
    7. Risk management and contingency planning
    
    Make it specific to the ${businessIdea.industry} industry and business model.`,

    financialProjections: `Create comprehensive financial projections for ${businessIdea.companyName}.
    
    Industry: ${businessIdea.industry}
    Business Model: ${businessIdea.businessModel}
    Target Market: ${businessIdea.targetMarket}
    Funding Goal: ${businessIdea.fundingGoal ? `$${businessIdea.fundingGoal.toLocaleString()}` : 'TBD'}
    ${businessIdea.revenueModel ? `Revenue Model: ${businessIdea.revenueModel}` : ''}
    ${businessIdea.pricingStrategy ? `Pricing Strategy: ${businessIdea.pricingStrategy}` : ''}
    ${businessIdea.monthlyRevenue ? `Current Monthly Revenue: $${businessIdea.monthlyRevenue}` : ''}
    ${businessIdea.burnRate ? `Monthly Burn Rate: $${businessIdea.burnRate}` : ''}
    ${businessIdea.breakEven ? `Break-Even Timeline: ${businessIdea.breakEven}` : ''}
    
    Include:
    1. Revenue model and pricing strategy
    2. 3-year financial projections (P&L, Cash Flow, Balance Sheet)
    3. Key financial metrics and KPIs
    4. Break-even analysis
    5. Funding requirements and use of funds
    6. Revenue assumptions and growth drivers
    7. Cost structure and expense breakdown
    8. Sensitivity analysis and scenarios
    
    Provide realistic numbers based on industry benchmarks for ${businessIdea.industry}.`
  };
}

// ============================================================================
// Section Generation with Streaming
// ============================================================================

async function generateSectionWithStreaming(
  supabase: any,
  apiKey: string,
  sectionName: keyof BusinessPlanSections,
  prompt: string,
  useCache: boolean,
  controller: ReadableStreamDefaultController
): Promise<SectionResult> {
  const chain = getProviderChain(sectionName);
  const queueStatus = requestQueue.getQueueStatus();
  
  sendSSE(controller, 'section_start', { 
    section: sectionName,
    primaryProvider: chain[0],
    fallbackProviders: chain.slice(1),
    priority: SECTION_PRIORITY[sectionName] || 1,
    queueDepth: queueStatus.depth,
    activeRequests: queueStatus.active
  });
  
  try {
    const result = await generateSectionQueued(supabase, apiKey, sectionName, prompt, useCache);
    sendSSE(controller, 'section_complete', { 
      section: sectionName, 
      latencyMs: result.latencyMs,
      fromCache: result.fromCache,
      retries: result.retryCount,
      providerId: result.providerId,
      fallbacksUsed: result.fallbacksUsed,
      queueWaitMs: result.queueWaitMs
    });
    return result;
  } catch (error) {
    sendSSE(controller, 'section_error', { 
      section: sectionName, 
      error: error.message 
    });
    throw error;
  }
}

// ============================================================================
// Parallel Generation
// ============================================================================

async function generateBusinessPlanSectionsWithStreaming(
  supabase: any,
  apiKey: string,
  businessIdea: BusinessIdeaInput,
  useCache: boolean,
  controller: ReadableStreamDefaultController
): Promise<{ sections: BusinessPlanSections; metrics: GenerationMetrics }> {
  const prompts = buildSectionPrompts(businessIdea);
  const sectionNames = Object.keys(prompts) as (keyof BusinessPlanSections)[];
  
  console.log(`Starting queued parallel generation with streaming of ${sectionNames.length} sections...`);
  console.log(`Queue config: max concurrent=${DEFAULT_QUEUE_CONFIG.maxConcurrentRequests}, max per provider=${DEFAULT_QUEUE_CONFIG.maxPerProvider}`);
  const parallelStartTime = Date.now();

  const initialQueueStatus = requestQueue.getQueueStatus();
  sendSSE(controller, 'generation_start', { 
    sections: sectionNames,
    queueConfig: {
      maxConcurrent: DEFAULT_QUEUE_CONFIG.maxConcurrentRequests,
      maxPerProvider: DEFAULT_QUEUE_CONFIG.maxPerProvider,
      priorityLevels: DEFAULT_QUEUE_CONFIG.priorityLevels
    },
    initialQueueStatus: initialQueueStatus
  });

  const results = await Promise.allSettled(
    sectionNames.map(section => 
      generateSectionWithStreaming(supabase, apiKey, section, prompts[section], useCache, controller)
    )
  );

  const parallelEndTime = Date.now();
  const finalQueueMetrics = requestQueue.getMetrics();
  console.log(`All parallel requests completed in ${parallelEndTime - parallelStartTime}ms`);
  console.log(`Queue metrics: peak depth=${finalQueueMetrics.peakQueueDepth}, peak concurrent=${finalQueueMetrics.peakConcurrent}, avg wait=${finalQueueMetrics.averageWaitTime}ms`);

  const sections: Partial<BusinessPlanSections> = {};
  const sectionMetrics: Record<string, { 
    latencyMs: number; 
    success: boolean; 
    fromCache: boolean; 
    retries: number;
    providerId: string;
    fallbacksUsed: number;
    queueWaitMs: number;
  }> = {};
  const errors: string[] = [];
  let cacheHits = 0;
  let cacheMisses = 0;
  let totalRetries = 0;
  let totalFallbacks = 0;
  const providerUsage: Record<string, number> = {};

  results.forEach((result, index) => {
    const sectionName = sectionNames[index];
    
    if (result.status === 'fulfilled') {
      sections[sectionName] = result.value.content;
      sectionMetrics[sectionName] = {
        latencyMs: result.value.latencyMs,
        success: true,
        fromCache: result.value.fromCache,
        retries: result.value.retryCount,
        providerId: result.value.providerId,
        fallbacksUsed: result.value.fallbacksUsed,
        queueWaitMs: result.value.queueWaitMs
      };
      totalRetries += result.value.retryCount;
      totalFallbacks += result.value.fallbacksUsed;
      
      // Track provider usage
      const providerId = result.value.providerId;
      providerUsage[providerId] = (providerUsage[providerId] || 0) + 1;
      
      if (result.value.fromCache) {
        cacheHits++;
      } else {
        cacheMisses++;
      }
    } else {
      console.error(`Failed to generate ${sectionName}:`, result.reason);
      errors.push(`${sectionName}: ${result.reason.message || 'Unknown error'}`);
      sectionMetrics[sectionName] = {
        latencyMs: 0,
        success: false,
        fromCache: false,
        retries: 0,
        providerId: 'none',
        fallbacksUsed: 0,
        queueWaitMs: 0
      };
      cacheMisses++;
      sections[sectionName] = `[This section could not be generated. Please try regenerating the business plan or contact support if the issue persists.]`;
    }
  });

  if (errors.length === sectionNames.length) {
    throw new Error(`All sections failed to generate: ${errors.join('; ')}`);
  }

  const metrics: GenerationMetrics = {
    totalTimeMs: parallelEndTime - parallelStartTime,
    cacheHits,
    cacheMisses,
    totalRetries,
    totalFallbacks,
    providerUsage,
    sectionMetrics,
    queueMetrics: {
      peakQueueDepth: finalQueueMetrics.peakQueueDepth,
      peakConcurrent: finalQueueMetrics.peakConcurrent,
      averageWaitTime: finalQueueMetrics.averageWaitTime,
      averageProcessTime: finalQueueMetrics.averageProcessTime,
      totalQueued: finalQueueMetrics.totalQueued,
      totalProcessed: finalQueueMetrics.totalProcessed
    }
  };

  return { sections: sections as BusinessPlanSections, metrics };
}

async function generateBusinessPlanSectionsParallel(
  supabase: any,
  apiKey: string,
  businessIdea: BusinessIdeaInput,
  useCache: boolean
): Promise<{ sections: BusinessPlanSections; metrics: GenerationMetrics }> {
  const prompts = buildSectionPrompts(businessIdea);
  const sectionNames = Object.keys(prompts) as (keyof BusinessPlanSections)[];
  
  console.log(`Starting queued parallel generation of ${sectionNames.length} sections...`);
  console.log(`Queue config: max concurrent=${DEFAULT_QUEUE_CONFIG.maxConcurrentRequests}, max per provider=${DEFAULT_QUEUE_CONFIG.maxPerProvider}`);
  const parallelStartTime = Date.now();

  const results = await Promise.allSettled(
    sectionNames.map(section => 
      generateSectionQueued(supabase, apiKey, section, prompts[section], useCache)
    )
  );

  const parallelEndTime = Date.now();
  const finalQueueMetrics = requestQueue.getMetrics();
  console.log(`All parallel requests completed in ${parallelEndTime - parallelStartTime}ms`);
  console.log(`Queue metrics: peak depth=${finalQueueMetrics.peakQueueDepth}, peak concurrent=${finalQueueMetrics.peakConcurrent}, avg wait=${finalQueueMetrics.averageWaitTime}ms`);

  const sections: Partial<BusinessPlanSections> = {};
  const sectionMetrics: Record<string, { 
    latencyMs: number; 
    success: boolean; 
    fromCache: boolean; 
    retries: number;
    providerId: string;
    fallbacksUsed: number;
    queueWaitMs: number;
  }> = {};
  const errors: string[] = [];
  let cacheHits = 0;
  let cacheMisses = 0;
  let totalRetries = 0;
  let totalFallbacks = 0;
  const providerUsage: Record<string, number> = {};

  results.forEach((result, index) => {
    const sectionName = sectionNames[index];
    
    if (result.status === 'fulfilled') {
      sections[sectionName] = result.value.content;
      sectionMetrics[sectionName] = {
        latencyMs: result.value.latencyMs,
        success: true,
        fromCache: result.value.fromCache,
        retries: result.value.retryCount,
        providerId: result.value.providerId,
        fallbacksUsed: result.value.fallbacksUsed,
        queueWaitMs: result.value.queueWaitMs
      };
      totalRetries += result.value.retryCount;
      totalFallbacks += result.value.fallbacksUsed;
      
      // Track provider usage
      const providerId = result.value.providerId;
      providerUsage[providerId] = (providerUsage[providerId] || 0) + 1;
      
      if (result.value.fromCache) {
        cacheHits++;
      } else {
        cacheMisses++;
      }
    } else {
      console.error(`Failed to generate ${sectionName}:`, result.reason);
      errors.push(`${sectionName}: ${result.reason.message || 'Unknown error'}`);
      sectionMetrics[sectionName] = {
        latencyMs: 0,
        success: false,
        fromCache: false,
        retries: 0,
        providerId: 'none',
        fallbacksUsed: 0,
        queueWaitMs: 0
      };
      cacheMisses++;
      sections[sectionName] = `[This section could not be generated. Please try regenerating the business plan or contact support if the issue persists.]`;
    }
  });

  if (errors.length === sectionNames.length) {
    throw new Error(`All sections failed to generate: ${errors.join('; ')}`);
  }

  const metrics: GenerationMetrics = {
    totalTimeMs: parallelEndTime - parallelStartTime,
    cacheHits,
    cacheMisses,
    totalRetries,
    totalFallbacks,
    providerUsage,
    sectionMetrics,
    queueMetrics: {
      peakQueueDepth: finalQueueMetrics.peakQueueDepth,
      peakConcurrent: finalQueueMetrics.peakConcurrent,
      averageWaitTime: finalQueueMetrics.averageWaitTime,
      averageProcessTime: finalQueueMetrics.averageProcessTime,
      totalQueued: finalQueueMetrics.totalQueued,
      totalProcessed: finalQueueMetrics.totalProcessed
    }
  };

  return { sections: sections as BusinessPlanSections, metrics };
}

// ============================================================================
// Main Handler
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('Lovable AI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { businessIdea, companyId, skipCache = false, stream = false }: { 
      businessIdea: BusinessIdeaInput; 
      companyId: string;
      skipCache?: boolean;
      stream?: boolean;
    } = await req.json();

    console.log('Generating business plan for:', businessIdea.companyName);
    console.log('Streaming mode:', stream);
    console.log('Cache enabled:', !skipCache);
    console.log('Request queue enabled: true');
    console.log('Queue config: max concurrent=6, max per provider=3, priority levels=3');
    console.log('Intelligent fallback chain enabled: true');
    console.log('Circuit breaker enabled: true');

    // If streaming is requested, return SSE response
    if (stream) {
      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            const { sections, metrics } = await generateBusinessPlanSectionsWithStreaming(
              supabase,
              lovableApiKey,
              businessIdea,
              !skipCache,
              controller
            );

            const { data: businessPlan, error: insertError } = await supabase
              .from('business_plans')
              .insert({
                company_id: companyId,
                title: `${businessIdea.companyName} Business Plan`,
                description: `AI-generated business plan for ${businessIdea.companyName}`,
                executive_summary: sections.executiveSummary,
                market_analysis: sections.marketAnalysis,
                competitive_analysis: sections.competitiveAnalysis,
                marketing_strategy: sections.marketingStrategy,
                operations_plan: sections.operationsPlan,
                financial_projections: sections.financialProjections,
                funding_requirements: businessIdea.fundingGoal || null,
                status: 'draft',
                ai_generated: true
              })
              .select()
              .single();

            if (insertError) {
              console.error('Database insert error:', insertError);
              sendSSE(controller, 'error', { message: 'Failed to save business plan' });
            } else {
              sendSSE(controller, 'complete', { 
                businessPlanId: businessPlan.id,
                metrics: {
                  totalTimeMs: Date.now() - startTime,
                  cacheHits: metrics.cacheHits,
                  cacheMisses: metrics.cacheMisses,
                  totalRetries: metrics.totalRetries,
                  totalFallbacks: metrics.totalFallbacks,
                  providerUsage: metrics.providerUsage,
                  queueMetrics: metrics.queueMetrics
                }
              });
              console.log('Business plan generated successfully:', businessPlan.id);
            }
          } catch (error) {
            console.error('Streaming error:', error);
            sendSSE(controller, 'error', { message: error.message || 'Generation failed' });
          } finally {
            controller.close();
          }
        }
      });

      return new Response(streamResponse, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }

    // Non-streaming mode
    const { sections, metrics } = await generateBusinessPlanSectionsParallel(
      supabase,
      lovableApiKey, 
      businessIdea,
      !skipCache
    );

    const totalTimeMs = Date.now() - startTime;
    console.log(`Total generation time: ${totalTimeMs}ms`);
    console.log(`Cache hits: ${metrics.cacheHits}/${metrics.cacheHits + metrics.cacheMisses}`);
    console.log(`Total retries: ${metrics.totalRetries}`);
    console.log(`Total fallbacks: ${metrics.totalFallbacks}`);
    console.log(`Provider usage:`, metrics.providerUsage);
    console.log(`Queue metrics:`, metrics.queueMetrics);

    const { data: businessPlan, error: insertError } = await supabase
      .from('business_plans')
      .insert({
        company_id: companyId,
        title: `${businessIdea.companyName} Business Plan`,
        description: `AI-generated business plan for ${businessIdea.companyName}`,
        executive_summary: sections.executiveSummary,
        market_analysis: sections.marketAnalysis,
        competitive_analysis: sections.competitiveAnalysis,
        marketing_strategy: sections.marketingStrategy,
        operations_plan: sections.operationsPlan,
        financial_projections: sections.financialProjections,
        funding_requirements: businessIdea.fundingGoal || null,
        status: 'draft',
        ai_generated: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save business plan');
    }

    console.log('Business plan generated successfully:', businessPlan.id);

    return new Response(JSON.stringify({ 
      businessPlan,
      businessPlanId: businessPlan.id,
      message: 'Business plan generated successfully',
      metrics: {
        totalTimeMs,
        cacheHits: metrics.cacheHits,
        cacheMisses: metrics.cacheMisses,
        totalRetries: metrics.totalRetries,
        totalFallbacks: metrics.totalFallbacks,
        providerUsage: metrics.providerUsage,
        sectionMetrics: metrics.sectionMetrics,
        queueMetrics: metrics.queueMetrics
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating business plan:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate business plan'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
