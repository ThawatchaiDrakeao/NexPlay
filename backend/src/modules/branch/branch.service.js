const { getSupabaseAdminClient } = require('../../config/database');
const { HttpError } = require('../../utils/httpError');

const MANAGE_ROLES = ['SUPER_ADMIN', 'TENANT_OWNER'];

const getTenantId = (payload = {}) => payload.tenantId || payload.tenant_id;

const normalizeCode = (value) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');

const assertTenantAccess = async (db, userId, tenantId, manageOnly = false) => {
  if (!tenantId) throw new HttpError(400, 'Tenant id is required');

  const { data, error } = await db
    .from('tenant_users')
    .select('roles(name)')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .eq('status', 'active');

  if (error) throw new HttpError(500, 'Unable to verify tenant access');

  const roles = (data || []).map((item) => item.roles?.name).filter(Boolean);
  const allowed = manageOnly ? roles.some((role) => MANAGE_ROLES.includes(role)) : roles.length > 0;

  if (!allowed) throw new HttpError(403, 'Tenant access denied');
};

const validateBranchInput = ({ name, code, status }) => {
  if (!String(name || '').trim()) throw new HttpError(400, 'Branch name is required');
  if (code !== undefined && !normalizeCode(code)) throw new HttpError(400, 'Valid branch code is required');
  if (status !== undefined && !['active', 'inactive'].includes(status)) throw new HttpError(400, 'Invalid branch status');
};

const createBranch = async (userId, payload) => {
  validateBranchInput(payload);
  const db = getSupabaseAdminClient();
  const tenantId = getTenantId(payload);
  await assertTenantAccess(db, userId, tenantId, true);

  const { data, error } = await db
    .from('branches')
    .insert({
      tenant_id: tenantId,
      name: payload.name.trim(),
      code: normalizeCode(payload.code || payload.name),
      address: payload.address || null,
      phone: payload.phone || null
    })
    .select('id, tenant_id, name, code, address, phone, status, created_at, updated_at')
    .single();

  if (error) throw new HttpError(error.code === '23505' ? 409 : 500, 'Unable to create branch');
  return data;
};

const listBranches = async (userId, tenantId) => {
  const db = getSupabaseAdminClient();
  await assertTenantAccess(db, userId, tenantId);

  const { data, error } = await db
    .from('branches')
    .select('id, tenant_id, name, code, address, phone, status, created_at, updated_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw new HttpError(500, 'Unable to load branches');
  return data || [];
};

const getBranch = async (userId, tenantId, branchId) => {
  const db = getSupabaseAdminClient();
  await assertTenantAccess(db, userId, tenantId);

  const { data, error } = await db
    .from('branches')
    .select('id, tenant_id, name, code, address, phone, status, created_at, updated_at')
    .eq('tenant_id', tenantId)
    .eq('id', branchId)
    .single();

  if (error || !data) throw new HttpError(404, 'Branch not found');
  return data;
};

const updateBranch = async (userId, tenantId, branchId, payload) => {
  validateBranchInput({ name: payload.name ?? 'ok', code: payload.code, status: payload.status });
  const db = getSupabaseAdminClient();
  await assertTenantAccess(db, userId, tenantId, true);

  const updates = {};
  ['name', 'address', 'phone', 'status'].forEach((key) => {
    if (payload[key] !== undefined) updates[key] = typeof payload[key] === 'string' ? payload[key].trim() : payload[key];
  });
  if (payload.code !== undefined) updates.code = normalizeCode(payload.code);
  if (Object.keys(updates).length === 0) throw new HttpError(400, 'No branch updates provided');

  const { data, error } = await db
    .from('branches')
    .update(updates)
    .eq('tenant_id', tenantId)
    .eq('id', branchId)
    .select('id, tenant_id, name, code, address, phone, status, created_at, updated_at')
    .single();

  if (error || !data) throw new HttpError(500, 'Unable to update branch');
  return data;
};

module.exports = {
  assertTenantAccess,
  createBranch,
  listBranches,
  getBranch,
  updateBranch
};
