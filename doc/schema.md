### Database Schema

```sql
-- Users table: Stores account details and role-based permissions
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('fleet_manager', 'technician')), -- Server-enforced RBAC
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table: Tracks individual vehicle metadata, interval thresholds, and grace periods
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    current_odometer INT NOT NULL CHECK (current_odometer >= 0),
    date_interval_days INT NOT NULL CHECK (date_interval_days > 0), -- Service due interval in days
    mileage_interval INT NOT NULL CHECK (mileage_interval > 0),    -- Service due interval in miles/km
    grace_period_days INT NOT NULL DEFAULT 7,                       -- Days past 'due' before becoming overdue
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,                    -- True hides from default fleet view without deleting history
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Records table: Manages lifecycle states and historical completion baselines
CREATE TABLE service_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    description TEXT NOT NULL DEFAULT '',                           -- Work description editable by assigned technicians
    status VARCHAR(20) NOT NULL DEFAULT 'due' 
        CHECK (status IN ('due', 'booked', 'in_service', 'completed')), -- Strict lifecycle state machine
    scheduled_date TIMESTAMP WITH TIME ZONE,                        -- Assigned when status moves to 'booked'
    completed_at TIMESTAMP WITH TIME ZONE,                         -- Resets date counter for next service cycle
    completed_odometer INT CHECK (completed_odometer >= 0),         -- Resets mileage counter for next service cycle
    alert_dismissed_at TIMESTAMP WITH TIME ZONE,                   -- Tracks dismissal timestamp; resets when next due cycle triggers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Assignments table: Many-to-Many junction table between technicians and service records
CREATE TABLE service_assignments (
    service_record_id UUID NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (service_record_id, user_id)
);

-- Timeline Events table: Immutable, append-only audit log for full service record history
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_record_id UUID NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,           -- Actor who triggered the event
    event_type VARCHAR(50) NOT NULL,                                -- 'created', 'status_change', 'assignment_add', 'assignment_remove', 'note'
    old_value TEXT,                                                 -- Previous value (for status or assignment changes)
    new_value TEXT,                                                 -- New value (for status or assignment changes)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()              -- Immutable timestamp (no UPDATE or DELETE routes exposed)
);

CSV File Schema

Based on the bulk odometer update handler in Vehicles.jsx, the backend expects a standard CSV format with two headers:

registration_number: String (Unique vehicle registration identifier, e.g., REG-1001).

new_odometer: Integer (New updated odometer mileage reading).






Demo Login Credentials for Testing



Fleet Manager:

Email: manager@fleet.com

Password: password123

Technician:

Email: tech@fleet.com

Password: password123