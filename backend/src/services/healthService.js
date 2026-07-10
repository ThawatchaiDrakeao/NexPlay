const { getSupabaseAdminClient } = require('../config/database');

const checkDatabaseHealth = async () => {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .limit(1);

  if (error) {
    throw new Error(`Database health check failed: ${error.message}`);
  }

  return {
    status: 'connected',
    database: 'supabase',
    checkedAt: new Date().toISOString()
  };
};


module.exports = {
  checkDatabaseHealth
};