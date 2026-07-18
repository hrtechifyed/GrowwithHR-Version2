"use strict";

require("dotenv").config();

const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const MAX_PDF_BYTES = 8 * 1024 * 1024;

/*
 * Render and similar services place the Express application
 * behind a reverse proxy.
 */
app.set("trust proxy", 1);
app.disable("x-powered-by");

function cleanText(value, fallback = "") {
    if (value === null || value === undefined) {
        return fallback;
    }

    return String(value).trim() || fallback;
}

function cleanAppPassword(value) {
    return cleanText(value).replace(/\s/g, "");
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanText(value)
    );
}

function escapeHtml(value) {
    return cleanText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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

function createPdfAttachment(pdf = {}) {
    const rawBase64 = cleanText(
        pdf.base64 ||
        pdf.dataUri ||
        pdf.data
    )
        .replace(
            /^data:application\/pdf;base64,/i,
            ""
        )
        .replace(/\s/g, "");

    if (!rawBase64) {
        throw new Error(
            "The PDF attachment is missing."
        );
    }

    if (!/^[a-zA-Z0-9+/=]+$/.test(rawBase64)) {
        throw new Error(
            "The PDF attachment contains invalid data."
        );
    }

    const content = Buffer.from(
        rawBase64,
        "base64"
    );

    if (!content.length) {
        throw new Error(
            "The PDF attachment is empty."
        );
    }

    if (content.length > MAX_PDF_BYTES) {
        throw new Error(
            "The PDF attachment is larger than 8 MB."
        );
    }

    const header = content
        .subarray(0, 5)
        .toString("ascii");

    if (header !== "%PDF-") {
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

function createCustomerEmail({
    lead = {},
    report = {}
}) {
    const recipientName = cleanText(
        lead.name,
        "there"
    );

    const companyName = cleanText(
        report.companyName ||
        lead.companyName,
        "your organisation"
    );

    const subject =
        `Your GrowWithHR advisory for ${companyName}`;

    const text = [
        `Hello ${recipientName},`,
        "",
        `Your GrowWithHR Executive Advisory for ${companyName} is attached as a PDF.`,
        "",
        "This advisory was prepared using the information supplied during the assessment.",
        "",
        "Regards,",
        "GrowWithHR / HRTechify"
    ].join("\n");

    const html = `
        <!DOCTYPE html>
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
                margin: 0;
                padding: 0;
                background: #f3f4f6;
                color: #1f2937;
                font-family: Arial, Helvetica, sans-serif;
            "
        >
            <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
            >
                <tr>
                    <td
                        align="center"
                        style="padding: 32px 16px;"
                    >
                        <table
                            role="presentation"
                            width="100%"
                            cellspacing="0"
                            cellpadding="0"
                            border="0"
                            style="
                                max-width: 620px;
                                background: #ffffff;
                                border-radius: 12px;
                                overflow: hidden;
                            "
                        >
                            <tr>
                                <td
                                    style="
                                        padding: 24px 28px;
                                        background: #111827;
                                        color: #ffffff;
                                    "
                                >
                                    <h1
                                        style="
                                            margin: 0;
                                            font-size: 24px;
                                        "
                                    >
                                        GrowWithHR
                                    </h1>

                                    <p
                                        style="
                                            margin: 8px 0 0;
                                            color: #d1d5db;
                                        "
                                    >
                                        Executive Advisory
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td
                                    style="
                                        padding: 30px 28px;
                                        font-size: 16px;
                                        line-height: 1.7;
                                    "
                                >
                                    <p>
                                        Hello
                                        ${escapeHtml(recipientName)},
                                    </p>

                                    <p>
                                        Your GrowWithHR Executive
                                        Advisory for
                                        <strong>
                                            ${escapeHtml(companyName)}
                                        </strong>
                                        is attached to this email
                                        as a PDF.
                                    </p>

                                    <p>
                                        This advisory was prepared
                                        using the information supplied
                                        during the assessment.
                                    </p>

                                    <p style="margin-top: 28px;">
                                        Regards,<br>
                                        <strong>
                                            GrowWithHR / HRTechify
                                        </strong>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

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
        report.companyName ||
        lead.companyName,
        "Not provided"
    );

    const priorities =
        listText(
            report.priorities ||
            lead.priorities ||
            answers.priorities
        ) ||
        "Not provided";

    const subject =
        `New GrowWithHR advisory lead: ${companyName}`;

    const text = [
        "A new GrowWithHR advisory assessment was completed.",
        "",
        `Name: ${cleanText(lead.name, "Not provided")}`,
        `Email: ${cleanText(lead.email, "Not provided")}`,
        `Company: ${companyName}`,
        `Role: ${cleanText(
            lead.role ||
            report.recipientRole,
            "Not provided"
        )}`,
        `Industry: ${cleanText(
            report.industry ||
            lead.industry,
            "Not provided"
        )}`,
        `Employees: ${cleanText(
            report.employees ||
            lead.employees,
            "Not provided"
        )}`,
        `Hiring plans: ${cleanText(
            report.hiringPlans ||
            answers.hiringPlans,
            "Not provided"
        )}`,
        `Priorities: ${priorities}`,
        "",
        `Submitted: ${new Date().toISOString()}`
    ].join("\n");

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(subject)}</title>
        </head>

        <body
            style="
                margin: 0;
                padding: 24px;
                color: #1f2937;
                font-family: Arial, Helvetica, sans-serif;
            "
        >
            <h2>
                New GrowWithHR advisory assessment
            </h2>

            <table
                cellspacing="0"
                cellpadding="8"
                border="1"
                style="
                    border-collapse: collapse;
                    border-color: #d1d5db;
                "
            >
                <tr>
                    <th align="left">Name</th>
                    <td>
                        ${escapeHtml(
                            cleanText(
                                lead.name,
                                "Not provided"
                            )
                        )}
                    </td>
                </tr>

                <tr>
                    <th align="left">Email</th>
                    <td>
                        ${escapeHtml(
                            cleanText(
                                lead.email,
                                "Not provided"
                            )
                        )}
                    </td>
                </tr>

                <tr>
                    <th align="left">Company</th>
                    <td>
                        ${escapeHtml(companyName)}
                    </td>
                </tr>

                <tr>
                    <th align="left">Role</th>
                    <td>
                        ${escapeHtml(
                            cleanText(
                                lead.role ||
                                report.recipientRole,
                                "Not provided"
                            )
                        )}
                    </td>
                </tr>

                <tr>
                    <th align="left">Industry</th>
                    <td>
                        ${escapeHtml(
                            cleanText(
                                report.industry ||
                                lead.industry,
                                "Not provided"
                            )
                        )}
                    </td>
                </tr>

                <tr>
                    <th align="left">Employees</th>
                    <td>
                        ${escapeHtml(
                            cleanText(
                                report.employees ||
                                lead.employees,
                                "Not provided"
                            )
                        )}
                    </td>
                </tr>

                <tr>
                    <th align="left">Hiring plans</th>
                    <td>
                        ${escapeHtml(
                            cleanText(
                                report.hiringPlans ||
                                answers.hiringPlans,
                                "Not provided"
                            )
                        )}
                    </td>
                </tr>

                <tr>
                    <th align="left">Priorities</th>
                    <td>
                        ${escapeHtml(priorities)}
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    return {
        subject,
        text,
        html
    };
}

const requiredEnvironmentVariables = [
    "GMAIL_USER",
    "GMAIL_APP_PASSWORD"
];

function getMissingEnvironmentVariables() {
    return requiredEnvironmentVariables.filter(
        (name) => !cleanText(process.env[name])
    );
}

const gmailTransporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: cleanText(
            process.env.GMAIL_USER
        ),

        pass: cleanAppPassword(
            process.env.GMAIL_APP_PASSWORD
        )
    }
});

app.use(
    express.json({
        limit: "12mb"
    })
);

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

app.get(
    "/api/health",
    (request, response) => {
        const missing =
            getMissingEnvironmentVariables();

        response.json({
            ok: true,

            version:
                "gmail-render-v2",

            gmailConfigured:
                missing.length === 0,

            missingVariables:
                missing,

            deployedCommit:
                process.env.RENDER_GIT_COMMIT ||
                "unknown"
        });
    }
);

app.post(
    "/api/send-advisory",
    emailLimiter,
    async (request, response) => {
        try {
            const missing =
                getMissingEnvironmentVariables();

            if (missing.length > 0) {
                return response
                    .status(503)
                    .json({
                        error:
                            "Gmail is not configured on the server."
                    });
            }

            const action = cleanText(
                request.body?.action,
                "capture"
            );

            const permittedActions = [
                "capture",
                "resend-customer"
            ];

            if (!permittedActions.includes(action)) {
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

            const recipient = cleanText(
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

            const customerResult =
                await gmailTransporter.sendMail({
                    from:
                        `"GrowWithHR" <${process.env.GMAIL_USER}>`,

                    to: recipient,

                    replyTo:
                        cleanText(
                            process.env.REPLY_TO_EMAIL,
                            process.env.GMAIL_USER
                        ),

                    subject:
                        customerEmail.subject,

                    text:
                        customerEmail.text,

                    html:
                        customerEmail.html,

                    attachments: [
                        attachment
                    ]
                });

            let internalStatus =
                "not-configured";

            let internalMessageId = "";

            const internalRecipient =
                cleanText(
                    process.env
                        .INTERNAL_NOTIFICATION_EMAIL
                );

            if (
                action !== "resend-customer" &&
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
                            await gmailTransporter
                                .sendMail({
                                    from:
                                        `"GrowWithHR" <${process.env.GMAIL_USER}>`,

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
                                });

                        internalStatus = "sent";

                        internalMessageId =
                            internalResult.messageId ||
                            "";
                    } catch (internalError) {
                        internalStatus = "failed";

                        console.error(
                            "Internal notification failed:",
                            internalError
                        );
                    }
                }
            }

            return response.json({
                ok: true,
                mode: "gmail",

                customerStatus: "sent",
                customerSent: true,

                customerMessageId:
                    customerResult.messageId ||
                    "",

                internalStatus,

                internalSent:
                    internalStatus === "sent",

                internalMessageId,

                attachmentFilename:
                    attachment.filename,

                sentAt:
                    new Date().toISOString()
            });
        } catch (error) {
            console.error(
                "Gmail delivery failed:",
                error
            );

            return response
                .status(502)
                .json({
                    error:
                        error.message ||
                        "The advisory email could not be sent."
                });
        }
    }
);

/*
 * Block access to server-side and secret files.
 */
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
                    request.path === blockedPath ||
                    request.path.startsWith(
                        `${blockedPath}/`
                    )
            );

        const environmentFile =
            request.path === "/.env" ||
            request.path.startsWith("/.env.");

        if (blocked || environmentFile) {
            return response.sendStatus(404);
        }

        return next();
    }
);

/*
 * Serve the existing HTML, CSS and JavaScript files.
 */
app.use(
    express.static(
        path.join(__dirname),
        {
            dotfiles: "ignore"
        }
    )
);

app.use(
    (request, response) => {
        response
            .status(404)
            .json({
                error: "Resource not found."
            });
    }
);

app.listen(
    PORT,
    () => {
        console.log(
            `GrowWithHR server running on port ${PORT}`
        );
    }
);
