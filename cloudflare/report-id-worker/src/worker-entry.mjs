import worker, { ReportIdRegistry } from "./index.mjs";

export { ReportIdRegistry };

const SERVICE_VERSION = "1.0.1-auth-diagnostic";

function jsonResponse(status, payload) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    });
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === "/health" && request.method === "GET") {
            return jsonResponse(200, {
                ok: true,
                serviceVersion: SERVICE_VERSION,
                secretConfigured: Boolean(String(env.REPORT_ID_ALLOCATOR_SECRET || "").trim()),
                durableObjectBindingConfigured: Boolean(
                    env.REPORT_ID_REGISTRY && typeof env.REPORT_ID_REGISTRY.getByName === "function"
                )
            });
        }

        return worker.fetch(request, env, ctx);
    }
};
