const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env');

let supabaseAdminClient;

const assertDatabaseConfig = () => {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error('Supabase database configuration is missing');
  }
};

const getSupabaseAdminClient = () => {
  if (!supabaseAdminClient) {
    assertDatabaseConfig();
    supabaseAdminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return supabaseAdminClient;
};

module.exports = {
  getSupabaseAdminClient
};
