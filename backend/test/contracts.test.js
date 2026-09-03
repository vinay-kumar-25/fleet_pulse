const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateDueAt, isAssignedTechnician } = require('../services/scheduling');

test('Indian registration format accepts valid normalized values and rejects old formats', () => {
  const pattern = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;
  assert.equal(pattern.test('MH12AB1234'), true);
  assert.equal(pattern.test('VAN-101'), false);
});

test('mileage threshold makes a service due immediately', () => {
  const dueAt = calculateDueAt({
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    current_odometer: 10000,
    last_service_odometer: 0,
    date_interval_days: 180,
    mileage_interval: 5000
  });
  assert.ok(dueAt.getTime() <= Date.now());
});

test('technician assignment matching compares ObjectId-like values safely', () => {
  const record = { assigned_technicians: [{ toString: () => 'tech-1' }] };
  assert.equal(isAssignedTechnician(record, 'tech-1'), true);
  assert.equal(isAssignedTechnician(record, 'tech-2'), false);
});