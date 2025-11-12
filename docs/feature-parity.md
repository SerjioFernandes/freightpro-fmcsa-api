# FreightPro Feature Parity – Posting → Booking → Billing

## Actors & Roles
- **Shipper** creates shipments (reference backlog of freight) from `Shipments` (`frontend/src/pages/Shipments.tsx`) hitting `/api/shipments`.
- **Broker** posts loads to the public board via `PostLoadForm` (`POST /api/loads`).
- **Carrier** discovers & books loads from the `LoadBoard` (`GET /api/loads`, `POST /api/loads/:id/book`).
- **Admin** can bypass role gates and view global stats/logs.

## End-to-End Flow Snapshot

| Stage | Current UX | API / Data | Side Effects | Gaps & Required Tweaks |
|-------|------------|------------|--------------|------------------------|
| **1. Shipment creation (optional)** | Shipper uses `CreateShipmentForm` modal inside `Shipments` to open lane requests. | `POST /api/shipments` validates lanes, generates `shipmentId`. | No broadcast beyond shipper dashboards. Loads can reference `shipmentId`, but UI offers only a free-text field. | • Need searchable selector/link for open shipments.<br>• No automated sync between shipment status and linked loads. |
| **2. Load posting (Broker)** | `/post-load` renders `PostLoadForm`. Comprehensive validation (origin/destination, dates, weight, rate). | `POST /api/loads` geocodes, enforces MC rules, emits websocket `"new_load"`. Stored in `Load` with optional `shipmentId`. | Load board refresh relies on brokers/carriers fetching manually; websocket listeners add new load in store but no broker confirmation view. | • Confirmation modal now summarises billing + next steps.<br>• Per-mile rate guardrails and high-weight advisories added.<br>• Distance is auto-calculated server-side for analytics.<br>• Shipment lookup dropdown reduces manual IDs (still optional tagging backlog). |
| **3. Load discovery (Carrier)** | `LoadBoard` filters (`BoardSearchBar`, URL params). Real-time updates via `useRealTimeUpdates`. | `GET /api/loads` supports pagination, role-based filtering (intrastate if no MC). | Store caches results; booking call updates in-place. | • No persisted saved filters beyond `SavedSearches` redirect.<br>• No analytics tracking on filter usage.<br>• Distance/rate derived fields not cached for billing. |
| **4. Booking (Carrier)** | Booking dialog captures agreed rate + notes with confirmation modal. | `POST /api/loads/:id/book` sets `status='booked'`, attaches `bookedBy`, emits websocket `"load_updated"`, stores agreed rate/notes. | Load disappears from list after refetch; booking summary surfaces billing readiness, broker contact, and document checklist. | • Need broker/carrier notifications beyond websocket (pending **alerts-upgrade**).<br>• Still missing payment term capture & accessorial structure (future iteration). |
| **5. Documents / Compliance** | `Documents` page lists uploads with filtering/search (recent enhancements). Upload modal managed separately (`DocumentUploadModal`). | Backend `Document` endpoints (upload/list/delete) exist; metadata stores `type`, `isVerified`, `linked load/shipment`. | No bulk operations; verification flags not surfaced in UI. | • Tagging/metadata editing missing in UI.<br>• Bulk actions (multi-download, verify, delete) absent.<br>• No workflow tying required docs to booking/billing milestones. |
| **6. Billing & Settlement** | **Not implemented** – no UI surface, no API endpoints, no invoice templates. | No backend routes under `/api/billing`; models lack invoice/settlement entities. | — | • Need invoice generation (PDF/CSV), payment status tracking, broker/carrier overview.<br>• Need integration with documents (e.g., BOL, POD). |

## Detailed Notes & Blockers

### Load Posting (`PostLoadForm` → `loadController.postLoad`)
- Strong client-side validation; server repeats state/ZIP checks and MC enforcement.
- Shipment linkage exposes searchable dropdown (fallback manual field). Validation still requires open shipment but UX is handled.
- After posting, broker receives summary modal with billing snapshot, linked shipment overview, and document CTA.
- Geocoding is synchronous; failures convert to lack of coordinates but still post. Consider retry/alert if geocode fails (nice-to-have).
- Distance is computed server-side (haversine miles) for analytics + per-mile billing estimates.

### Load Booking (`LoadBoard` → `loadController.bookLoad`)
- Booking captures agreed rate and optional notes; confirmation modal provides next steps and quick links.
- Server stamps `bookedAt`, `agreedRate`, `bookingNotes`, and flips `billingStatus` to `ready`.
- No broker/carrier notifications besides websocket. Need notification service hook (plan item **alerts-upgrade**).
- Booking does not create shipment leg or financial record. **Action:** when booking, create a `ShipmentRequest` closure or new `Delivery` entity to feed billing (**billing-handoff**).

### Documents
- Frontend now supports search, filters, date range, and queue tags. Backend already stores `type`, `isVerified`, `linked load/shipment`, but there is no UI to edit metadata or bulk verify. **Action:** add tagging + bulk actions UI and extend `PATCH /api/documents/:id` for metadata updates (**documents-solidify**).
- No automatic requirement tracking per load (e.g., enforce BOL before billing). Should tie into booking summary checklist.

### Billing
- Billing endpoints now expose invoice previews and ready-to-bill listings (`/billing/invoices/...`). Front-end generates a printable invoice PDF from Load Board booking summary (plan item **billing-handoff**).
- Still need persistent invoice entity and settlement workflow for delivered loads. CSV exports hook into admin reporting backlog (plan items **reporting-suite**, **admin-kpis**).
- Payment statuses/aging reports should surface on Admin dashboard after invoice entity lands.

### Analytics & Admin
- Admin dashboard now surfaces conversion rate, active lane counts, billing readiness, document verification, and average time-to-book metrics (**admin-kpis**).
- Admin reporting now ships CSV downloads (users/loads/shipments) plus one-click PDF reports leveraging the new admin exports (**reporting-suite**).

### Notifications & Collaboration
- Messaging service handles basic CRUD but lacks typing indicators/read receipts. Booking flow should trigger conversations automatically (**messaging-polish**).
- Notifications preferences exist but no digest/alert for booking transitions. Booking/billing events should create entries in `notification.service` (**alerts-upgrade**).

### QA & Deployment
- Need regression checklist covering posting→booking→documents→billing once features land (**qa-checklist**).
- Ensure `.env.example` references new billing endpoints and document requirements (**deployment-ready**).

## Next Steps Reference
- **post-booking-gap:** Confirmation UI, shipment linking UI, broker/carrier notifications.
- **documents-solidify:** Metadata editing, bulk actions, enforcement hooks.
- **billing-handoff:** Introduce billing API, invoice exports, integrate with documents & admin analytics.
- **messaging-polish / alerts-upgrade / support-routing:** ensure comms wrap around booking/billing events.
- **admin-kpis / reporting-suite / audit-trails:** Extend analytics to cover financial state and compliance.
  - Admin dashboards now expose conversion, lane, and billing metrics.
  - CSV/PDF exports available for users, loads, shipments.
  - Audit trail includes advanced filters (action, collection, admin, date range) and retention purge controls.
- **qa-checklist / type-safety-pass / deployment-ready / completion-report:** polish steps after feature gaps are closed.

## API & Data Reference

| Entity | Collection / Model | Key Fields | Notes |
|--------|--------------------|------------|-------|
| Load | `Load` (`backend/src/models/Load.model.ts`) | `status`, `rate`, `rateType`, `shipment`, `bookedBy`, `documents[]` | Status values: `draft?` (unused), `available`, `booked`. Lacks billing metadata (no `deliveredAt`, `invoiceId`). |
| Shipment | `Shipment` (`backend/src/models/Shipment.model.ts`) | `shipmentId`, `status`, `requestedBy`, `lane` | Status `open`/`closed`; load linkage is manual (`Load.shipmentId`). |
| Document | `Document` (`backend/src/models/Document.model.ts`) | `type`, `isVerified`, `loadId`, `shipmentId`, `expiresAt` | Controller supports upload/delete; no metadata update endpoint yet. |
| Notification | `Notification` (`backend/src/models/Notification.model.ts`) | `type`, `entityId`, `channels`, `isImportant` | Booking/billing events not wired into notifications. |

## Blocker Summary

1. **Shipment association UX** – Broker UI must surface open shipments for selection and auto-update status when loads are booked or delivered.
2. **Booking handoff** – Need transactional record capturing booking timestamp, negotiated rate, and initial billing status; should trigger notifications.
3. **Documents workflow** – Implement metadata editing, verification toggles, and required-document checklist tied to load status transitions.
4. **Billing foundation** – Introduce invoice entity, PDF/CSV generation, and admin visibility. Without this, `billing-handoff` cannot proceed.
5. **Analytics continuity** – Extend stats endpoints to compute funnel metrics (posted → booked → billed) and revenue projections.

This document will be updated as we implement each plan item and close gaps toward production parity.

