require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, Vehicle, ServiceRecord, TimelineEvent } = require('./models');

const seedDatabase = async () => {
  try {
    // 1. Connect to Database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // 2. Clear Existing Data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await ServiceRecord.deleteMany({});
await TimelineEvent.collection.deleteMany({});
    console.log('Cleared existing database collections.');

    // 3. Create Seed Users
    const passwordHash = await bcrypt.hash('123456', 10);

    const manager1 = await User.create({
      email: 'manager1@fleet.com',
      password_hash: passwordHash,
      role: 'fleet_manager'
    });

    const manager2 = await User.create({
      email: 'manager2@fleet.com',
      password_hash: passwordHash,
      role: 'fleet_manager'
    });

    const technician1 = await User.create({
      email: 'tech1@fleet.com',
      password_hash: passwordHash,
      role: 'technician'
    });

    const technician2 = await User.create({
      email: 'tech2@fleet.com',
      password_hash: passwordHash,
      role: 'technician'
    });

    console.log('Users created:');
    console.log(' - Manager 1: manager1@fleet.com / 123456');
    console.log(' - Manager 2: manager2@fleet.com / 123456');
    console.log(' - Technician 1: tech1@fleet.com / 123456');
    console.log(' - Technician 2: tech2@fleet.com / 123456');

    // 4. Create Seed Vehicles
    const vehicle1 = await Vehicle.create({
      registration_number: 'MH12AB1234',
      make: 'Ford',
      model: 'Transit 2022',
      current_odometer: 45200,
      date_interval_days: 90,
      mileage_interval: 5000,
      grace_period_days: 7,
      is_archived: false
    });

    const vehicle2 = await Vehicle.create({
      registration_number: 'DL3CAB5678',
      make: 'Volvo',
      model: 'FH16 2021',
      current_odometer: 120500,
      date_interval_days: 180,
      mileage_interval: 15000,
      grace_period_days: 14,
      is_archived: false
    });

    console.log('Vehicles created: MH12AB1234, DL3CAB5678');

    // 5. Create Seed Service Records & Timelines

    const service1 = await ServiceRecord.create({
      vehicle_id: vehicle1._id,
      description: 'Standard 45,000 mile oil change and filter inspection.',
      status: 'in_service',
      assigned_technicians: [
        technician1._id,
        technician2._id
      ],
      scheduled_date: new Date()
    });

    await TimelineEvent.create({
      service_record_id: service1._id,
      user_id: manager1._id,
      event_type: 'created'
    });

    await TimelineEvent.create({
      service_record_id: service1._id,
      user_id: manager1._id,
      event_type: 'assignment_add',
      new_value: technician1._id.toString()
    });

    await TimelineEvent.create({
      service_record_id: service1._id,
      user_id: manager1._id,
      event_type: 'assignment_add',
      new_value: technician2._id.toString()
    });

    const service2 = await ServiceRecord.create({
      vehicle_id: vehicle2._id,
      description: 'Brake pad replacement and hydraulic check.',
      status: 'due',
      assigned_technicians: []
    });

    await TimelineEvent.create({
      service_record_id: service2._id,
      user_id: manager2._id,
      event_type: 'created'
    });

    console.log('Service records and initial timelines created.');
    console.log('Seeding completed successfully!');

    process.exit(0);

  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();