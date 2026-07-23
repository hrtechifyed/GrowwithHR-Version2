"use strict";

const http = require("http");
const { handleM4DeliveryRequest } = require("./server-m4-delivery");

const DEFAULT_CROSS_ORIGIN_ALLOWLIST = new Set([
    "https://hrtechifyed.github.io"
]);

function cleanText(value) {
    return String(value || "").trim();
}

function configuredOrigins() {
    const origins = new Set(DEFAULT_CROSS_ORIGIN_ALLOWLIST);
    cleanText(process.env.ALLOWED_CORS_ORIGINS)
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
        .forEach((origin) => origins.add(origin));
    return origins;
}

function requestSameOrigin(request) {
    const forwardedProtocol = cleanText(request.headers["x-forwarded-proto"])
        .split(",")[0]
        .trim();
    const forwardedHost = cleanText(request.headers["x-forwarded-host"])
        .split(",")[0]
        .trim();
    const protocol = forwardedProtocol || "http";
    const host = forwardedHost || cleanText(request.headers.host);
    return host ? `${protocol}://${host}` : "";
}

function appendVary(response, value) {
    const existing = cleanText(response.getHeader("Vary"));
    const values = existing
        ? existing.split(",").map((item) => item.trim()).filter(Boolean)
        : [];
    if (!values.includes(value)) values.push(value);
    response.setHeader("Vary", values.join(", "));
}

function installApiCors() {
    const allowedOrigins = configuredOrigins();
    const originalCreateServer = http.createServer;

    http.createServer = function createCorsAwareServer(options, requestListener) {
        let serverOptions = options;
        let listener = requestListener;

        if (typeof options === "function") {
            listener = options;
            serverOptions = undefined;
        }

        const wrappedListener = typeof listener === "function"
            ? function handleRequest(request, response) {
                const requestPath = cleanText(request.url).split("?")[0];
                const isApiRequest = requestPath === "/api" || requestPath.startsWith("/api/");
                const origin = cleanText(request.headers.origin);

                if (isApiRequest && origin) {
                    const allowed = allowedOrigins.has(origin) || origin === requestSameOrigin(request);
                    appendVary(response, "Origin");

                    if (!allowed) {
                        response.statusCode = 403;
                        response.setHeader("Content-Type", "application/json; charset=utf-8");
                        response.end(JSON.stringify({ error: "Origin is not allowed." }));
                        return;
                    }

                    response.setHeader("Access-Control-Allow-Origin", origin);
                    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
                    response.setHeader("Access-Control-Max-Age", "600");

                    if (request.method === "OPTIONS") {
                        response.statusCode = 204;
                        response.end();
                        return;
                    }
                }

                if (handleM4DeliveryRequest(request, response)) return;
                listener(request, response);
            }
            : listener;

        if (serverOptions === undefined) {
            return originalCreateServer.call(this, wrappedListener);
        }
        return originalCreateServer.call(this, serverOptions, wrappedListener);
    };
}

installApiCors();
require("./server");
