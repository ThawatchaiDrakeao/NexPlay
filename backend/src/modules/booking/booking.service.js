const { getSupabaseAdminClient } = require('../../config/database');
const { HttpError } = require('../../utils/httpError');
const { calculateAvailableSlots } = require('../availability/availability.service');

const ACTIVE_STATUSES = ['pending_payment', 'awaiting_approval', 'confirmed'];
const STAFF_ROLES = ['SUPER_ADMIN', 'TENANT_OWNER', 'STAFF'];

const toTime = (value) => String(value || '').slice(0, 5);

const hasTenantRole = async (db, userId, tenantId, roles = STAFF_ROLES) => {
  const { data, error } = await db
    .from('tenant_users')
    .select('roles(name)')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .eq('status', 'active');

  if (error) throw new HttpError(500, 'Unable to verify tenant access');
  return (data || []).some((item) => roles.includes(item.roles?.name));
};

const getFieldContext = async (db, tenantId, fieldId) => {
  const { data, error } = await db
    .from('fields')
    .select('id, tenant_id, branch_id')
    .eq('tenant_id', tenantId)
    .eq('id', fieldId)
    .single();

  if (error || !data) throw new HttpError(404, 'Field not found');
  return data;
};

const validateBookingInput = ({ tenantId, fieldId, bookingDate, startTime, endTime, totalAmount }) => {
  if (!tenantId) throw new HttpError(400, 'Tenant id is required');
  if (!fieldId) throw new HttpError(400, 'Field id is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(bookingDate || ''))) throw new HttpError(400, 'Valid booking date is required');
  if (!/^\d{2}:\d{2}$/.test(toTime(startTime)) || !/^\d{2}:\d{2}$/.test(toTime(endTime)) || toTime(startTime) >= toTime(endTime)) {
    throw new HttpError(400, 'Invalid booking time range');
  }
  if (Number(totalAmount) < 0) throw new HttpError(400, 'Invalid total amount');
};

const assertNoConflict = async (db, tenantId, fieldId, bookingDate, startTime, endTime) => {
  const { data, error } = await db
    .from('bookings')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('field_id', fieldId)
    .eq('booking_date', bookingDate)
    .in('status', ACTIVE_STATUSES)
    .lt('start_time', endTime)
    .gt('end_time', startTime);

  if (error) throw new HttpError(500, 'Unable to verify booking conflict');
  if ((data || []).length > 0) throw new HttpError(409, 'Booking time is not available');
};

const createBooking = async (userId, payload) => {
  const tenantId = payload.tenantId || payload.tenant_id;
  const fieldId = payload.fieldId || payload.field_id;
  const bookingDate = payload.bookingDate || payload.booking_date;
  const startTime = toTime(payload.startTime || payload.start_time);
  const endTime = toTime(payload.endTime || payload.end_time);
  const totalAmount = Number(payload.totalAmount ?? payload.total_amount ?? 0);

  validateBookingInput({ tenantId, fieldId, bookingDate, startTime, endTime, totalAmount });

  const db = getSupabaseAdminClient();
  const field = await getFieldContext(db, tenantId, fieldId);
  const slots = await calculateAvailableSlots(fieldId, bookingDate);
  const slotAvailable = slots.some((slot) => toTime(slot.start_time) === startTime && toTime(slot.end_time) === endTime);
  if (!slotAvailable) throw new HttpError(409, 'Booking time is not available');

  await assertNoConflict(db, tenantId, fieldId, bookingDate, startTime, endTime);

  const { data: booking, error } = await db
    .from('bookings')
    .insert({
      tenant_id: tenantId,
      branch_id: field.branch_id,
      field_id: fieldId,
      customer_id: userId,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      total_amount: totalAmount,
      status: 'pending_payment'
    })
    .select('id, tenant_id, branch_id, field_id, customer_id, booking_date, start_time, end_time, status, total_amount, created_at, updated_at')
    .single();

  if (error) throw new HttpError(500, 'Unable to create booking');

  const { data: payment, error: paymentError } = await db
    .from('payments')
    .insert({ booking_id: booking.id, tenant_id: tenantId, amount: totalAmount })
    .select('id, booking_id, tenant_id, amount, status, payment_method, created_at, updated_at')
    .single();

  if (paymentError) throw new HttpError(500, 'Unable to create payment');
  return { booking, payment };
};

const listBookings = async (userId, tenantId) => {
  const db = getSupabaseAdminClient();
  let query = db
    .from('bookings')
    .select('id, tenant_id, branch_id, field_id, customer_id, booking_date, start_time, end_time, status, total_amount, created_at, updated_at');

  if (tenantId && await hasTenantRole(db, userId, tenantId)) {
    query = query.eq('tenant_id', tenantId);
  } else {
    query = query.eq('customer_id', userId);
    if (tenantId) query = query.eq('tenant_id', tenantId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new HttpError(500, 'Unable to load bookings');
  return data || [];
};

const getBooking = async (userId, bookingId) => {
  const db = getSupabaseAdminClient();
  const { data, error } = await db
    .from('bookings')
    .select('id, tenant_id, branch_id, field_id, customer_id, booking_date, start_time, end_time, status, total_amount, created_at, updated_at')
    .eq('id', bookingId)
    .single();

  if (error || !data) throw new HttpError(404, 'Booking not found');
  if (data.customer_id !== userId && !(await hasTenantRole(db, userId, data.tenant_id))) {
    throw new HttpError(403, 'Booking access denied');
  }
  return data;
};

const cancelBooking = async (userId, bookingId) => {
  const db = getSupabaseAdminClient();
  const booking = await getBooking(userId, bookingId);
  if (['completed', 'cancelled', 'expired'].includes(booking.status)) {
    throw new HttpError(400, 'Booking cannot be cancelled');
  }

  const { data, error } = await db
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('tenant_id', booking.tenant_id)
    .select('id, tenant_id, branch_id, field_id, customer_id, booking_date, start_time, end_time, status, total_amount, created_at, updated_at')
    .single();

  if (error || !data) throw new HttpError(500, 'Unable to cancel booking');
  return data;
};

module.exports = {
  ACTIVE_STATUSES,
  STAFF_ROLES,
  hasTenantRole,
  createBooking,
  listBookings,
  getBooking,
  cancelBooking
};
