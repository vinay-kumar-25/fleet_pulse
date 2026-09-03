# Submission

Repository: `https://github.com/vinay-kumar-25/fleet_pulse`

Live application: pending deployment.

Demo accounts after running the backend seed script:

- Manager: `manager@fleet.com` / `password123`
- Technician: `tech@fleet.com` / `password123`

Required environment variables are kept outside the repository: `MONGODB_URI`, `JWT_SECRET`, and
`PORT`. Run `npm install` in both `backend` and `frontend`, seed the database from `backend`, then
start the API and Vite client.