"use strict";

require("dotenv").config();

const crypto = require("crypto");
const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");
const { google } = require("googleapis");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MAX_PDF_BYTES = 8 * 1024 * 1024;
const FOUNDER_NAME = "Anurag Sinha";
const FOUNDER_LINKEDIN_URL =
    "https://www.linkedin.com/in/anuragsinha1009/";
const SIGNATURE_FONT_STACK =
    "Inter, 'Segoe UI', Arial, Helvetica, sans-serif";
const SIGNATURE_FONT_SIZE = "16px";

app.set("trust proxy", 1);
app.disable("x-powered-by");

function cleanText(value, fallback = "") {
    if (value === null || value === undefined) return fallback;
    return String(value).trim() || fallback;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(value));
}

function escapeHtml(value) {
    return cleanText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function safeHeaderValue(value) {
    return cleanText(value).replace(/[\r\n]+/g, " ");
}

function encodeMimeHeader(value) {
    return `=?UTF-8?B?${Buffer.from(
        safeHeaderValue(value),
        "utf8"
    ).toString("base64")}?=`;
}

function safeFilename(value) {
    let filename = cleanText(
        value,
        "GrowWithHR-Advisory.pdf"
    )
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 120);

    if (!filename.toLowerCase().endsWith(".pdf")) {
        filename += ".pdf";
    }

    return filename;
}

function listText(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => cleanText(item))
            .filter(Boolean)
            .join(", ");
    }

    return cleanText(value);
}

function wrapBase64(value) {
    return String(value).match(/.{1,76}/g)?.join("\r\n") || "";
}

function encodeBase64Url(value) {
    return Buffer.from(value, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function createPdfAttachment(pdf = {}) {
    const rawBase64 = cleanText(
        pdf.base64 || pdf.dataUri || pdf.data
    )
        .replace(/^data:application\/pdf;base64,/i, "")
        .replace(/\s/g, "");

    if (!rawBase64) {
        throw new Error("The PDF attachment is missing.");
    }

    if (!/^[a-zA-Z0-9+/=]+$/.test(rawBase64)) {
        throw new Error(
            "The PDF attachment contains invalid data."
        );
    }

    const content = Buffer.from(rawBase64, "base64");

    if (!content.length) {
        throw new Error("The PDF attachment is empty.");
    }

    if (content.length > MAX_PDF_BYTES) {
        throw new Error(
            "The PDF attachment is larger than 8 MB."
        );
    }

    if (
        content.subarray(0, 5).toString("ascii") !==
        "%PDF-"
    ) {
        throw new Error(
            "The attachment is not a valid PDF document."
        );
    }

    return {
        filename: safeFilename(pdf.filename),
        content,
        contentType: "application/pdf"
    };
}

function buildRawEmail({
    from,
    to,
    replyTo,
    subject,
    text,
    html,
    attachments = []
}) {
    const mixedBoundary =
        `mixed_${crypto.randomUUID()}`;
    const alternativeBoundary =
        `alternative_${crypto.randomUUID()}`;

    const lines = [
        `From: ${safeHeaderValue(from)}`,
        `To: ${safeHeaderValue(to)}`,
        ...(replyTo
            ? [`Reply-To: ${safeHeaderValue(replyTo)}`]
            : []),
        `Subject: ${encodeMimeHeader(subject)}`,
        `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
        "",
        `--${mixedBoundary}`,
        `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
        "",
        `--${alternativeBoundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        wrapBase64(
            Buffer.from(
                cleanText(text),
                "utf8"
            ).toString("base64")
        ),
        "",
        `--${alternativeBoundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        wrapBase64(
            Buffer.from(
                cleanText(html),
                "utf8"
            ).toString("base64")
        ),
        "",
        `--${alternativeBoundary}--`,
        ""
    ];

    for (const attachment of attachments) {
        const filename = safeFilename(
            attachment.filename
        );
        const content = Buffer.isBuffer(
            attachment.content
        )
            ? attachment.content
            : Buffer.from(attachment.content);

        lines.push(
            `--${mixedBoundary}`,
            `Content-Type: ${safeHeaderValue(
                attachment.contentType ||
                    "application/octet-stream"
            )}; name="${filename}"`,
            `Content-Disposition: attachment; filename="${filename}"`,
            "Content-Transfer-Encoding: base64",
            "",
            wrapBase64(content.toString("base64")),
            ""
        );
    }

    lines.push(`--${mixedBoundary}--`, "");
    return encodeBase64Url(lines.join("\r\n"));
}

function createCustomerEmail({
    lead = {},
    report = {}
}) {
    const recipientName = cleanText(
        lead.name,
        "there"
    );
    const companyName = cleanText(
        report.companyName || lead.companyName,
        "your organisation"
    );
    const logoUrl =
        "https://growwithhr.onrender.com/assets/hrtechify-logo.png";
    const subject =
        `Your GrowWithHR Executive Advisory for ${companyName}`;

    const text = [
        `Hello ${recipientName},`,
        "",
        "Thank you for completing the GrowWithHR Executive Advisory assessment.",
        "",
        `Your personalised advisory report for ${companyName} is attached to this email as a PDF.`,
        "",
        "Inside your report, you will find:",
        "",
        "• A summary of your organisation's current priorities",
        "• Areas that may require leadership attention",
        "• Practical recommendations and next steps",
        "",
        "We recommend reviewing the report with the relevant members of your leadership team and identifying the actions that are most important for your current stage of growth.",
        "",
        "If you have questions or would like support turning the recommendations into a practical action plan, reply directly to this email.",
        "",
        "This advisory is provided for general strategic guidance. It does not replace legal, financial, compliance, or other professional advice.",
        "",
        "Warm Wishes,",
        FOUNDER_NAME,
        "Founder, HRTechify",
        FOUNDER_LINKEDIN_URL
    ].join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    >
    <title>${escapeHtml(subject)}</title>
</head>
<body
    style="
        margin:0;
        padding:0;
        background-color:#05070B;
        color:#0F172A;
        font-family:Inter,'Segoe UI',Arial,Helvetica,sans-serif;
    "
>
    <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="
            width:100%;
            background-color:#05070B;
            border-collapse:collapse;
        "
    >
        <tr>
            <td
                align="center"
                style="padding:36px 16px;"
            >
                <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="
                        width:100%;
                        max-width:680px;
                        background-color:#FFFFFF;
                        border-collapse:separate;
                        border-spacing:0;
                        border-radius:18px;
                        overflow:hidden;
                        box-shadow:0 24px 70px rgba(0,0,0,0.38);
                    "
                >
                    <tr>
                        <td
                            style="
                                height:7px;
                                padding:0;
                                background:#FF7A00 linear-gradient(
                                    90deg,
                                    #FFB000 0%,
                                    #FF7A00 55%,
                                    #FF4D00 100%
                                );
                                font-size:1px;
                                line-height:1px;
                            "
                        >&nbsp;</td>
                    </tr>
                    <tr>
                        <td
                            style="
                                padding:34px 38px 32px;
                                background-color:#0A1020;
                            "
                        >
                            <p
                                style="
                                    margin:0 0 10px;
                                    color:#FFB000;
                                    font-size:13px;
                                    line-height:1.4;
                                    font-weight:800;
                                    letter-spacing:0.16em;
                                    text-transform:uppercase;
                                "
                            >HRTechify</p>
                            <h1
                                style="
                                    margin:0;
                                    color:#FFFFFF;
                                    font-family:Fraunces,Georgia,'Times New Roman',serif;
                                    font-size:30px;
                                    line-height:1.25;
                                    font-weight:600;
                                    letter-spacing:-0.02em;
                                "
                            >
                                Your GrowWithHR Executive Advisory
                            </h1>
                            <p
                                style="
                                    margin:12px 0 0;
                                    color:#CBD5E1;
                                    font-size:15px;
                                    line-height:1.6;
                                "
                            >
                                Practical people, compliance and
                                growth guidance for
                                ${escapeHtml(companyName)}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td
                            style="
                                padding:38px;
                                background-color:#FFFFFF;
                            "
                        >
                            <p
                                style="
                                    margin:0 0 20px;
                                    color:#0F172A;
                                    font-size:16px;
                                    line-height:1.75;
                                "
                            >
                                Hello ${escapeHtml(recipientName)},
                            </p>
                            <p
                                style="
                                    margin:0 0 20px;
                                    color:#334155;
                                    font-size:16px;
                                    line-height:1.75;
                                "
                            >
                                Thank you for completing the
                                <strong style="color:#0F172A;">
                                    GrowWithHR Executive Advisory
                                </strong>
                                assessment.
                            </p>
                            <p
                                style="
                                    margin:0 0 24px;
                                    color:#334155;
                                    font-size:16px;
                                    line-height:1.75;
                                "
                            >
                                Your personalised advisory report
                                for
                                <strong style="color:#0F172A;">
                                    ${escapeHtml(companyName)}
                                </strong>
                                is attached to this email as a PDF.
                            </p>

                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                                style="
                                    width:100%;
                                    margin:0 0 28px;
                                    background-color:#FFF7ED;
                                    border:1px solid #FED7AA;
                                    border-left:5px solid #FF7A00;
                                    border-radius:12px;
                                "
                            >
                                <tr>
                                    <td style="padding:20px 22px;">
                                        <p
                                            style="
                                                margin:0 0 5px;
                                                color:#9A3412;
                                                font-size:13px;
                                                line-height:1.4;
                                                font-weight:800;
                                                letter-spacing:0.08em;
                                                text-transform:uppercase;
                                            "
                                        >PDF attached</p>
                                        <p
                                            style="
                                                margin:0;
                                                color:#431407;
                                                font-size:15px;
                                                line-height:1.6;
                                                font-weight:600;
                                            "
                                        >
                                            GrowWithHR Executive Advisory —
                                            ${escapeHtml(companyName)}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <h2
                                style="
                                    margin:0 0 14px;
                                    color:#0A1020;
                                    font-family:Fraunces,Georgia,'Times New Roman',serif;
                                    font-size:23px;
                                    line-height:1.35;
                                    font-weight:600;
                                "
                            >What you will find inside</h2>
                            <ul
                                style="
                                    margin:0 0 28px;
                                    padding-left:24px;
                                    color:#334155;
                                    font-size:16px;
                                    line-height:1.75;
                                "
                            >
                                <li>
                                    A summary of your organisation's
                                    current priorities
                                </li>
                                <li>
                                    Areas that may require leadership
                                    attention
                                </li>
                                <li>
                                    Practical recommendations and
                                    suggested next steps
                                </li>
                            </ul>

                            <p
                                style="
                                    margin:0 0 20px;
                                    color:#334155;
                                    font-size:16px;
                                    line-height:1.75;
                                "
                            >
                                We recommend reviewing the report
                                with the relevant members of your
                                leadership team and identifying the
                                actions that are most important for
                                your current stage of growth.
                            </p>

                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                                style="
                                    width:100%;
                                    margin:28px 0;
                                    background-color:#0A1020;
                                    border-radius:12px;
                                "
                            >
                                <tr>
                                    <td style="padding:22px 24px;">
                                        <p
                                            style="
                                                margin:0 0 6px;
                                                color:#FFB000;
                                                font-size:13px;
                                                line-height:1.4;
                                                font-weight:800;
                                                letter-spacing:0.08em;
                                                text-transform:uppercase;
                                            "
                                        >
                                            Need support or have suggestions?
                                        </p>
                                        <p
                                            style="
                                                margin:0;
                                                color:#F8FAFC;
                                                font-size:15px;
                                                line-height:1.7;
                                            "
                                        >
                                            Reply directly to this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                                style="
                                    width:100%;
                                    margin:24px 0 28px;
                                    background-color:#0A1020;
                                    border-top:2px solid #FF7A00;
                                    border-radius:8px;
                                "
                            >
                                <tr>
                                    <td
                                        align="center"
                                        style="
                                            padding:8px 12px;
                                            text-align:center;
                                        "
                                    >
                                        <img
                                            src="${logoUrl}"
                                            alt="HRTechify"
                                            width="88"
                                            style="
                                                display:block;
                                                width:88px;
                                                max-width:88px;
                                                height:auto;
                                                margin:0 auto;
                                                border:0;
                                                outline:none;
                                                text-decoration:none;
                                            "
                                        >
                                        <p
                                            style="
                                                margin:5px 0 0;
                                                color:#FFB000;
                                                font-size:10px;
                                                line-height:1.3;
                                                font-weight:700;
                                                letter-spacing:0.08em;
                                                text-align:center;
                                                text-transform:uppercase;
                                            "
                                        >
                                            People • Technology • Growth
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p
                                style="
                                    margin:0 0 28px;
                                    color:#64748B;
                                    font-size:12px;
                                    line-height:1.65;
                                    text-align:center;
                                "
                            >
                                This advisory is provided for general
                                strategic guidance and does not
                                replace legal, financial, compliance
                                or other professional advice.
                            </p>

                            <div
                                data-email-signature="founder"
                                style="
                                    margin:30px 0 0;
                                    color:#334155;
                                    font-family:${SIGNATURE_FONT_STACK};
                                    font-size:${SIGNATURE_FONT_SIZE};
                                    line-height:1.75;
                                "
                            >
                                <p style="margin:0;">Warm Wishes,</p>
                                <p style="margin:4px 0 0;">
                                    <strong
                                        style="
                                            color:#0F172A;
                                            font:inherit;
                                            font-weight:800;
                                        "
                                    >${escapeHtml(FOUNDER_NAME)}</strong>
                                </p>
                                <p style="margin:0;">
                                    Founder, HRTechify
                                </p>
                                <p style="margin:0;">
                                    <a
                                        href="${FOUNDER_LINKEDIN_URL}"
                                        style="
                                            color:#0563C1;
                                            font:inherit;
                                            text-decoration:underline;
                                        "
                                    >${FOUNDER_LINKEDIN_URL}</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return {
        subject,
        text,
        html
    };
}

function createInternalEmail({
    lead = {},
    report = {},
    answers = {}
}) {
    const companyName = cleanText(
        report.companyName || lead.companyName,
        "Not provided"
    );
    const priorities =
        listText(
            report.priorities ||
                lead.priorities ||
                answers.priorities
        ) || "Not provided";

    const fields = {
        Name: cleanText(lead.name, "Not provided"),
        Email: cleanText(lead.email, "Not provided"),
        Company: companyName,
        Role: cleanText(
            lead.role || report.recipientRole,
            "Not provided"
        ),
        Industry: cleanText(
            report.industry || lead.industry,
            "Not provided"
        ),
        Employees: cleanText(
            report.employees || lead.employees,
            "Not provided"
        ),
        "Hiring plans": cleanText(
            report.hiringPlans || answers.hiringPlans,
            "Not provided"
        ),
        Priorities: priorities,
        Submitted: new Date().toISOString()
    };

    const subject =
        `New GrowWithHR advisory lead: ${companyName}`;
    const text = [
        "A new GrowWithHR advisory assessment was completed.",
        "",
        ...Object.entries(fields).map(
            ([key, value]) => `${key}: ${value}`
        )
    ].join("\n");
    const rows = Object.entries(fields)
        .map(
            ([key, value]) =>
                `<tr><th align="left" style="padding:8px">${escapeHtml(
                    key
                )}</th><td style="padding:8px">${escapeHtml(
                    value
                )}</td></tr>`
        )
        .join("");
    const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;font-family:Arial,sans-serif;color:#1f2937">
<h2>New GrowWithHR advisory assessment</h2>
<table cellspacing="0" cellpadding="0" border="1" style="border-collapse:collapse;border-color:#d1d5db">${rows}</table>
</body>
</html>`;

    return {
        subject,
        text,
        html
    };
}

const requiredEnvironmentVariables = [
    "GMAIL_USER",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REFRESH_TOKEN"
];

function getMissingEnvironmentVariables() {
    return requiredEnvironmentVariables.filter(
        (name) => !cleanText(process.env[name])
    );
}

const oauth2Client = new google.auth.OAuth2(
    cleanText(process.env.GOOGLE_CLIENT_ID),
    cleanText(process.env.GOOGLE_CLIENT_SECRET)
);

oauth2Client.setCredentials({
    refresh_token: cleanText(
        process.env.GOOGLE_REFRESH_TOKEN
    )
});

const gmailApi = google.gmail({
    version: "v1",
    auth: oauth2Client
});

async function sendGmailApiMessage(message) {
    const raw = buildRawEmail(message);
    const result =
        await gmailApi.users.messages.send({
            userId: "me",
            requestBody: {
                raw
            }
        });

    return result.data;
}

app.use(express.json({
    limit: "12mb"
}));

const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error:
            "Too many email requests. Please try again later."
    }
});

app.get("/api/health", (request, response) => {
    const missing =
        getMissingEnvironmentVariables();

    response.json({
        ok: true,
        version: "gmail-api-v1",
        provider: "gmail-api",
        gmailConfigured:
            missing.length === 0,
        missingVariables: missing,
        deployedCommit:
            process.env.RENDER_GIT_COMMIT ||
            "unknown"
    });
});

app.post(
    "/api/send-advisory",
    emailLimiter,
    async (request, response) => {
        try {
            console.log(
                "Received /api/send-advisory request",
                {
                    action:
                        request.body?.action,
                    recipient:
                        request.body?.lead
                            ?.email ||
                        request.body?.report
                            ?.recipientEmail,
                    hasPdf: Boolean(
                        request.body?.pdf
                            ?.base64 ||
                        request.body?.pdf
                            ?.dataUri
                    )
                }
            );

            const missing =
                getMissingEnvironmentVariables();

            if (missing.length) {
                return response
                    .status(503)
                    .json({
                        error:
                            "Gmail API is not configured on the server.",
                        missingVariables:
                            missing
                    });
            }

            const sender = cleanText(
                process.env.GMAIL_USER
            ).toLowerCase();

            if (!isValidEmail(sender)) {
                return response
                    .status(503)
                    .json({
                        error:
                            "GMAIL_USER is not a valid email address."
                    });
            }

            const action = cleanText(
                request.body?.action,
                "capture"
            );

            if (
                ![
                    "capture",
                    "resend-customer"
                ].includes(action)
            ) {
                return response
                    .status(400)
                    .json({
                        error:
                            "The requested email action is invalid."
                    });
            }

            const lead =
                request.body?.lead || {};
            const report =
                request.body?.report || {};
            const answers =
                request.body?.answers || {};
            const recipient =
                cleanText(
                    lead.email ||
                        report.recipientEmail
                ).toLowerCase();

            if (!isValidEmail(recipient)) {
                return response
                    .status(400)
                    .json({
                        error:
                            "A valid recipient email address is required."
                    });
            }

            const attachment =
                createPdfAttachment(
                    request.body?.pdf
                );
            const customerEmail =
                createCustomerEmail({
                    lead,
                    report
                });

            console.log(
                "Attempting Gmail API delivery to:",
                recipient
            );

            const customerResult =
                await sendGmailApiMessage({
                    from:
                        `"GrowWithHR" <${sender}>`,
                    to: recipient,
                    replyTo: cleanText(
                        process.env
                            .REPLY_TO_EMAIL,
                        sender
                    ),
                    subject:
                        customerEmail.subject,
                    text: customerEmail.text,
                    html: customerEmail.html,
                    attachments: [
                        attachment
                    ]
                });

            console.log(
                "Customer Gmail API delivery successful:",
                customerResult.id
            );

            let internalStatus =
                "not-configured";
            let internalMessageId = "";
            const internalRecipient =
                cleanText(
                    process.env
                        .INTERNAL_NOTIFICATION_EMAIL
                );

            if (
                action !==
                    "resend-customer" &&
                internalRecipient
            ) {
                if (
                    !isValidEmail(
                        internalRecipient
                    )
                ) {
                    internalStatus =
                        "invalid-address";
                } else {
                    const internalEmail =
                        createInternalEmail({
                            lead,
                            report,
                            answers
                        });

                    try {
                        const internalResult =
                            await sendGmailApiMessage(
                                {
                                    from:
                                        `"GrowWithHR" <${sender}>`,
                                    to:
                                        internalRecipient,
                                    replyTo:
                                        recipient,
                                    subject:
                                        internalEmail
                                            .subject,
                                    text:
                                        internalEmail
                                            .text,
                                    html:
                                        internalEmail
                                            .html
                                }
                            );

                        internalStatus =
                            "sent";
                        internalMessageId =
                            internalResult.id ||
                            "";
                    } catch (
                        internalError
                    ) {
                        internalStatus =
                            "failed";
                        console.error(
                            "Internal Gmail API notification failed:",
                            internalError
                                ?.response
                                ?.data ||
                                internalError
                        );
                    }
                }
            }

            return response.json({
                ok: true,
                mode: "gmail-api",
                customerStatus: "sent",
                customerSent: true,
                customerMessageId:
                    customerResult.id ||
                    "",
                internalStatus,
                internalSent:
                    internalStatus ===
                    "sent",
                internalMessageId,
                attachmentFilename:
                    attachment.filename,
                sentAt:
                    new Date().toISOString()
            });
        } catch (error) {
            const apiError =
                error?.response?.data
                    ?.error ||
                error?.errors?.[0];

            console.error(
                "Gmail API delivery failed:",
                apiError || error
            );

            return response
                .status(502)
                .json({
                    error:
                        apiError?.message ||
                        error.message ||
                        "The advisory email could not be sent."
                });
        }
    }
);

app.use(
    (request, response, next) => {
        const blockedPaths = [
            "/server.js",
            "/package.json",
            "/package-lock.json",
            "/node_modules"
        ];
        const blocked =
            blockedPaths.some(
                (blockedPath) =>
                    request.path ===
                        blockedPath ||
                    request.path.startsWith(
                        `${blockedPath}/`
                    )
            );
        const environmentFile =
            request.path === "/.env" ||
            request.path.startsWith(
                "/.env."
            );

        if (
            blocked ||
            environmentFile
        ) {
            return response.sendStatus(
                404
            );
        }

        return next();
    }
);

app.use(
    express.static(
        path.join(__dirname),
        {
            dotfiles: "ignore"
        }
    )
);

app.use((request, response) => {
    response.status(404).json({
        error: "Resource not found."
    });
});

app.listen(PORT, () => {
    console.log(
        `GrowWithHR server running on port ${PORT}`
    );
});
