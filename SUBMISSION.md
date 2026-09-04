# Submission

## Links

- **GitHub repository:** https://github.com/vinay-kumar-25/fleet-pulse
- **Live application:** https://fleetpulse-bice.vercel.app

## Notes for the reviewer

The backend API is hosted on Render's free tier. If the application has been idle, the initial login request or dashboard load may take 30–50 seconds while the Render web service spins up from a cold start. Subsequent requests will process normally.

## Demo credentials

| Role          | Email                | Password |
| ------------- | -------------------- | -------- |
| Fleet Manager | `manager1@fleet.com` | `123456` |
| Fleet Manager | `manager2@fleet.com` | `123456` |
| Technician    | `tech1@fleet.com`    | `123456` |
| Technician    | `tech2@fleet.com`    | `123456` |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| **Frontend** | React, Vite, Tailwind CSS | Fast SPA build performance, utility-first UI styling, and low memory footprint. |
| **Backend** | Node.js, Express.js | Modular REST framework allowing clean middleware-based role enforcement and route segregation. |
| **Database** | MongoDB Atlas, Mongoose ODM | Flexible document store ideal for referencing vehicles, dynamic service records, and technician assignments. |
| **Hosting** | Vercel (Frontend), Render (Backend) | Free-tier CI/CD deployments directly from GitHub with automatic build pipelines. |

## Goal checklist

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Role-based JWT authentication (`FLEET_MANAGER`, `TECHNICIAN`) | **Done** | Server-side role enforcement on all API endpoints. |
| 2 | Vehicle management (Create, Edit, Archive, Restore) | **Done** | Complete lifecycle handling with soft-delete support. |
| 3 | Service record lifecycle (`Due` -> `Booked` -> `In Service` -> `Completed`) | **Done** | Strict state machine validation implemented on backend. |
| 4 | Bulk odometer update via CSV upload | **Done** | Processes valid rows while returning per-row success/failure feedback. |
| 5 | Immutable service history view & CSV export | **Done** | History records cannot be altered; per-vehicle CSV export implemented. |
| 6 | Fleet dashboard & overdue service alert system | **Done** | Shows fleet metrics, status summaries, weekly trends, and dismissible alerts. |
| 7 | Server-side search, filtering, and pagination | **Done** | Handled directly via MongoDB queries for vehicles and service records. |
| 8 | Multi-theme system & responsive mobile UI | **Done** | Built with custom Obsidian dark theme support across all pages. |
| 9 | Single-Page Application routing on Vercel | **Done** | Handled via `vercel.json` rewrites to prevent 404 errors on browser refresh. |
| 10 | Production deployment & CORS configuration | **Done** | Dynamic CORS middleware configured to allow Vercel production and preview domains. |

## How much time did you actually spend?

~14 hours total across architecture design, backend implementation, frontend development, deployment troubleshooting (CORS/SPA rewrites), and documentation sync.

## What would you do next, with another 12 hours?

- **Real-time Updates (Socket.io):** Push immediate dashboard alert updates when a technician completes a service or an overdue grace period expires.
- **Automated Testing Suite:** Add end-to-end integration tests using Supertest for backend routes and React Testing Library for core UI flows.
- **PDF Maintenance Reports:** Generate branded PDF health reports for vehicle export in addition to CSV files.

## What are you least happy with in this codebase, and why?

- **Defensive Environment Variable Sanitization:** The backend includes helper functions in `server.js` and `axiosClient.js` to strip markdown formatting or trailing slashes from `CLIENT_URL` and `VITE_API_BASE_URL`. While effective at preventing runtime failures during deployment, this logic feels like defensive glue code that ideally wouldn't be necessary with cleaner configuration inputs.
- **Axios Interceptor Error Mapping:** Error handling in components relies on manually extracting string messages (`err.response?.data?.message || err.message`) inside `catch` blocks. Standardizing this inside a central Axios response interceptor would make component code cleaner and completely eliminate React object-rendering crashes.