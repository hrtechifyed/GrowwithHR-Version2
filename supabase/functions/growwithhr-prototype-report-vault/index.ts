import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const MAX_BODY_BYTES = 2_500_000;
const ALLOWED_ENGINES = new Set(["compliance", "organization-growth"]);

function allowedOrigin(origin: string | null) {
  if (!origin) return "*";
  if (origin === "https://hrtechifyed.github.io") return origin;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  return "";
}

function cors(origin: string | null) {
  const resolved = allowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": resolved || "https://hrtechifyed.github.io",
    "Access-Control-Allow-Headers": "content-type, x-growwithhr-prototype",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}

function json(origin: string | null, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8" }
  });
}

function clean(value: unknown, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function normalizeRecoveryCode(value: unknown) {
  return clean(value, 128).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function recoveryHash(code: unknown) {
  const normalized = normalizeRecoveryCode(code);
  if (normalized.length < 20) throw Object.assign(new Error("A valid GrowWithHR Recovery Code is required."), { status: 400 });
  return sha256(`growwithhr-prototype-v1:${normalized}`);
}

function assertUuid(value: unknown) {
  const text = clean(value, 80);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
    throw Object.assign(new Error("A valid workspace identifier is required."), { status: 400 });
  }
  return text;
}

function assertReportId(value: unknown) {
  const text = clean(value, 80).toUpperCase();
  if (!/^GWHR-\d{4}-\d{4}-[A-Z]{2,}\d{2,}$/.test(text)) {
    throw Object.assign(new Error("A valid GrowWithHR Report ID is required."), { status: 400 });
  }
  return text;
}

async function workspaceById(id: string) {
  const { data, error } = await admin.from("prototype_report_workspaces")
    .select("id,first_report_id,current_report_id,recovery_hash,created_at,updated_at,status")
    .eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

async function workspaceForReport(reportId: string) {
  const { data: report, error: reportError } = await admin.from("prototype_saved_reports")
    .select("workspace_id")
    .eq("report_id", reportId).maybeSingle();
  if (reportError) throw reportError;
  if (!report) return null;
  return workspaceById(report.workspace_id);
}

async function verifyWorkspace(workspace: any, code: unknown) {
  if (!workspace || workspace.status !== "active") {
    throw Object.assign(new Error("This GrowWithHR recovery workspace is unavailable."), { status: 404 });
  }
  const supplied = await recoveryHash(code);
  if (supplied !== workspace.recovery_hash) {
    throw Object.assign(new Error("The Report ID or Recovery Code is incorrect."), { status: 401 });
  }
  return workspace;
}

async function allocateReportId() {
  const { data, error } = await admin.rpc("prototype_allocate_report_id");
  if (error || !data) throw error ?? new Error("A Report ID could not be allocated.");
  return String(data);
}

function encryptedFields(input: any) {
  const ciphertext = clean(input.ciphertext, 2_000_000);
  const iv = clean(input.iv, 256);
  const salt = clean(input.salt, 256);
  if (!ciphertext || !iv || !salt) throw Object.assign(new Error("Encrypted report content is required."), { status: 400 });
  return { ciphertext, iv, salt };
}

async function createReport(input: any) {
  const engine = clean(input.engine, 40);
  if (!ALLOWED_ENGINES.has(engine)) throw Object.assign(new Error("Unsupported GrowWithHR engine."), { status: 400 });
  const title = clean(input.title, 180) || "GrowWithHR Report";
  const encrypted = encryptedFields(input);
  const clientKey = clean(input.clientKey, 120) || null;

  if (clientKey) {
    const { data: existing, error } = await admin.from("prototype_saved_reports")
      .select("report_id,workspace_id,engine,title,created_at")
      .eq("client_key", clientKey).maybeSingle();
    if (error) throw error;
    if (existing) {
      const workspace = await verifyWorkspace(await workspaceById(existing.workspace_id), input.recoveryCode);
      return {
        replayed: true,
        reportId: existing.report_id,
        workspaceId: workspace.id,
        firstReportId: workspace.first_report_id,
        currentReportId: workspace.current_report_id,
        createdAt: existing.created_at
      };
    }
  }

  let workspace: any = null;
  let createdWorkspace = false;
  if (input.workspaceId) {
    workspace = await verifyWorkspace(await workspaceById(assertUuid(input.workspaceId)), input.recoveryCode);
  } else {
    const hash = await recoveryHash(input.recoveryCode);
    const { data, error } = await admin.from("prototype_report_workspaces")
      .insert({ recovery_hash: hash })
      .select("id,first_report_id,current_report_id,recovery_hash,created_at,updated_at,status")
      .single();
    if (error) throw error;
    workspace = data;
    createdWorkspace = true;
  }

  try {
    const reportId = await allocateReportId();
    const metadata = input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata) ? input.metadata : {};
    const { data: report, error: insertError } = await admin.from("prototype_saved_reports")
      .insert({
        workspace_id: workspace.id,
        report_id: reportId,
        engine,
        title,
        ...encrypted,
        metadata,
        client_key: clientKey
      })
      .select("report_id,engine,title,metadata,created_at")
      .single();
    if (insertError) throw insertError;

    const now = new Date().toISOString();
    const patch = {
      first_report_id: workspace.first_report_id || reportId,
      current_report_id: reportId,
      updated_at: now
    };
    const { data: updated, error: updateError } = await admin.from("prototype_report_workspaces")
      .update(patch)
      .eq("id", workspace.id)
      .select("id,first_report_id,current_report_id,created_at,updated_at,status")
      .single();
    if (updateError) throw updateError;

    return {
      replayed: false,
      reportId,
      workspaceId: updated.id,
      firstReportId: updated.first_report_id,
      currentReportId: updated.current_report_id,
      createdAt: report.created_at
    };
  } catch (error) {
    if (createdWorkspace && workspace?.id) {
      await admin.from("prototype_report_workspaces").delete().eq("id", workspace.id);
    }
    throw error;
  }
}

async function listReports(input: any) {
  const reportId = assertReportId(input.reportId);
  const workspace = await verifyWorkspace(await workspaceForReport(reportId), input.recoveryCode);
  const { data, error } = await admin.from("prototype_saved_reports")
    .select("report_id,engine,title,metadata,created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return {
    workspace: {
      id: workspace.id,
      firstReportId: workspace.first_report_id,
      currentReportId: workspace.current_report_id,
      createdAt: workspace.created_at,
      updatedAt: workspace.updated_at
    },
    reports: data ?? []
  };
}

async function getReport(input: any) {
  const reportId = assertReportId(input.reportId);
  const workspace = await verifyWorkspace(await workspaceForReport(reportId), input.recoveryCode);
  const { data, error } = await admin.from("prototype_saved_reports")
    .select("report_id,engine,title,ciphertext,iv,salt,metadata,created_at")
    .eq("report_id", reportId)
    .eq("workspace_id", workspace.id)
    .single();
  if (error) throw error;
  return { workspaceId: workspace.id, report: data };
}

async function updateReport(input: any) {
  const reportId = assertReportId(input.reportId);
  const workspace = await verifyWorkspace(await workspaceForReport(reportId), input.recoveryCode);
  const encrypted = encryptedFields(input);
  const metadata = input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata) ? input.metadata : {};
  const { data, error } = await admin.from("prototype_saved_reports")
    .update({ ...encrypted, metadata })
    .eq("report_id", reportId)
    .eq("workspace_id", workspace.id)
    .select("report_id,engine,title,metadata,created_at")
    .single();
  if (error) throw error;
  await admin.from("prototype_report_workspaces")
    .update({ updated_at: new Date().toISOString(), current_report_id: reportId })
    .eq("id", workspace.id);
  return {
    reportId: data.report_id,
    engine: data.engine,
    title: data.title,
    metadata: data.metadata,
    createdAt: data.created_at,
    updated: true
  };
}

async function deleteWorkspace(input: any) {
  const reportId = assertReportId(input.reportId);
  const workspace = await verifyWorkspace(await workspaceForReport(reportId), input.recoveryCode);
  const { error } = await admin.from("prototype_report_workspaces").delete().eq("id", workspace.id);
  if (error) throw error;
  return { deleted: true, reportId, workspaceId: workspace.id };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json(origin, { error: "Method not allowed." }, 405);
  if (origin && !allowedOrigin(origin)) return json(origin, { error: "Origin not allowed." }, 403);
  const length = Number(req.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return json(origin, { error: "Request is too large." }, 413);

  try {
    const input = await req.json();
    const action = clean(input?.action, 40);
    let result: unknown;
    if (action === "create") result = await createReport(input);
    else if (action === "list") result = await listReports(input);
    else if (action === "get") result = await getReport(input);
    else if (action === "update") result = await updateReport(input);
    else if (action === "delete") result = await deleteWorkspace(input);
    else throw Object.assign(new Error("Unsupported action."), { status: 400 });
    return json(origin, { ok: true, ...result as Record<string, unknown> });
  } catch (error) {
    console.error("GrowWithHR prototype report vault error", error);
    const status = Number((error as any)?.status) || 500;
    return json(origin, { error: clean((error as any)?.message, 300) || "Report vault request failed." }, status);
  }
});
