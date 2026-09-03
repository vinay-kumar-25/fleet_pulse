# MongoDB Schema

## User

`email` string, required, unique, trimmed, lowercase, format validated. `password_hash` string,
required. `role` enum: `fleet_manager` or `technician`. Timestamps use `created_at`.

## Vehicle

`registration_number` string, required, unique, trimmed, uppercase, Indian registration regex validated.
`make` and `model` are required trimmed strings. `current_odometer`, `date_interval_days`,
`mileage_interval`, and `grace_period_days` are validated numeric values. `last_service_at` and
`last_service_odometer` store the completion baseline. `is_archived` hides a vehicle from the default
manager list. Timestamps use `created_at` and `updated_at`.

## ServiceRecord

`vehicle_id` references one Vehicle. `created_by` references one User. `description` is a trimmed string.
`status` is the state machine enum `due`, `booked`, `in_service`, `completed`. `assigned_technicians`
is a many-to-many array of User references. `scheduled_date`, `completed_at`, `completed_odometer`,
`alert_dismissed_at`, and `due_at` track lifecycle and alert state.

## TimelineEvent

`service_record_id` references one ServiceRecord and `user_id` references the actor User. `event_type`
records creation, status changes, assignment additions/removals, or description updates. Timeline
updates and deletes are blocked by Mongoose middleware.

Indexes cover archived vehicle listing, service status/vehicle/date filtering, description text search,
and due dates. At 100x scale, aggregation/materialized dashboard counters and a background scheduler
would be the first likely optimizations.



usernames and Password


| Role          | Email                | Password |
| ------------- | -------------------- | -------- |
| Fleet Manager | `manager1@fleet.com` | `123456` |
| Fleet Manager | `manager2@fleet.com` | `123456` |
| Technician    | `tech1@fleet.com`    | `123456` |
| Technician    | `tech2@fleet.com`    | `123456` |
