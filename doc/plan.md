* **Development Sessions & Build Order:**
1. **Session 1 (Backend Core):** Project setup, MongoDB connection, Mongoose schema creation (`User`, `Vehicle`, `ServiceRecord`), and JWT authentication middleware.
2. **Session 2 (API Routes & Logic):** REST endpoints for vehicle management, service lifecycle state checks, server-side pagination, and bulk CSV odometer processing.
3. **Session 3 (Frontend Framework):** Vite/React project scaffolding, Tailwind CSS integration, Axios client setup, and reusable Obsidian dark theme implementation.
4. **Session 4 (UI Integration):** Vehicle list, service history expanders, CSV exports, technician assignment flows, and dashboard charts.
5. **Session 5 (DevOps & Debugging):** Deployment to Vercel and Render, fixing CORS origin errors, fixing SPA refresh 404s via `vercel.json`, and cleaning environment variables.


* **Estimates vs. Actuals:**
* *Estimated:* Production deployment and environment variable integration would take 1 hour.
* *Actual:* Took ~3 hours due to production build circular imports, Vite environment variable embedding rules, and CORS preflight headers handling Vercel preview domains.


* **Scope Cuts:**
* Multi-file document uploads for vehicle maintenance receipts were cut to keep the project focused on core fleet operations and immutable history tracking.
