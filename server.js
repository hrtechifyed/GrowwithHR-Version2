const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: String(process.env.GMAIL_APP_PASSWORD || "").replace(/\s/g, "")
    }
});
