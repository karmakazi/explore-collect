import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';

const app = express();
const PORT = process.env.PORT || 3001;

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/inquiry', async (req, res) => {
    const { firstName, lastName, email, organization, orgType, message } = req.body;

    if (!firstName || !lastName || !email || !organization || !orgType) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const orgTypeLabels = {
        municipality: 'Municipality / City',
        bia: 'Business Improvement Area (BIA)',
        tourism: 'Tourism Board',
        retail: 'Retail / Shopping Centre',
        event: 'Event / Festival Organizer',
        other: 'Other',
    };

    const htmlBody = `
        <h2>New Inquiry from Explore &amp; Collect</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
            <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Name</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;">${firstName} ${lastName}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Email</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Organization</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;">${organization}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Type</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;">${orgTypeLabels[orgType] || orgType}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Message</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;">${message || '(none)'}</td></tr>
        </table>
    `;

    try {
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Explore & Collect <onboarding@resend.dev>',
            to: [process.env.INQUIRY_TO_EMAIL || 'delivered@resend.dev'],
            subject: `New Inquiry: ${organization} (${orgTypeLabels[orgType] || orgType})`,
            html: htmlBody,
            replyTo: email,
        });

        return res.json({ success: true });
    } catch (err) {
        console.error('Resend error:', err);
        return res.status(500).json({ error: 'Failed to send email. Please try again.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
