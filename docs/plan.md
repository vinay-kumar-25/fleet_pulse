# Implementation Plan

1. Build the Express API, Mongoose models, JWT login, and seeded demo users.
2. Add vehicle management, odometer CSV processing, service records, assignments, and audit events.
3. Add the React shell, role-based routing, theme switching, manager pages, technician assignments,
   alerts, and dashboard visualizations.
4. Harden lifecycle authorization, due/overdue calculations, server-side search, pagination, exports,
   and timeline immutability.
5. Add contract tests and verify lint, syntax, build, and seeded data.

The first implementation used a combined `make_model` field and client-side service-record loading.
Those choices were reversed after the requirements audit in favor of separate fields and server-backed
querying. Deployment and live-host verification remain environment-specific release work.