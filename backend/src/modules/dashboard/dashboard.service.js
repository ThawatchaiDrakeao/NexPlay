const { getSupabaseAdminClient } = require('../../config/database');
const { HttpError } = require('../../utils/httpError');
const { assertTenantAccess } = require('../branch/branch.service');

const countRows = async (query, message) => {
  const { count, error } = await query;
  if (error) throw new HttpError(500, message);
  return count || 0;
};

const getSummary = async (userId, tenantId) => {
  const db = getSupabaseAdminClient();
  await assertTenantAccess(db, userId, tenantId);

  const [totalBookings, pendingPayments, confirmedBookings, activeFields] = await Promise.all([
    countRows(
      db.from('bookings').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      'Unable to count bookings'
    ),
    countRows(
      db.from('payments').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).in('status', ['pending', 'submitted']),
      'Unable to count pending payments'
    ),
    countRows(
      db.from('bookings').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'confirmed'),
      'Unable to count confirmed bookings'
    ),
    countRows(
      db.from('fields').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'active'),
      'Unable to count active fields'
    )
  ]);

  return {
    totalBookings,
    pendingPayments,
    confirmedBookings,
    activeFields
  };
};

module.exports = { getSummary };
