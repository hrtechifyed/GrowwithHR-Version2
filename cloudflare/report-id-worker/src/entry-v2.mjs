import reportIdWorker, { ReportIdRegistry } from "./index.mjs";

const RETENTION_ENDPOINT =
    "https://growwithhr.onrender.com/api/company-workspace/retention/run";

function cleanText(value, fallback = "") {
    return String(value ?? "").trim() || fallback;
}

async function runRetentionSweep(env) {
    const secret = cleanText(env.WORKSPACE_RETENTION_SECRET);
    if (!secret) {
        console.warn("GrowWithHR retention cron skipped because WORKSPACE_RETENTION_SECRET is not configured.");
        return { ok: false, skipped: true, reason: "retention-secret-not-configured" };
    }

    const response = await fetch(RETENTION_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Retention-Secret": secret
        },
        body: "{}"
    });

    const text = await response.text();
    let payload = {};
    try {
        payload = text ? JSON.parse(text) : {};
    } catch (_error) {
        payload = {};
    }

    if (!response.ok) {
        throw new Error(
            cleanText(payload.error, `GrowWithHR retention endpoint returned ${response.status}.`)
        );
    }

    return payload;
}

export { ReportIdRegistry, runRetentionSweep };

export default {
    fetch(request, env, ctx) {
        return reportIdWorker.fetch(request, env, ctx);
    },

    scheduled(_controller, env, ctx) {
        ctx.waitUntil(
            runRetentionSweep(env).catch((error) => {
                console.error("GrowWithHR Cloudflare retention cron failed.", error);
            })
        );
    }
};
