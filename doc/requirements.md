**Manager**

1. Sign in with email and password
2. Create new vehicles with registration number, make/model, current odometer, and service intervals
3. Edit existing vehicle details
4. Archive and restore vehicles
5. Create new service records for vehicles
6. Assign or remove technicians from service records
7. View all vehicles and complete fleet data across the system
8. Upload CSV files to bulk-update vehicle odometer readings
9. View per-row success and rejection reports for bulk CSV odometer updates
10. Export full service history to a CSV file
11. View main dashboard metrics, workload breakdowns, and 8-week completion charts
12. View overdue service alerts in the alerts area
13. Dismiss overdue service alerts for vehicles

**Technician**
14. Sign in with email and password
15. View consolidated "My Assigned Records" list across all vehicles
16. View details of assigned service records
17. Edit and update work descriptions on assigned service records

**System & Service Record Lifecycle**
18. Enforce server-side role permissions for all actions
19. Flag vehicle as *Due* when date or mileage interval threshold is reached since last service
20. Transition records through strict flow (*Due $\rightarrow$ Booked $\rightarrow$ In Service $\rightarrow$ Completed*)
21. Reject invalid lifecycle state transitions on the server with explanatory error messages
22. Flag records as *Overdue* when left *Due* past the grace period without being booked
23. Reset date and mileage counters upon completing a service to restart intervals from completion values
24. Display live overdue alert count badge in navigation
25. Re-trigger dismissed overdue alerts if a vehicle becomes *Due* again and breaches grace period on a future cycle

**Search, Filtering, & Audit**
26. Execute full-text search over service record descriptions on the server
27. Filter service records by vehicle, status, and technician on the server
28. Sort service records by scheduled date, status, or last update on the server
29. Handle pagination and total match counts on the server
30. Record immutable audit timeline entries for creation, status changes, assignments, and notes
31. Block editing or deletion of timeline entries by any user

---

**Suggested Next Step**
Would you like to outline the database schema or plan the API routes next?