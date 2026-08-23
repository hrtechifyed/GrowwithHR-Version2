const SUPABASE_MODULE_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const PRODUCTION_BACKEND = "https://growwithhr.onrender.com";
let clientPromise = null;

function apiBase() {
  if (location.hostname === "hrtechifyed.github.io") return PRODUCTION_BACKEND;
  return "";
}

async function loadConfig() {
  const response = await fetch(`${apiBase()}/api/auth/config`, { credentials: "omit" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body?.configured) {
    throw new Error(body?.error || "GrowWithHR account sign-in is not configured in this environment yet.");
  }
  return body;
}

export async function getAuthClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const [{ createClient }, config] = await Promise.all([
        import(SUPABASE_MODULE_URL),
        loadConfig()
      ]);
      return createClient(config.supabaseUrl, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce"
        }
      });
    })();
  }
  return clientPromise;
}

export function normalizedReturnTarget(value, fallback = "my-growwithhr.html") {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  try {
    const url = new URL(raw, location.origin);
    if (url.origin !== location.origin) return fallback;
    return `${url.pathname.split("/").pop() || fallback}${url.search}${url.hash}`;
  } catch (_error) {
    return fallback;
  }
}

export async function getSession() {
  const client = await getAuthClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session || null;
}

async function accountPost(path, payload = {}) {
  const session = await getSession();
  if (!session?.access_token) throw new Error("Sign in is required.");
  const response = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify(payload),
    credentials: "omit"
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok === false) throw new Error(body?.error || "GrowWithHR account request failed.");
  return body;
}

export async function getUser() {
  const client = await getAuthClient();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  return data.user || null;
}

export async function signUp({ email, password, displayName = "", returnTo = "my-growwithhr.html" }) {
  const client = await getAuthClient();
  const redirectTo = new URL(`auth.html?return=${encodeURIComponent(normalizedReturnTarget(returnTo))}`, location.href).href;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: { display_name: displayName }
    }
  });
  if (error) throw error;
  return data;
}

export async function signInWithPassword({ email, password }) {
  const client = await getAuthClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle(returnTo = "my-growwithhr.html") {
  const client = await getAuthClient();
  const redirectTo = new URL(`auth.html?return=${encodeURIComponent(normalizedReturnTarget(returnTo))}`, location.href).href;
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: false }
  });
  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email) {
  const client = await getAuthClient();
  const redirectTo = new URL("reset-password.html", location.href).href;
  const { data, error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
  return data;
}

export async function updatePassword(password) {
  const client = await getAuthClient();
  const { data, error } = await client.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = await getAuthClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function onAuthStateChange(callback) {
  const client = await getAuthClient();
  return client.auth.onAuthStateChange((_event, session) => callback(session));
}

export async function ensureProfile(user) {
  if (!user?.id) return null;
  const client = await getAuthClient();
  const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "";
  const { data, error } = await client
    .from("profiles")
    .upsert({ user_id: user.id, display_name: displayName, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function latestAssessment(engine) {
  const client = await getAuthClient();
  const { data, error } = await client
    .from("assessments")
    .select("*")
    .eq("engine", engine)
    .eq("status", "in_progress")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function getAssessment(id) {
  const client = await getAuthClient();
  const { data, error } = await client.from("assessments").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function saveAssessmentDraft({ id = null, engine, answers, progress, lastStep, status = "in_progress", analysisPayload = null }) {
  const user = await getUser();
  if (!user) throw new Error("Sign in is required to save this assessment.");
  const client = await getAuthClient();
  const payload = {
    user_id: user.id,
    engine,
    status,
    progress: Math.max(0, Math.min(100, Number(progress) || 0)),
    last_step: Math.max(1, Number(lastStep) || 1),
    answers: answers || {},
    analysis_payload: analysisPayload,
    updated_at: new Date().toISOString(),
    completed_at: status === "completed" ? new Date().toISOString() : null
  };
  if (id) payload.id = id;

  const query = id
    ? client.from("assessments").update(payload).eq("id", id)
    : client.from("assessments").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

export async function listAssessments() {
  const client = await getAuthClient();
  const { data, error } = await client
    .from("assessments")
    .select("id,engine,status,progress,last_step,answers,created_at,updated_at,completed_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function ensureLegacyRecoveryForReport(reportId) {
  const body = await accountPost("/api/account/report/legacy-ensure", { reportId });
  return body.recovery || null;
}

export async function getLegacyRecoveryCredentials() {
  const body = await accountPost("/api/account/legacy-recovery", {});
  return body.recovery || null;
}

export async function emailReportAgain(reportId) {
  const body = await accountPost("/api/account/report/email", { reportId });
  return body.delivery || null;
}

export async function saveReport({ assessmentId = null, engine, title, payload, selectedOptionKey = null, implementationPlan = null }) {
  const user = await getUser();
  if (!user) throw new Error("Sign in is required to save a report.");
  const client = await getAuthClient();
  const { data, error } = await client.from("reports").insert({
    user_id: user.id,
    assessment_id: assessmentId,
    engine,
    title,
    payload: payload || {},
    selected_option_key: selectedOptionKey,
    implementation_plan: implementationPlan,
    updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;

  // Every real signed-in report should receive a legacy Report ID. The first
  // report also creates the account's fallback Recovery Code; later reports are
  // linked into that same legacy recovery workspace. Report saving itself is not
  // discarded if the prototype backend is temporarily unavailable; My GrowWithHR
  // retries provisioning when the user next opens the workspace.
  try {
    const recovery = await ensureLegacyRecoveryForReport(data.id);
    if (recovery?.reportLegacyId) data.legacy_report_id = recovery.reportLegacyId;
    data.legacyRecovery = recovery;
  } catch (legacyError) {
    console.warn("GrowWithHR legacy recovery provisioning will be retried from My GrowWithHR.", legacyError);
    data.legacyRecoveryError = legacyError.message || "Legacy recovery provisioning is pending.";
  }
  return data;
}

export async function getReport(id) {
  const client = await getAuthClient();
  const { data, error } = await client.from("reports").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function listReports() {
  const client = await getAuthClient();
  const { data, error } = await client
    .from("reports")
    .select("id,engine,title,selected_option_key,legacy_report_id,last_emailed_at,email_count,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateReportChoice(id, selectedOptionKey, implementationPlan) {
  const client = await getAuthClient();
  const { data, error } = await client.from("reports").update({
    selected_option_key: selectedOptionKey,
    implementation_plan: implementationPlan,
    updated_at: new Date().toISOString()
  }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAccountData() {
  const client = await getAuthClient();
  const user = await getUser();
  if (!user) return;
  await client.from("reports").delete().eq("user_id", user.id);
  await client.from("assessments").delete().eq("user_id", user.id);
  await client.from("companies").delete().eq("owner_user_id", user.id);
  await client.from("profiles").delete().eq("user_id", user.id);
}
