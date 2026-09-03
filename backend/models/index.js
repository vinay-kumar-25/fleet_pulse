const mongoose = require('mongoose');

// 1. User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password_hash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  role: {
    type: String,
    enum: ['fleet_manager', 'technician'],
    required: [true, 'Role is required']
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// 2. Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  registration_number: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/, 'Please enter a valid Indian vehicle registration number']
  },
  make: {
    type: String,
    required: [true, 'Make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  current_odometer: {
    type: Number,
    required: [true, 'Current odometer reading is required'],
    min: [0, 'Odometer reading cannot be negative']
  },
  date_interval_days: {
    type: Number,
    required: [true, 'Date interval in days is required'],
    min: [1, 'Date interval must be at least 1 day']
  },
  mileage_interval: {
    type: Number,
    required: [true, 'Mileage interval is required'],
    min: [1, 'Mileage interval must be greater than 0']
  },
  grace_period_days: {
    type: Number,
    default: 7,
    min: [0, 'Grace period cannot be negative']
  },
  last_service_at: {
    type: Date,
    default: null
  },
  last_service_odometer: {
    type: Number,
    default: null,
    min: [0, 'Last service odometer cannot be negative']
  },
  is_archived: {
    type: Boolean,
    default: false,
    index: true
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Index for active fleet list performance
vehicleSchema.index({ is_archived: 1, registration_number: 1 });

// 3. Service Record Schema
const serviceRecordSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle reference is required'],
    index: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['due', 'booked', 'in_service', 'completed'],
    default: 'due',
    required: true,
    index: true
  },
  assigned_technicians: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],
  scheduled_date: {
    type: Date,
    default: null
  },
  completed_at: {
    type: Date,
    default: null
  },
  completed_odometer: {
    type: Number,
    default: null,
    min: [0, 'Completed odometer reading cannot be negative']
  },
  alert_dismissed_at: {
    type: Date,
    default: null
  },
  due_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Text search index for global search
serviceRecordSchema.index({ description: 'text' });
// Compound index for optimized filtering, sorting, and pagination
serviceRecordSchema.index({ vehicle_id: 1, status: 1, scheduled_date: 1 });

// 4. Timeline Event Schema (Immutable Audit Log)
const timelineEventSchema = new mongoose.Schema({
  service_record_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRecord',
    required: [true, 'Service record reference is required'],
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  event_type: {
    type: String,
    enum: ['created', 'status_change', 'assignment_add', 'assignment_remove', 'description_update'],
    required: true
  },
  old_value: {
    type: String,
    default: null
  },
  new_value: {
    type: String,
    default: null
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// Block edits/updates to enforce immutability at model layer
timelineEventSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany', 'deleteOne', 'deleteMany', 'findOneAndDelete'], function () {
  throw new Error('Timeline events are strictly immutable and cannot be modified.');
});

timelineEventSchema.pre('deleteOne', { document: true, query: false }, function () {
  throw new Error('Timeline events are strictly immutable and cannot be modified.');
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Vehicle: mongoose.model('Vehicle', vehicleSchema),
  ServiceRecord: mongoose.model('ServiceRecord', serviceRecordSchema),
  TimelineEvent: mongoose.model('TimelineEvent', timelineEventSchema)
};