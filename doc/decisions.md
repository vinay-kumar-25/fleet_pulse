1. **Normalized MongoDB References over Embedded Service Histories:**
* *Chosen:* Store service records in a separate collection using ObjectIds.
* *Rejected:* Embedding service history arrays inside `Vehicle` documents.
* *Why:* Embedded arrays would hit MongoDB's 16MB document limit over time as service history grows.


2. **Server-Side Lifecycle Enforcement:**
* *Chosen:* Reject invalid status transitions on the Express server (`Due` $\rightarrow$ `Booked` $\rightarrow$ `In Service` $\rightarrow$ `Completed`).
* *Rejected:* Relying on frontend buttons to enforce state logic.
* *Why:* Prevents state corruption through direct API calls or unauthorized requests.


3. **Dynamic CORS Callback for Preview Environments:**
* *Chosen:* Implement Express CORS origin function matching `.vercel.app` suffix.
* *Rejected:* Hardcoding static origins or setting `origin: '*'`.
* *Why:* `origin: '*'` breaks `credentials: true`, while static lists block Vercel deployment preview URLs.


4. **SPA Rewrite Configuration on Vercel:**
* *Chosen:* Add `vercel.json` rewrites redirecting `/(.*)` to `/index.html`.
* *Rejected:* Switching from React Router to hash-based routing (`/#/dashboard`).
* *Why:* Preserves clean RESTful browser URLs while ensuring page refreshes do not trigger Vercel 404s.


5. **Reversed Decision — Base URL Handling in Axios:**
* *Initial Decision:* Hardcoding `baseURL: 'http://localhost:5000/api'` inside Axios client.
* *Reversal:* Replaced with dynamic URL extraction from `import.meta.env.VITE_API_BASE_URL` with auto-sanitization for trailing slashes and redundant `/api` prefixes.
* *Why:* Hardcoded links broke production builds, while un-sanitized environment variables caused duplicate path requests (`/api/api/auth/login`).

