const { getSupabaseAdminClient } = require("../../config/database");
const { HttpError } = require("../../utils/httpError");

const listPublicFields = async () => {
  const db = getSupabaseAdminClient();

  const { data, error } = await db
    .from("fields")
    .select("id, branch_id, name, code, sport_type, capacity, status")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    throw new HttpError(500, "Unable to load public fields");
  }

  return data || [];
};

module.exports = {
  listPublicFields,
};
