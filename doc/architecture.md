* **System Components & Hosting:**
* **Frontend:** Single-Page Application (SPA) built with React, Vite, and Tailwind CSS, hosted on **Vercel**. Uses client-side routing with `vercel.json` rewrite rules to prevent 404 errors on browser refresh.
* **Backend:** Node.js and Express.js REST API hosted on **Render**, handling JWT authentication, role enforcement, and business logic.
* **Database:** Multi-tenant document store hosted on **MongoDB Atlas**, managed via Mongoose ODM.


* **Communication Model:**
* Client-server communication occurs strictly over HTTPS using JSON payloads via Axios.
* Stateful authentication uses JSON Web Tokens (JWT) passed via `Authorization: Bearer <token>` headers.
* Cross-Origin Resource Sharing (CORS) is configured dynamically on Render to allow requests from the primary domain (`fleetpulse-bice.vercel.app`) and dynamic `.vercel.app` preview environments.


* **End-to-End Request Path (Representative User Action: Technician Updating Service Status):**
1. **User Action:** A technician clicks "In Service" on an assigned task card in the React SPA.
2. **Frontend Request:** Axios sends a `PATCH` request to `[https://fleet-pulse-dc2w.onrender.com/api/service-records/:id/status](https://fleet-pulse-dc2w.onrender.com/api/service-records/:id/status)` containing `{ "status": "In Service" }` and the JWT bearer token.
3. **Backend Middleware:** Express executes CORS origin verification, parses the JSON payload, and passes the request through the JWT authentication middleware.
4. **Authorization Check:** The role middleware verifies the user holds either the `FLEET_MANAGER` or `TECHNICIAN` role and checks if the technician is assigned to the record.
5. **State Validation & DB Execution:** Controller verifies the transition follows the strict lifecycle (`Due` $\rightarrow$ `Booked` $\rightarrow$ `In Service` $\rightarrow$ `Completed`). The document is updated in MongoDB Atlas via Mongoose.
6. **Response:** Server returns `200 OK` with the updated service object; React updates state locally without full page reload.


* **What Was Not Built:**
* **WebSocket/Real-Time Push:** Overdue service alerts are updated via API polling/dashboard mounts rather than real-time WebSockets to minimize server overhead.
* **PDF Generation Engine:** Exporting service history was implemented via lightweight CSV streaming (`GET /api/vehicles/:id/export-csv`) instead of heavy PDF generation tools.
