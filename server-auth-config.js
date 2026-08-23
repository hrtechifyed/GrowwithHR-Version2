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

function handleAuthConfigRequest(request, response) {
  const path = clean(request.url).split("?")[0];
  if (request.method !== "GET" || path !== "/api/auth/config") return false;

  const supabaseUrl = clean(process.env.SUPABASE_URL);
  const anonKey = clean(process.env.SUPABASE_ANON_KEY);
  const configured = Boolean(supabaseUrl && anonKey);

  if (!configured) {
    json(response, 503, {
      ok: false,
      configured: false,
      error: "GrowWithHR account sign-in is not configured in this environment yet."
    });
    return true;
  }

  json(response, 200, {
    ok: true,
    configured: true,
    supabaseUrl,
    anonKey
  });
  return true;
}

module.exports = { handleAuthConfigRequest };
