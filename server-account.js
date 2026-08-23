"use strict";

function clean(value) {
  return String(value || "").trim();
}

function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

async function verifySupabaseUser(accessToken) {
  const baseUrl = clean(process.env.SUPABASE_URL).replace(/\/$/, "");
  const anonKey = clean(process.env.SUPABASE_ANON_KEY);
  if (!baseUrl || !anonKey) throw new Error("Account authentication is not configured.");
  const response = await fetch(`${baseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!response.ok) return null;
  return response.json();
}

async function deleteSupabaseUser(userId) {
  const baseUrl = clean(process.env.SUPABASE_URL).replace(/\/$/, "");
  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!baseUrl || !serviceRole) throw new Error("Server-side account administration is not configured.");
  const response = await fetch(`${baseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`
    }
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Account deletion failed (${response.status}): ${body.slice(0, 300)}`);
  }
}

async function handleAccountRequest(request, response) {
  const path = clean(request.url).split("?")[0];
  if (request.method !== "POST" || path !== "/api/account/delete") return false;

  const authorization = clean(request.headers.authorization);
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    json(response, 401, { ok: false, error: "A signed-in GrowWithHR session is required." });
    return true;
  }

  try {
    const user = await verifySupabaseUser(match[1]);
    if (!user?.id) {
      json(response, 401, { ok: false, error: "The GrowWithHR session is invalid or expired." });
      return true;
    }

    await deleteSupabaseUser(user.id);
    json(response, 200, { ok: true, deleted: true });
  } catch (error) {
    console.error("GrowWithHR prototype account deletion failed.", error);
    json(response, 500, { ok: false, error: "The account could not be deleted just now." });
  }
  return true;
}

module.exports = { handleAccountRequest };
