const FUNCTION_URL = "https://zyypqpzloeczvkyfdznm.supabase.co/functions/v1/growwithhr-prototype-report-vault";
const WORKSPACE_KEY = "growwithhr.zero-cost.workspace.v1";
const REPORT_INDEX_KEY = "growwithhr.zero-cost.reports.v1";
const REPORT_PAYLOAD_PREFIX = "growwithhr.zero-cost.report.payload.v1:";
const RECOVERY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function normalizeRecoveryCode(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function generateRecoveryCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const chars = Array.from(bytes, (byte) => RECOVERY_ALPHABET[byte % RECOVERY_ALPHABET.length]).join("");
  return chars.match(/.{1,4}/g).join("-");
}

async function deriveKey(recoveryCode, salt) {
  const normalized = normalizeRecoveryCode(recoveryCode);
  if (normalized.length < 20) throw new Error("A valid Recovery Code is required.");
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(normalized),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 180000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptPayload(payload, recoveryCode) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(recoveryCode, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
    salt: bytesToBase64(salt)
  };
}

export async function decryptPayload(record, recoveryCode) {
  const salt = base64ToBytes(record.salt);
  const iv = base64ToBytes(record.iv);
  const key = await deriveKey(recoveryCode, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    base64ToBytes(record.ciphertext)
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

async function callVault(body) {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-GrowWithHR-Prototype": "zero-cost-v1"
    },
    body: JSON.stringify(body)
  });
  let payload = null;
  try { payload = await response.json(); } catch (_error) {}
  if (!response.ok || payload?.ok !== true) {
    throw new Error(payload?.error || "GrowWithHR could not access the recovery vault.");
  }
  return payload;
}

export function getLocalWorkspace() {
  return readJson(WORKSPACE_KEY, null);
}

export function saveLocalWorkspace(workspace) {
  writeJson(WORKSPACE_KEY, workspace);
  return workspace;
}

export function clearLocalWorkspace() {
  localStorage.removeItem(WORKSPACE_KEY);
}

export function listLocalReports() {
  const items = readJson(REPORT_INDEX_KEY, []);
  return Array.isArray(items) ? items : [];
}

function rememberReport(meta, payload) {
  const existing = listLocalReports().filter((item) => item.reportId !== meta.reportId);
  existing.unshift(meta);
  writeJson(REPORT_INDEX_KEY, existing.slice(0, 100));
  writeJson(`${REPORT_PAYLOAD_PREFIX}${meta.reportId}`, payload);
}

function localPayload(reportId) {
  return readJson(`${REPORT_PAYLOAD_PREFIX}${reportId}`, null);
}

function clientKey() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function saveReport({ engine, title, payload, metadata = {} }) {
  let workspace = getLocalWorkspace();
  const recoveryCode = workspace?.recoveryCode || generateRecoveryCode();
  const encrypted = await encryptPayload(payload, recoveryCode);
  const requestKey = clientKey();
  const result = await callVault({
    action: "create",
    workspaceId: workspace?.workspaceId || null,
    recoveryCode,
    engine,
    title,
    clientKey: requestKey,
    metadata,
    ...encrypted
  });

  workspace = saveLocalWorkspace({
    workspaceId: result.workspaceId,
    firstReportId: result.firstReportId,
    currentReportId: result.currentReportId,
    recoveryCode,
    updatedAt: new Date().toISOString()
  });

  rememberReport({
    reportId: result.reportId,
    engine,
    title,
    createdAt: result.createdAt || new Date().toISOString(),
    metadata
  }, payload);

  return {
    reportId: result.reportId,
    recoveryCode,
    workspace,
    firstReport: result.firstReportId === result.reportId,
    payload
  };
}

export async function recoverWorkspace(reportId, recoveryCode) {
  const result = await callVault({ action: "list", reportId, recoveryCode });
  const workspace = saveLocalWorkspace({
    workspaceId: result.workspace.id,
    firstReportId: result.workspace.firstReportId,
    currentReportId: result.workspace.currentReportId,
    recoveryCode,
    updatedAt: result.workspace.updatedAt
  });
  return { ...result, workspace };
}

export async function loadReport(reportId, recoveryCode = null) {
  const local = localPayload(reportId);
  const workspace = getLocalWorkspace();
  if (local) return { payload: local, recoveryCode: recoveryCode || workspace?.recoveryCode || "", source: "device" };

  const code = recoveryCode || workspace?.recoveryCode;
  if (!code) {
    const error = new Error("Enter the Recovery Code associated with this report.");
    error.code = "RECOVERY_REQUIRED";
    throw error;
  }
  const result = await callVault({ action: "get", reportId, recoveryCode: code });
  const payload = await decryptPayload(result.report, code);
  rememberReport({
    reportId: result.report.report_id,
    engine: result.report.engine,
    title: result.report.title,
    createdAt: result.report.created_at,
    metadata: result.report.metadata || {}
  }, payload);
  return { payload, recoveryCode: code, source: "vault" };
}

export async function updateReport({ reportId, recoveryCode = null, payload, metadata = {} }) {
  const workspace = getLocalWorkspace();
  const code = recoveryCode || workspace?.recoveryCode;
  if (!code) throw new Error("Recovery Code is required to update this report.");
  const encrypted = await encryptPayload(payload, code);
  const result = await callVault({
    action: "update",
    reportId,
    recoveryCode: code,
    metadata,
    ...encrypted
  });
  const currentMeta = listLocalReports().find((item) => item.reportId === reportId) || {
    reportId,
    engine: result.engine || "organization-growth",
    title: result.title || "GrowWithHR Report",
    createdAt: result.createdAt || new Date().toISOString()
  };
  rememberReport({ ...currentMeta, metadata }, payload);
  return { ...result, payload };
}

export async function deleteRecoveryWorkspace(reportId, recoveryCode) {
  const result = await callVault({ action: "delete", reportId, recoveryCode });
  clearLocalWorkspace();
  return result;
}

export function forgetLocalReport(reportId) {
  localStorage.removeItem(`${REPORT_PAYLOAD_PREFIX}${reportId}`);
  const remaining = listLocalReports().filter((item) => item.reportId !== reportId);
  writeJson(REPORT_INDEX_KEY, remaining);
}
