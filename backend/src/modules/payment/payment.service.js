const { getSupabaseAdminClient } = require('../../config/database');
const { HttpError } = require('../../utils/httpError');
const { hasTenantRole, STAFF_ROLES } = require('../booking/booking.service');

const getPaymentWithBooking = async (db, paymentId) => {
  const { data, error } = await db
    .from('payments')
    .select('id, booking_id, tenant_id, amount, status, payment_method, bookings(customer_id, status)')
    .eq('id', paymentId)
    .single();

  if (error || !data) throw new HttpError(404, 'Payment not found');
  return data;
};

const submitSlip = async (userId, payload) => {
  const paymentId = payload.paymentId || payload.payment_id;
  const imageUrl = payload.imageUrl || payload.image_url;
  if (!paymentId) throw new HttpError(400, 'Payment id is required');
  if (!String(imageUrl || '').trim()) throw new HttpError(400, 'Slip image url is required');

  const db = getSupabaseAdminClient();
  const payment = await getPaymentWithBooking(db, paymentId);
  if (payment.bookings?.customer_id !== userId) throw new HttpError(403, 'Payment access denied');
  if (!['pending', 'rejected'].includes(payment.status)) throw new HttpError(400, 'Payment slip cannot be submitted');

  const { data: slip, error } = await db
    .from('payment_slips')
    .insert({ payment_id: paymentId, image_url: imageUrl.trim() })
    .select('id, payment_id, image_url, uploaded_at')
    .single();

  if (error) throw new HttpError(500, 'Unable to submit payment slip');

  await db.from('payments').update({ status: 'submitted' }).eq('id', paymentId);
  await db
    .from('bookings')
    .update({ status: 'awaiting_approval' })
    .eq('id', payment.booking_id)
    .eq('tenant_id', payment.tenant_id);

  return slip;
};

const approvePayment = async (userId, paymentId) => {
  const db = getSupabaseAdminClient();
  const payment = await getPaymentWithBooking(db, paymentId);
  if (payment.bookings?.customer_id === userId) throw new HttpError(403, 'Customer cannot approve own payment');
  if (!(await hasTenantRole(db, userId, payment.tenant_id, STAFF_ROLES))) throw new HttpError(403, 'Payment approval denied');
  if (payment.status !== 'submitted') throw new HttpError(400, 'Payment is not awaiting approval');

  const { data, error } = await db
    .from('payments')
    .update({ status: 'approved' })
    .eq('id', paymentId)
    .eq('tenant_id', payment.tenant_id)
    .select('id, booking_id, tenant_id, amount, status, payment_method, created_at, updated_at')
    .single();

  if (error || !data) throw new HttpError(500, 'Unable to approve payment');

  await db
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', payment.booking_id)
    .eq('tenant_id', payment.tenant_id);

  return data;
};

const rejectPayment = async (userId, paymentId) => {
  const db = getSupabaseAdminClient();
  const payment = await getPaymentWithBooking(db, paymentId);
  if (payment.bookings?.customer_id === userId) throw new HttpError(403, 'Customer cannot reject own payment');
  if (!(await hasTenantRole(db, userId, payment.tenant_id, STAFF_ROLES))) throw new HttpError(403, 'Payment rejection denied');
  if (payment.status !== 'submitted') throw new HttpError(400, 'Payment is not awaiting approval');

  const { data, error } = await db
    .from('payments')
    .update({ status: 'rejected' })
    .eq('id', paymentId)
    .eq('tenant_id', payment.tenant_id)
    .select('id, booking_id, tenant_id, amount, status, payment_method, created_at, updated_at')
    .single();

  if (error || !data) throw new HttpError(500, 'Unable to reject payment');

  await db
    .from('bookings')
    .update({ status: 'pending_payment' })
    .eq('id', payment.booking_id)
    .eq('tenant_id', payment.tenant_id);

  return data;
};

module.exports = {
  submitSlip,
  approvePayment,
  rejectPayment
};
