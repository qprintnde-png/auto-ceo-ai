

# MVP Completion Plan for Auto-CEO

## Overview

Auto-CEO has a strong foundation with advanced AI features already implemented. To deliver a polished MVP, we need to address a few remaining gaps focused on **data reality** (replacing mock data with real data), **export functionality** (PDF generation), and **UX polish** (empty states and onboarding improvements).

## Priority 1: Dashboard Analytics with Real Data

**Problem**: Dashboard charts currently display hardcoded mock data instead of actual financial and activity data from the database.

**Solution**: 
- Update `DashboardCharts.tsx` to fetch actual `financial_data` from Supabase
- Update `AIInsights.tsx` to generate dynamic insights based on real metrics (burn rate, runway, task completion rates)
- Remove `Math.random()` growth rate calculation from `PortfolioOverview.tsx` and calculate real period-over-period changes

**Files to modify**:
- `src/components/dashboard/DashboardCharts.tsx`
- `src/components/dashboard/AIInsights.tsx`
- `src/components/dashboard/PortfolioOverview.tsx`
- `src/components/dashboard/DashboardMetrics.tsx`

---

## Priority 2: Business Plan PDF Export

**Problem**: The "Download PDF" button in BusinessPlanViewer shows a "Coming Soon" toast.

**Solution**:
- Implement client-side PDF generation using `@react-pdf/renderer` or `html2pdf.js`
- Generate a professionally formatted PDF with all 6 sections (Executive Summary, Market Analysis, etc.)
- Add company branding/logo to the PDF header

**Files to modify/create**:
- `src/components/business-plan/BusinessPlanViewer.tsx`
- Create `src/components/business-plan/BusinessPlanPDF.tsx` (PDF template component)
- Add dependency: `@react-pdf/renderer` or `html2pdf.js`

---

## Priority 3: Empty State Illustrations & CTAs

**Problem**: When users have no data (first-time users), the experience lacks guidance.

**Solution**:
- Create reusable `EmptyState` component with illustration, title, description, and CTA button
- Implement across all main modules: Dashboard, Tasks, Financial, Investors, Team, Business Plan
- Guide users to take their first action in each section

**Files to create/modify**:
- Create `src/components/ui/empty-state.tsx`
- Update `src/components/dashboard/PortfolioOverview.tsx`
- Update `src/components/tasks/TaskDashboard.tsx`
- Update `src/components/financial/FinancialDashboard.tsx`
- Update `src/pages/BusinessPlan.tsx`
- Update `src/pages/Investors.tsx`

---

## Priority 4: Onboarding Redirect Logic

**Problem**: New users complete onboarding but aren't automatically routed there if `onboarding_completed: false`.

**Solution**:
- Check `profiles.onboarding_completed` flag after authentication
- Redirect to `/onboarding` if false, to `/dashboard` if true
- Update `ProtectedRoute.tsx` to handle this check

**Files to modify**:
- `src/components/auth/ProtectedRoute.tsx`
- `src/hooks/useAuth.tsx` (add profile query)

---

## Priority 5: Error Boundaries & Fallback UI

**Problem**: No graceful error handling if a component crashes.

**Solution**:
- Create `ErrorBoundary` component for catching React errors
- Add fallback UI with "Something went wrong" message and retry button
- Wrap main route components with error boundaries

**Files to create/modify**:
- Create `src/components/ui/error-boundary.tsx`
- Update `src/App.tsx` to wrap routes

---

## Technical Details

### Dashboard Analytics Implementation

```text
Data Flow:
financial_data table --> React Query hook --> DashboardCharts component

Steps:
1. Create useFinancialMetrics() hook that aggregates data by period
2. Transform data into chart-compatible format
3. Replace static revenueData array with dynamic query result
```

### PDF Export Architecture

```text
BusinessPlanViewer
    |
    v
[Download PDF Button]
    |
    v
generatePDF() function
    |
    v
Create styled document with:
- Header (company name, date)
- Executive Summary
- Market Analysis  
- Competitive Analysis
- Marketing Strategy
- Operations Plan
- Financial Projections
    |
    v
Trigger browser download
```

### Empty State Component API

```text
<EmptyState
  icon={FileText}
  title="No business plans yet"
  description="Create your first AI-powered business plan to get started"
  action={{ label: "Generate Plan", onClick: handleCreate }}
/>
```

---

## Implementation Order

| Phase | Feature | Estimated Effort | User Impact |
|-------|---------|-----------------|-------------|
| 1 | Dashboard Real Analytics | Medium | High |
| 2 | Business Plan PDF Export | Medium | High |
| 3 | Empty State Components | Low | Medium |
| 4 | Onboarding Redirect Logic | Low | High |
| 5 | Error Boundaries | Low | Medium |

---

## Post-MVP Considerations

After these 5 priorities are complete, the MVP will be fully functional. Future enhancements to consider:

- **Sharing & Collaboration**: Share business plans with team members or investors
- **Notification System**: Email/push notifications for important events
- **Analytics Dashboard**: Track AI usage, costs, and performance metrics
- **Mobile Optimization**: Improve mobile experience for on-the-go founders

