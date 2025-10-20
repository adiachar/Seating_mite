import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = (to, subject, text, html = null) => {
    //cannot send mail without verified domain
    return;

    resend.emails.send({
        from: 'onboarding@resend.dev',
        to: to,
        subject: subject,
        html: html || `<p>${text}</p><p>Thank you,</p><p>MITE Seating App Team</p>`
    }).catch(err => console.log(err));
}

