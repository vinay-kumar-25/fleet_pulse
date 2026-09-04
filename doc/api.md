# Fleet Pulse API Specification

**Base URL:** `[https://fleet-pulse-dc2w.onrender.com/api](https://fleet-pulse-dc2w.onrender.com/api)`

**Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`


## 1. Authentication & User Management

### `POST /api/auth/login`

* **Access:** Public
* **Description:** Authenticate user and return a JWT access token with role information.
* **Request Body:**

{
  "email": "manager@fleetpulse.com",
  "password": "SecurePassword123"
}


* **Success Response (200 OK):**

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "user": {
    "id": "60d5ecb8b3b7c81234567890",
    "name": "Jane Doe",
    "email": "manager@fleetpulse.com",
    "role": "FLEET_MANAGER"
  }
}



### `GET /api/auth/technicians`

* **Access:** Fleet Manager
* **Description:** Retrieve a list of all registered users with the `TECHNICIAN` role.
* **Success Response (200 OK):**

[
  {
    "_id": "60d5ecb8b3b7c81234567891",
    "name": "John Tech",
    "email": "tech@fleetpulse.com",
    "role": "TECHNICIAN"
  }
]




## 2. Vehicle Management

### `GET /api/vehicles`

* **Access:** Fleet Manager, Technician
* **Description:** Retrieve vehicles with server-side pagination, search, and filtering.
* **Query Parameters:** `search`, `status`, `page`, `limit`, `archived`
* **Success Response (200 OK):**

{
  "vehicles": [
    {
      "_id": "60d5ecb8b3b7c81234567892",
      "registrationNumber": "FLT-101",
      "make": "Ford",
      "model": "F-150",
      "odometer": 45000,
      "isArchived": false
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}



### `POST /api/vehicles`

* **Access:** Fleet Manager
* **Description:** Create a new vehicle entry in the system.
* **Request Body:**

{
  "registrationNumber": "FLT-102",
  "make": "Toyota",
  "model": "Tacoma",
  "odometer": 12000,
  "serviceIntervalDateMonths": 6,
  "serviceIntervalOdometer": 5000
}



### `GET /api/vehicles/:id`

* **Access:** Fleet Manager, Technician
* **Description:** Fetch complete details for a single vehicle.

### `GET /api/vehicles/:id/export-csv`

* **Access:** Fleet Manager
* **Description:** Export the complete, immutable service history of a specific vehicle as a CSV file download.

### `PUT /api/vehicles/:id`

* **Access:** Fleet Manager
* **Description:** Update core vehicle specs or service tracking thresholds.

### `PATCH /api/vehicles/:id/archive`

* **Access:** Fleet Manager
* **Description:** Soft-delete/archive a vehicle.

### `PATCH /api/vehicles/:id/restore`

* **Access:** Fleet Manager
* **Description:** Restore an archived vehicle to active status.

### `POST /api/vehicles/bulk-odometer`

* **Access:** Fleet Manager
* **Description:** Bulk update vehicle odometer readings. Processes valid rows while returning per-row success/failure notices.
* **Request Body:**

{
  "updates": [
    { "registrationNumber": "FLT-101", "odometer": 46000 },
    { "registrationNumber": "FLT-102", "odometer": 11000 }
  ]
}




## 3. Service Records

### `GET /api/service-records`

* **Access:** Fleet Manager
* **Description:** List, filter, search, and paginate all fleet service records.
* **Query Parameters:** `search`, `status`, `vehicleId`, `technicianId`, `page`, `limit`

### `GET /api/service-records/my-assigned`

* **Access:** Technician
* **Description:** Retrieve service records assigned to the currently logged-in technician.

### `GET /api/service-records/technicians`

* **Access:** Fleet Manager
* **Description:** Fetch eligible technicians available for service assignments.

### `POST /api/service-records`

* **Access:** Fleet Manager
* **Description:** Create a new service record for a vehicle.
* **Request Body:**

{
  "vehicle": "60d5ecb8b3b7c81234567892",
  "description": "Brake pad replacement and oil change",
  "scheduledDate": "2026-09-15T00:00:00.000Z",
  "assignedTechnicians": ["60d5ecb8b3b7c81234567891"]
}



### `GET /api/service-records/:id`

* **Access:** Fleet Manager, Assigned Technician
* **Description:** Fetch detailed view of a service record.

### `PATCH /api/service-records/:id/status`

* **Access:** Fleet Manager, Assigned Technician
* **Description:** Advance service status through strict lifecycle: `Due` $\rightarrow$ `Booked` $\rightarrow$ `In Service` $\rightarrow$ `Completed`.
* **Request Body:**

{
  "status": "In Service"
}



### `PATCH /api/service-records/:id/description`

* **Access:** Fleet Manager
* **Description:** Edit work requirements or description of a service record.

### `PATCH /api/service-records/:id/technicians`

* **Access:** Fleet Manager
* **Description:** Replace the full list of assigned technicians for a record.

### `POST /api/service-records/:id/assignments`

* **Access:** Fleet Manager
* **Description:** Assign a single technician to a service record.

### `DELETE /api/service-records/:id/assignments/:user_id`

* **Access:** Fleet Manager
* **Description:** Remove a specific technician from a service record assignment.


## 4. Dashboard & Alerts

### `GET /api/dashboard/metrics`

* **Access:** Fleet Manager
* **Description:** Retrieve fleet status counters, active workload stats, and 8-week completion trends.

### `GET /api/dashboard/alerts`

* **Access:** Fleet Manager
* **Description:** Fetch active overdue service alerts requiring manager attention.

### `PATCH /api/dashboard/alerts/:id/dismiss`

* **Access:** Fleet Manager
* **Description:** Dismiss an active overdue service alert. Alerts re-trigger if the vehicle passes the grace period in a future service cycle.