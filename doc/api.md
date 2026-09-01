

### API Endpoints

#### **Authentication & Staff Management**

* `POST /api/auth/login`
* **Description**: Authenticates users (email/password) and returns session token with role information.


* `GET /api/technicians`
* **Access**: Fleet Manager only.
* **Description**: Returns list of all users with `role = 'technician'` to populate assignee selection UI.



#### **Vehicle Management (Fleet Manager Only)**

* `GET /api/vehicles`
* **Access**: Fleet Manager.
* **Description**: Lists vehicles. Accepts `?include_archived=true` query param to toggle viewing archived vehicles.


* `POST /api/vehicles`
* **Access**: Fleet Manager.
* **Description**: Creates a new vehicle with registration number, make/model, current odometer, date interval, mileage interval, and grace period.


* `GET /api/vehicles/:id`
* **Access**: Fleet Manager / Technician.
* **Description**: Retrieves detailed view of a vehicle along with its full service record history.


* `PUT /api/vehicles/:id`
* **Access**: Fleet Manager.
* **Description**: Updates vehicle metadata and interval/grace period configurations.


* `PATCH /api/vehicles/:id/archive`
* **Access**: Fleet Manager.
* **Description**: Archives a vehicle (removes it from default view without deleting historical service records).


* `PATCH /api/vehicles/:id/restore`
* **Access**: Fleet Manager.
* **Description**: Restores an archived vehicle back to the active fleet.



#### **Service Records & Lifecycle**

* `GET /api/service-records`
* **Access**: Fleet Manager / Technician.
* **Description**: Server-side searchable, filterable, sortable, and paginated list of service records across accessible vehicles.
* **Query Params**: `?search=`, `?vehicle_id=`, `?status=`, `?technician_id=`, `?sort_by=scheduled_date|status|updated_at`, `?page=1`, `?limit=10`.


* `POST /api/service-records`
* **Access**: Fleet Manager.
* **Description**: Creates a new service record linked to a vehicle and logs the initial entry into `timeline_events`.


* `GET /api/service-records/:id`
* **Access**: Fleet Manager / Assigned Technician.
* **Description**: Fetches single service record, assigned technicians, and its complete immutable timeline history.


* `PATCH /api/service-records/:id/status`
* **Access**: Fleet Manager / Assigned Technician.
* **Description**: Advances record status through strict sequence (*Due $\rightarrow$ Booked $\rightarrow$ In Service $\rightarrow$ Completed*).
* **Logic**: Server rejects invalid transitions. Completing a record sets `completed_at` and `completed_odometer`, resetting service counters. Logs event to `timeline_events`.


* `PATCH /api/service-records/:id/description`
* **Access**: Fleet Manager / Assigned Technician.
* **Description**: Updates the work description for the service record. Server blocks technicians not assigned to this record.


* `POST /api/service-records/:id/assignments`
* **Access**: Fleet Manager.
* **Description**: Assigns one or more technicians to the service record. Logs assignment additions to `timeline_events`.


* `DELETE /api/service-records/:id/assignments/:user_id`
* **Access**: Fleet Manager.
* **Description**: Unassigns a technician from the service record. Logs assignment removals to `timeline_events`.


* `GET /api/my-assigned-records`
* **Access**: Technician.
* **Description**: Consolidated list of all service records assigned to the currently logged-in technician across all vehicles.



#### **Bulk Operations & Export (Fleet Manager Only)**

* `POST /api/vehicles/bulk-odometer`
* **Access**: Fleet Manager.
* **Description**: Processes uploaded CSV file containing vehicle registration numbers and new odometer readings.
* **Logic**: Evaluates line-by-line; rejects readings lower than the vehicle's last recorded odometer reading while applying valid updates. Returns a row-by-row success/failure report.


* `GET /api/service-records/export`
* **Access**: Fleet Manager.
* **Description**: Exports all service records (vehicle details, dates, statuses, odometer readings) as a downloadable CSV file.



#### **Dashboard & Overdue Alerts**

* `GET /api/dashboard/metrics`
* **Access**: Fleet Manager.
* **Description**: Returns top-line metrics (vehicles due, in service, completed this week, overdue), status breakdowns, technician workload metrics, and 8-week completed services trend data.


* `GET /api/alerts`
* **Access**: Fleet Manager.
* **Description**: Retrieves active overdue service record alerts and returns total count for the navigation badge.
* **Logic**: Calculates overdue records where `due_since + grace_period_days < NOW()` and `alert_dismissed_at` is null or from a previous service cycle.


* `PATCH /api/service-records/:id/dismiss-alert`
* **Access**: Fleet Manager.
* **Description**: Sets `alert_dismissed_at = NOW()` for the service record. The alert remains hidden until the vehicle completes this service and breaches its grace period on a future cycle.