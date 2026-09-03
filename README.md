# Fleet Maintenance Management System

A full-stack web application designed to track vehicle fleets, monitor maintenance intervals, manage technician task assignments, and log real-time maintenance timelines.

---

## Core Features

* **Fleet & Vehicle Tracking**: Manage active and archived vehicles along with their current odometer readings.
* **Maintenance Threshold Alerts**: Configure mileage (miles) and time (days) intervals to trigger service alerts.
* **Service Lifecycle Management**: Track maintenance records through strict state transitions (`due` → `booked` → `in_service` → `completed`).
* **Technician Assignment**: Assign or remove technicians to specific service records with role-based access controls.
* **Timeline Audit Logging**: Automatically log status changes, description updates, and technician assignments.
* **Per-Vehicle CSV Export**: Export complete service history logs for individual vehicles to CSV files.

---

## System Tech Stack

* **Frontend**: React, Tailwind CSS, Lucide React Icons, Axios
* **Backend**: Node.js, Express.js, JSON Web Tokens (JWT)
* **Database**: MongoDB using Mongoose ODM

---

## Getting Started & Initialization

### Prerequisites
* **Node.js**: v16 or higher
* **Database**: Local MongoDB instance or MongoDB Atlas Connection URI

### 1. Environment Configuration
Create a `.env` file in your root backend folder:

env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fleet_management
JWT_SECRET=your_jwt_secret_key_here



### 2. Installation & Setup

1. **Clone the Repository**

git clone [https://github.com/your-username/fleet-management.git](https://github.com/your-username/fleet-management.git)
cd fleet-management




2. **Backend Setup**

cd backend
npm install
npm run dev




3. **Frontend Setup**

cd ../frontend
npm install
npm run dev







