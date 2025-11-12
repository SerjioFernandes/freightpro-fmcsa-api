# FreightPro Deployment Checklist

This guide consolidates the steps required to promote a build to production after the 20-hour feature-completion cycle. Complete these tasks in order and record completion in your release ticket.

## 1. Environment Variables

1. Review `docs/ENV-VARIABLES-TEMPLATE.txt` and ensure Railway / Vercel dashboards include:
   - `FRONTEND_URL` pointing to the production host (include both apex and www in CORS allowlist).
   - Admin hardening variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_ALLOWED_IPS`, `ADMIN_2FA_SECRET`).
   - Email credentials (`RESEND_API_KEY` or SMTP fallback) and updated `EMAIL_VERIFICATION_TTL_MS`.
2. For local smoke tests, copy values into `backend/.env` and `frontend/.env.local`.
3. Restart Railway services after changing secrets.

## 2. Pre-Deploy Verification

- [ ] Run `npm install` in `/backend` and `/frontend`.
- [ ] Build artifacts: `npm run build` in both workspaces (front-end build is handled by Vite).
- [ ] Execute targeted tests (or full suite when time allows):
  - Backend: `npm run test -- --runInBand` (placeholder until integration tests land).
  - Frontend: `npm run lint` and `npm run build`.
- [ ] Execute the smoke section of `docs/regression-playbook.md`.
- [ ] Manually validate new admin exports:
  - GET `/api/admin/export/loads?format=csv`
  - GET `/api/admin/export/shipments?format=csv`
  - GET `/api/admin/export/users?format=csv`
  - JSON format should open printable PDF via dashboard quick actions.
- [ ] Submit a support ticket from Settings and confirm it appears in `/support/tickets`.

## 3. Deployment Steps

### Backend (Railway)
1. Push latest changes to `main` (or release branch).
2. Trigger Railway deploy or run `railway up`.
3. Monitor Railway logs for:
   - Successful connection to MongoDB.
   - Confirmation from `GET /api/health`.
   - No TypeScript compilation warnings.

### Frontend (Vercel)
1. Push branch / promote preview to production.
2. Confirm build uses latest `VITE_API_URL`.
3. Run `npm run build` locally if verifying before commit.

## 4. Post-Deploy Validation

- [ ] Navigate to production site and verify:
  - Auth flows (login/logout, session preview).
  - Load Board booking modal → invoice PDF.
  - Saved search cadence selection.
  - Support ticket submission & status badges.
  - Admin dashboard widgets (conversion, active lanes, billing queue values).
  - Audit log filters (action, collection, admin, date range) and purge control.
- [ ] Review production logs for 10 minutes; ensure no unhandled promise rejections.
- [ ] Export at least one CSV/PDF from the admin dashboard.
- [ ] Update `docs/regression-playbook.md` runbook with deployment date if additional manual scenarios executed.

## 5. Communication

- [ ] Publish change summary (features shipped, migrations, follow-up tasks) to team channel.
- [ ] If purge operation was performed, note deleted counts in release ticket (for compliance).
- [ ] Archive generated exports containing PII securely or delete after QA verification.

Following this checklist keeps FreightPro aligned with the new support, billing, and analytics features added during the 20-hour improvement cycle. Adjust as new automation or monitoring hooks come online.


