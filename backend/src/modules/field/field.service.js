const { getSupabaseAdminClient } = require('../../config/database');
const { HttpError } = require('../../utils/httpError');
const { assertTenantAccess } = require('../branch/branch.service');

const normalizeCode = (value) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');

const validateFieldInput = ({ name, code, sportType, status, capacity }) => {
  if (!String(name || '').trim()) throw new HttpError(400, 'Field name is required');
  if (code !== undefined && !normalizeCode(code)) throw new HttpError(400, 'Valid field code is required');
  if (sportType !== undefined && !String(sportType).trim()) throw new HttpError(400, 'Sport type is required');
  if (status !== undefined && !['active', 'inactive', 'maintenance'].includes(status)) throw new HttpError(400, 'Invalid field status');
  if (capacity !== undefined && capacity !== null && Number(capacity) <= 0) throw new HttpError(400, 'Invalid field capacity');
};

const assertBranchInTenant = async (db, tenantId, branchId) => {
  const { data, error } = await db
    .from('branches')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('id', branchId)
    .single();

  if (error || !data) throw new HttpError(404, 'Branch not found');
};

const createField = async (userId, payload) => {
  validateFieldInput(payload);
  const db = getSupabaseAdminClient();
  const tenantId = payload.tenantId || payload.tenant_id;
  const branchId = payload.branchId || payload.branch_id;
  if (!branchId) throw new HttpError(400, 'Branch id is required');

  await assertTenantAccess(db, userId, tenantId, true);
  await assertBranchInTenant(db, tenantId, branchId);

  const sportType = String(payload.sportType || payload.sport_type || 'football').trim();
  const { data, error } = await db
    .from('fields')
    .insert({
      tenant_id: tenantId,
      branch_id: branchId,
      name: payload.name.trim(),
      code: normalizeCode(payload.code || payload.name),
      field_type: sportType,
      sport_type: sportType,
      capacity: payload.capacity || null
    })
    .select('id, tenant_id, branch_id, name, code, sport_type, capacity, status, created_at, updated_at')
    .single();

  if (error) throw new HttpError(error.code === '23505' ? 409 : 500, 'Unable to create field');
  return data;
};

const listFields = async (userId, tenantId, branchId) => {
  const db = getSupabaseAdminClient();
  await assertTenantAccess(db, userId, tenantId);

  let query = db
    .from('fields')
    .select('id, tenant_id, branch_id, name, code, sport_type, capacity, status, created_at, updated_at')
    .eq('tenant_id', tenantId);

  if (branchId) query = query.eq('branch_id', branchId);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new HttpError(500, 'Unable to load fields');
  return data || [];
};

const getField = async (userId, tenantId, fieldId) => {
  const db = getSupabaseAdminClient();
  await assertTenantAccess(db, userId, tenantId);

  const { data, error } = await db
    .from('fields')
    .select('id, tenant_id, branch_id, name, code, sport_type, capacity, status, created_at, updated_at')
    .eq('tenant_id', tenantId)
    .eq('id', fieldId)
    .single();

  if (error || !data) throw new HttpError(404, 'Field not found');
  return data;
};

const updateField = async (userId, tenantId, fieldId, payload) => {
  validateFieldInput({ name: payload.name ?? 'ok', code: payload.code, sportType: payload.sportType, status: payload.status, capacity: payload.capacity });
  const db = getSupabaseAdminClient();
  await assertTenantAccess(db, userId, tenantId, true);

  const updates = {};
  ['name', 'status', 'capacity'].forEach((key) => {
    if (payload[key] !== undefined) updates[key] = typeof payload[key] === 'string' ? payload[key].trim() : payload[key];
  });
  if (payload.code !== undefined) updates.code = normalizeCode(payload.code);
  if (payload.sportType !== undefined || payload.sport_type !== undefined) {
    updates.sport_type = String(payload.sportType || payload.sport_type).trim();
    updates.field_type = updates.sport_type;
  }
  if (Object.keys(updates).length === 0) throw new HttpError(400, 'No field updates provided');

  const { data, error } = await db
    .from('fields')
    .update(updates)
    .eq('tenant_id', tenantId)
    .eq('id', fieldId)
    .select('id, tenant_id, branch_id, name, code, sport_type, capacity, status, created_at, updated_at')
    .single();

  if (error || !data) throw new HttpError(500, 'Unable to update field');
  return data;
};

module.exports = {
  assertBranchInTenant,
  createField,
  listFields,
  getField,
  updateField
};
