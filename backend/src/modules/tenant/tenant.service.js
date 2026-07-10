const { getSupabaseAdminClient } = require('../../config/database');
const { HttpError } = require('../../utils/httpError');

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MANAGE_ROLES = ['SUPER_ADMIN', 'TENANT_OWNER'];

const validateTenantInput = ({ name, slug, timezone }) => {
  if (!String(name || '').trim()) {
    throw new HttpError(400, 'Tenant name is required');
  }

  if (!SLUG_PATTERN.test(String(slug || '').trim())) {
    throw new HttpError(400, 'Valid tenant slug is required');
  }

  if (timezone && !String(timezone).trim()) {
    throw new HttpError(400, 'Valid timezone is required');
  }
};

const validateTenantPatch = ({ name, status, timezone }) => {
  if (name !== undefined && !String(name).trim()) {
    throw new HttpError(400, 'Tenant name cannot be empty');
  }

  if (status !== undefined && !['active', 'inactive', 'suspended'].includes(status)) {
    throw new HttpError(400, 'Invalid tenant status');
  }

  if (timezone !== undefined && !String(timezone).trim()) {
    throw new HttpError(400, 'Valid timezone is required');
  }
};

const getRoleId = async (db, roleName) => {
  const { data, error } = await db
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();

  if (error || !data) {
    throw new HttpError(500, 'Required role is missing');
  }

  return data.id;
};

const canManageTenant = async (db, userId, tenantId) => {
  const { data: memberships, error } = await db
    .from('tenant_users')
    .select('tenant_id, status, roles(name)')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .eq('status', 'active');

  if (error) {
    throw new HttpError(500, 'Unable to verify tenant access');
  }

  return (memberships || []).some((membership) =>
    MANAGE_ROLES.includes(membership.roles?.name)
  );
};

const createTenant = async (userId, payload) => {
  validateTenantInput(payload);

  const db = getSupabaseAdminClient();
  const roleId = await getRoleId(db, 'TENANT_OWNER');

  const { data: tenant, error } = await db
    .from('tenants')
    .insert({
      name: payload.name.trim(),
      slug: payload.slug.trim(),
      timezone: payload.timezone?.trim() || 'Asia/Bangkok'
    })
    .select('id, name, slug, status, timezone, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'Tenant slug already exists');
    }
    throw new HttpError(500, 'Unable to create tenant');
  }

  const { error: membershipError } = await db.from('tenant_users').insert({
    tenant_id: tenant.id,
    user_id: userId,
    role_id: roleId
  });

  if (membershipError) {
    await db.from('tenants').delete().eq('id', tenant.id);
    throw new HttpError(500, 'Unable to assign tenant owner');
  }

  await db.from('audit_logs').insert({
    tenant_id: tenant.id,
    user_id: userId,
    action: 'tenant.created',
    metadata: { slug: tenant.slug }
  });

  return tenant;
};

const getTenantById = async (userId, tenantId) => {
  const db = getSupabaseAdminClient();

  if (!(await canManageTenant(db, userId, tenantId))) {
    throw new HttpError(403, 'Tenant access denied');
  }

  const { data, error } = await db
    .from('tenants')
    .select('id, name, slug, status, timezone, created_at, updated_at')
    .eq('id', tenantId)
    .single();

  if (error || !data) {
    throw new HttpError(404, 'Tenant not found');
  }

  return data;
};

const updateTenant = async (userId, tenantId, payload) => {
  validateTenantPatch(payload);

  const db = getSupabaseAdminClient();

  if (!(await canManageTenant(db, userId, tenantId))) {
    throw new HttpError(403, 'Tenant access denied');
  }

  const updates = {};
  ['name', 'status', 'timezone'].forEach((key) => {
    if (payload[key] !== undefined) {
      updates[key] = typeof payload[key] === 'string' ? payload[key].trim() : payload[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No tenant updates provided');
  }

  const { data, error } = await db
    .from('tenants')
    .update(updates)
    .eq('id', tenantId)
    .select('id, name, slug, status, timezone, created_at, updated_at')
    .single();

  if (error || !data) {
    throw new HttpError(500, 'Unable to update tenant');
  }

  await db.from('audit_logs').insert({
    tenant_id: tenantId,
    user_id: userId,
    action: 'tenant.updated',
    metadata: { fields: Object.keys(updates) }
  });

  return data;
};

module.exports = {
  createTenant,
  getTenantById,
  updateTenant
};
