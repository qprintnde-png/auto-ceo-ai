

# Next Improvements for Auto-CEO

## Remaining MVP Item

### Priority 5: Error Boundaries & Fallback UI
- Create an `ErrorBoundary` class component that catches React render errors
- Add a fallback UI with "Something went wrong" message and retry button
- Wrap main route components in `App.tsx` with error boundaries
- **Files**: Create `src/components/ui/error-boundary.tsx`, update `src/App.tsx`
- **Effort**: Low

---

## Post-MVP Enhancements (suggested order)

### 1. Mobile Optimization
- Improve responsive layouts across dashboard, forms, and sidebars
- Test and fix touch interactions on key flows

### 2. Notification System
- Toast-based in-app notifications for task deadlines, AI generation completion, and financial alerts
- Optional email notifications via Supabase Edge Function

### 3. Sharing & Collaboration
- Share business plans via public links or invite emails
- Read-only viewer for investors/advisors

### 4. Settings Page: Integrations Tab
- The `IntegrationsSettings.tsx` component exists but may not be wired into the Settings page tabs
- Connect it so users can manage third-party API keys

### 5. Security Hardening
- Run a security scan on RLS policies
- Ensure all edge functions validate auth tokens properly
- Audit API key storage (currently in user_metadata — consider moving to a secrets table)

---

## Recommended Next Step

Complete **Priority 5: Error Boundaries** to finish the MVP, then move to mobile optimization or notifications based on your user base needs.

