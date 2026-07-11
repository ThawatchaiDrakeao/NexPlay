const crypto = require("crypto");

const { env } = require("../../config/env");
const { getSupabaseAdminClient } = require("../../config/database");
const { HttpError } = require("../../utils/httpError");
const { hashPassword, comparePassword } = require("./password");
const {
  verifyLineIdToken,
  extractTrustedLineIdentity,
  findOrCreateLineUser,
} = require("../line/line.service");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JWT_ALGORITHM = "HS256";
const JWT_TTL_SECONDS = 60 * 60 * 8;

const base64url = (value) => Buffer.from(value).toString("base64url");

const signJwt = (payload) => {
  const header = { alg: JWT_ALGORITHM, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + JWT_TTL_SECONDS,
  };
  const unsignedToken = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(body))}`;
  const signature = crypto
    .createHmac("sha256", env.jwtSecret)
    .update(unsignedToken)
    .digest("base64url");

  return `${unsignedToken}.${signature}`;
};

const verifyJwt = (token) => {
  const [encodedHeader, encodedPayload, signature] = String(token).split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new HttpError(401, "Invalid token");
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.jwtSecret)
    .update(unsignedToken)
    .digest("base64url");

  if (
    expectedSignature.length !== signature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature),
    )
  ) {
    throw new HttpError(401, "Invalid token");
  }

  let payload;

  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
  } catch (error) {
    throw new HttpError(401, "Invalid token");
  }

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, "Token expired");
  }

  return payload;
};

const validateRegisterInput = ({ email, password, name }) => {
  if (
    !EMAIL_PATTERN.test(
      String(email || "")
        .trim()
        .toLowerCase(),
    )
  ) {
    throw new HttpError(400, "Valid email is required");
  }

  if (String(password || "").length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters");
  }

  if (!String(name || "").trim()) {
    throw new HttpError(400, "Name is required");
  }
};

const validateLoginInput = ({ email, password }) => {
  if (
    !EMAIL_PATTERN.test(
      String(email || "")
        .trim()
        .toLowerCase(),
    ) ||
    !password
  ) {
    throw new HttpError(400, "Email and password are required");
  }
};

const getUserMemberships = async (userId) => {
  const db = getSupabaseAdminClient();
  const { data: tenantUsers, error } = await db
    .from("tenant_users")
    .select("tenant_id, role_id, status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    throw new HttpError(500, "Unable to load tenant access");
  }

  if (!tenantUsers || tenantUsers.length === 0) {
    return [];
  }

  const roleIds = [...new Set(tenantUsers.map((item) => item.role_id))];
  const { data: roles, error: rolesError } = await db
    .from("roles")
    .select("id, name")
    .in("id", roleIds);

  if (rolesError) {
    throw new HttpError(500, "Unable to load roles");
  }

  const roleMap = new Map((roles || []).map((role) => [role.id, role.name]));

  return tenantUsers.map((membership) => ({
    tenantId: membership.tenant_id,
    role: roleMap.get(membership.role_id),
  }));
};

const register = async ({ email, password, name }) => {
  validateRegisterInput({ email, password, name });

  const db = getSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  const { data, error } = await db
    .from("users")
    .insert({
      email: normalizedEmail,
      password_hash: passwordHash,
      name: name.trim(),
    })
    .select("id, email, name, status")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new HttpError(409, "Email already exists");
    }
    throw new HttpError(500, "Unable to register user");
  }

  return {
    user: data,
    token: signJwt({
      sub: data.id,
      email: data.email,
      memberships: [],
    }),
  };
};

const login = async ({ email, password }) => {
  validateLoginInput({ email, password });

  const db = getSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: user, error } = await db
    .from("users")
    .select("id, email, password_hash, name, status")
    .eq("email", normalizedEmail)
    .single();

  if (error || !user || user.status !== "active") {
    throw new HttpError(401, "Invalid credentials");
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  const memberships = await getUserMemberships(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
    },
    token: signJwt({
      sub: user.id,
      email: user.email,
      memberships,
    }),
  };
};

const authenticateWithLine = async ({ idToken }) => {
  if (!String(idToken || "").trim()) {
    throw new HttpError(400, "LINE id token is required");
  }

  const verifiedToken = await verifyLineIdToken(idToken);
  const identity = extractTrustedLineIdentity(verifiedToken);
  const user = await findOrCreateLineUser(identity.lineUserId);

  if (!user || user.status !== "active") {
    throw new HttpError(403, "LINE user is not active");
  }

  const memberships = await getUserMemberships(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      lineUserId: user.line_user_id,
      status: user.status,
    },
    token: signJwt({
      sub: user.id,
      lineUserId: user.line_user_id,
      memberships,
    }),
  };
};

module.exports = {
  register,
  login,
  authenticateWithLine,
  verifyJwt,
};
