# FreightPro Regression Playbook

This checklist covers the end-to-end flows that must be validated before each production deployment. Run the full suite after major feature work or infrastructure changes, and execute the "Smoke" subset for hotfixes.

## 1. Core Freight Workflows

### Posting → Booking → Billing
- [ ] Broker can authenticate and access `Post Load`.
- [ ] Load posting enforces validation (rate caps, weight limits, shipment linking) and surfaces success summary.
- [ ] Carrier sees newly posted load on `Load Board` with correct filters and distance/line-haul data.
- [ ] Booking flow captures agreed rate, persists notes, and triggers booking summary modal with invoice preview action.
- [ ] Load status updates to `booked`, `billingStatus` transitions to `ready`, and booking appears in admin analytics.
- [ ] Documents page can link uploaded files to the booked load and filtering by type/date works.
- [ ] Billing PDF preview generates with correct totals and broker/carrier details.

### Shipments & Documents
- [ ] Shipper can create shipment, see it in saved list, and brokers can link loads to open shipments.
- [ ] Document tagging, search, date filters, and bulk actions (verify/tag/delete) behave as expected.
- [ ] Document metadata updates reflect in admin document metrics (verification rate).

## 2. Collaboration & Messaging

- [ ] Connections list renders trusted partners; requests can be accepted/declined.
- [ ] Messaging thread updates live with typing indicators and read receipts.
- [ ] Conversation search filters messages on subject/body.
- [ ] Support chat responds with FAQ answers when possible.
- [ ] Settings support form creates a ticket, resets draft, and ticket appears with correct status.

## 3. Saved Searches & Alerts

- [ ] Saved search list loads existing entries with alert status badges.
- [ ] Frequency selector persists (hourly/daily/weekly) and toggling alerts on/off updates backend.
- [ ] Applying saved search pre-fills Load Board filters via URL params.

## 4. Administration & Analytics

- [ ] Admin dashboard displays updated widgets (conversion rate, active lanes, billing queue, document metrics).
- [ ] Average hours-to-book reflects recent bookings.
- [ ] CSV exports for users, loads, shipments download and contain expected columns.
- [ ] PDF exports open printable reports with proper tabular data.
- [ ] Audit log filters (action, collection, admin, search, date range) narrow results correctly and pagination works.
- [ ] Audit log purge operation deletes entries older than configured retention and logs the purge event.

## 5. Security & Sessions

- [ ] Session preview shows recent devices; revoking sessions removes tokens.
- [ ] Admin routes remain accessible only to admins/IP allowlist (verify 403 from non-admin account).
- [ ] Support ticket endpoints reject unauthenticated requests.

## 6. Deployment Smoke Checklist

Run these after each deploy or hotfix:
- [ ] Landing page, login, and dashboard render without console errors.
- [ ] Key API health: `/api/health`, `/api/admin/system-stats`, `/api/support/tickets`.
- [ ] Load Board returns data and booking modal opens.
- [ ] Messaging socket connects (typing indicator appears).
- [ ] Admin exports (one CSV + one PDF) execute without errors.

Document any failures, include reproduction steps, and rerun the affected section after fixes. Store filled checklists alongside release notes for audit purposes.


