## DORA Project Audit Plan

**Trigger keyword:** `DORA`

### Objective
- Perform a full sweep of the codebase to understand structure, data flow, and feature interactions.
- Validate that all user journeys, role-based permissions, services, and external integrations behave as intended.
- Identify defects, regressions, or unused assets and propose fixes.

### Scope
- Frontend (`frontend/src`, `frontend/public`, build tooling).
- Backend (`backend/src`, compiled `dist`, deployment scripts).
- Shared scripts, documentation, and infrastructure configs (`docs`, `scripts`, `railway.json`, etc.).

### Deliverables
- Detailed findings report (bugs, UX issues, performance concerns).
- Prioritized fix list with recommended changes.
- Verification notes (tests run, devices/browsers checked).

### Process
1. **Project Mapping**
   - Inventory directory structure, key modules, data contracts.
   - Document routing, layout composition, state stores, and service boundaries.
2. **Authentication & Authorization**
   - Verify login/logout, role gating, admin overrides, and persistence (localStorage, tokens).
   - Confirm ProtectedRoute logic and API security (JWT validation, rate limits).
3. **Core Features Walkthrough**
   - Dashboards, load board, messaging, documents, forms, pricing, admin console.
   - Validate UI states (loading, errors, empty states) on desktop + mobile breakpoints.
4. **Supporting Systems**
   - Notifications, WebSocket events, service workers/PWA flows, offline handling.
   - Background tasks, cron scripts, build + deployment automation.
5. **Error & Logging Review**
   - Inspect error boundaries, logging, monitoring hooks, retry logic.
6. **Testing & Verification**
   - Re-run available automated tests.
   - Execute manual regression scripts (smoke, critical paths).
7. **Reporting & Fixes**
   - Summarize issues, root causes, and remediation steps.
   - Estimate effort for each fix and flag high-risk areas.

### Estimated Effort
- Deep audit: **4–6 hours** (analysis + verification).
- Follow-up fixes: timeboxed per issue severity; plan to schedule after audit results.

### Usage
- When the user issues the keyword **“DORA”**, load this plan and begin the audit sequence, updating the todo list and reporting progress at each stage.


