const response = await window.fetch("/api/send-advisory", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify({
        action,
        lead: payload.lead || {},
        report: payload.report || {},
        answers: payload.answers || {},
        pdf: {
            base64: payload.pdf.base64,
            filename: payload.pdf.filename,
            sizeBytes: payload.pdf.sizeBytes
        }
    })
});

await transporter.sendMail({
    from: `GrowWithHR <${process.env.GMAIL_USER}>`,
    to: recipient,
    replyTo: process.env.REPLY_TO_EMAIL || process.env.GMAIL_USER,
    subject: customerContent.subject,
    text: customerContent.text,
    html: customerContent.html,
    attachments: [
        {
            filename: attachment.filename,
            content: attachment.content,
            contentType: "application/pdf"
        }
    ]
});

app.post("/api/send-advisory", emailLimiter, async (request, response) => {
    // Validate recipient
    // Validate PDF
    // Send through Gmail
});
