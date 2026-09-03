# Architecture

The project has a React/Vite browser client, an Express/Mongoose API, and MongoDB. The browser stores
the JWT and sends it as a Bearer token through the shared Axios client. Express verifies the token,
applies role and assignment authorization, then reads or mutates MongoDB documents.

For a service completion, the client calls `PATCH /api/service-records/:id/status`. The API checks the
state transition and technician assignment, updates the record and vehicle service baseline, appends
an immutable timeline event, and creates the next due service cycle. The dashboard and alerts endpoints
calculate current fleet state from those records and baselines.

The implementation deliberately does not include trip tracking, fuel, parts, location tracking, or a
background job. Due and alert state is calculated when dashboard/alert data is requested.