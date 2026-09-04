### Database Schema

The backend uses MongoDB with Mongoose. The schemas below describe the application
models; identifiers are MongoDB `ObjectId` values, not UUIDs. Mongoose creates the
collections from the model names: `users`, `vehicles`, `servicerecords`, and
`timelineevents`.

#### Users (`users`)

| Field | Type | Required / default | Constraints |
| --- | --- | --- | --- |
| `_id` | ObjectId | Generated | Primary identifier |
| `email` | String | Required | Unique, lowercase, trimmed, valid email format |
| `password_hash` | String | Required | Stored password hash |
| `role` | String | Required | `fleet_manager` or `technician` |
| `created_at` | Date | Generated | Mongoose `createdAt` timestamp |

`updated_at` is not created for users.

#### Vehicles (`vehicles`)

| Field | Type | Required / default | Constraints |
| --- | --- | --- | --- |
| `_id` | ObjectId | Generated | Primary identifier |
| `registration_number` | String | Required | Unique, uppercase, trimmed, Indian registration format |
| `make` | String | Required | Trimmed |
| `model` | String | Required | Trimmed |
| `current_odometer` | Number | Required | Minimum `0` |
| `date_interval_days` | Number | Required | Minimum `1` |
| `mileage_interval` | Number | Required | Minimum `1` |
| `grace_period_days` | Number | `7` | Minimum `0` |
| `last_service_at` | Date or null | `null` | Previous service completion date |
| `last_service_odometer` | Number or null | `null` | Minimum `0` |
| `is_archived` | Boolean | `false` | Indexed; archived vehicles are hidden by default |
| `created_at` | Date | Generated | Mongoose `createdAt` timestamp |
| `updated_at` | Date | Generated | Mongoose `updatedAt` timestamp |

Indexes: `{ is_archived: 1, registration_number: 1 }`; `is_archived` is also
indexed by the field definition. Unique registration numbers are enforced by a
unique index.

#### Service Records (`servicerecords`)

| Field | Type | Required / default | Constraints |
| --- | --- | --- | --- |
| `_id` | ObjectId | Generated | Primary identifier |
| `created_by` | ObjectId or null | `null` | References `User` |
| `vehicle_id` | ObjectId | Required | References `Vehicle`; indexed |
| `description` | String | `''` | Trimmed |
| `status` | String | `due` | `due`, `booked`, `in_service`, or `completed`; required and indexed |
| `assigned_technicians` | ObjectId[] | `[]` | References `User`; each value is indexed |
| `scheduled_date` | Date or null | `null` | Set when a record is booked |
| `completed_at` | Date or null | `null` | Completion timestamp |
| `completed_odometer` | Number or null | `null` | Minimum `0` |
| `alert_dismissed_at` | Date or null | `null` | Alert dismissal timestamp |
| `due_at` | Date | `Date.now` | Indexed; calculated service due date |
| `created_at` | Date | Generated | Mongoose `createdAt` timestamp |
| `updated_at` | Date | Generated | Mongoose `updatedAt` timestamp |

Indexes: text index on `description`; compound index
`{ vehicle_id: 1, status: 1, scheduled_date: 1 }`; `vehicle_id`, `status`,
`assigned_technicians`, and `due_at` are also indexed by field definitions.

#### Timeline Events (`timelineevents`)

| Field | Type | Required / default | Constraints |
| --- | --- | --- | --- |
| `_id` | ObjectId | Generated | Primary identifier |
| `service_record_id` | ObjectId | Required | References `ServiceRecord`; indexed |
| `user_id` | ObjectId or null | `null` | References `User` |
| `event_type` | String | Required | `created`, `status_change`, `assignment_add`, `assignment_remove`, or `description_update` |
| `old_value` | String or null | `null` | Previous status or assignment value |
| `new_value` | String or null | `null` | New status, assignment, or description value |
| `created_at` | Date | Generated | Mongoose `createdAt` timestamp |

Timeline events are append-only. Mongoose blocks update and delete operations
for this model, and no API routes expose mutation of existing events.

There is no separate assignments collection: technician assignments are stored
as the `assigned_technicians` ObjectId array on each service record.

### CSV File Schema

The bulk odometer endpoint (`POST /api/vehicles/bulk-odometer`) expects a CSV
with these headers:

| Header | Type | Description |
| --- | --- | --- |
| `registration_number` | String | Vehicle registration identifier; matched case-insensitively after trimming and uppercasing |
| `odometer` or `new_odometer` | Integer | New odometer reading; values lower than the current reading are rejected |

Each row produces a success or rejection result. Temporary uploaded files are
removed after processing.
