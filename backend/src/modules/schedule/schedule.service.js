const { getSupabaseAdminClient } = require('../../config/database');
const { HttpError } = require('../../utils/httpError');
const { assertTenantAccess } = require('../branch/branch.service');

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const assertFieldInTenant = async (db, tenantId, fieldId) => {
  const { data, error } = await db
    .from('fields')
    .select('id, branch_id')
    .eq('tenant_id', tenantId)
    .eq('id', fieldId)
    .single();

  if (error || !data) throw new HttpError(404, 'Field not found');
  return data;
};

const validateOpeningHours = ({ dayOfWeek, openTime, closeTime }) => {
  if (!Number.isInteger(Number(dayOfWeek)) || Number(dayOfWeek) < 0 || Number(dayOfWeek) > 6) {
    throw new HttpError(400, 'day_of_week must be 0-6');
  }
  if (!TIME_PATTERN.test(openTime) || !TIME_PATTERN.test(closeTime) || openTime >= closeTime) {
    throw new HttpError(400, 'Invalid opening hours range');
  }
};

const upsertOpeningHours = async (userId, payload) => {
  const tenantId = payload.tenantId || payload.tenant_id;
  const branchId = payload.branchId || payload.branch_id;
  const fieldId = payload.fieldId || payload.field_id || null;
  const dayOfWeek = payload.dayOfWeek ?? payload.day_of_week;
  const openTime = payload.openTime || payload.open_time;
  const closeTime = payload.closeTime || payload.close_time;

  validateOpeningHours({ dayOfWeek, openTime, closeTime });
  const db = getSupabaseAdminClient();
  await assertTenantAccess(db, userId, tenantId, true);

  let resolvedBranchId = branchId;
  if (fieldId) {
    const field = await assertFieldInTenant(db, tenantId, fieldId);
    resolvedBranchId = field.branch_id;
  }
  if (!resolvedBranchId) throw new HttpError(400, 'Branch id is required');

  let query = db
    .from('opening_hours')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('branch_id', resolvedBranchId)
    .eq('day_of_week', Number(dayOfWeek));

  query = fieldId ? query.eq('field_id', fieldId) : query.is('field_id', null);
  const { data: existing } = await query.maybeSingle();

  const values = {
    tenant_id: tenantId,
    branch_id: resolvedBranchId,
    field_id: fieldId,
    day_of_week: Number(dayOfWeek),
    open_time: openTime,
    close_time: closeTime,
    is_closed: false
  };

  const request = existing
    ? db.from('opening_hours').update(values).eq('id', existing.id)
    : db.from('opening_hours').insert(values);

  const { data, error } = await request
    .select('id, tenant_id, branch_id, field_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at')
    .single();

  if (error) throw new HttpError(500, 'Unable to save opening hours');
  return data;
};

const createBlockedTime = async (userId, payload) => {
  const tenantId = payload.tenantId || payload.tenant_id;
  const fieldId = payload.fieldId || payload.field_id;
  const startTime = payload.startTime || payload.start_time;
  const endTime = payload.endTime || payload.end_time;

  if (!fieldId) throw new HttpError(400, 'Field id is required');
  if (!startTime || !endTime || new Date(startTime) >= new Date(endTime)) {
    throw new HttpError(400, 'Invalid blocked time range');
  }

  const db = getSupabaseAdminClient();
  await assertTenantAccess(db, userId, tenantId, true);
  const field = await assertFieldInTenant(db, tenantId, fieldId);

  const { data, error } = await db
    .from('blocked_times')
    .insert({
      tenant_id: tenantId,
      branch_id: field.branch_id,
      field_id: fieldId,
      start_time: startTime,
      end_time: endTime,
      reason: payload.reason || null
    })
    .select('id, tenant_id, branch_id, field_id, start_time, end_time, reason, status, created_at, updated_at')
    .single();

  if (error) throw new HttpError(500, 'Unable to create blocked time');
  return data;
};

module.exports = {
  upsertOpeningHours,
  createBlockedTime
};
