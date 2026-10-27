import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface ConsultationEmailData {
  seekerEmail: string;
  seekerName: string;
  serviceTitle: string;
  astrologerName: string;
  scheduledDate: string;
  scheduledTime: string;
  meetLink: string;
  price: string | number;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY is not defined in environment. Email sending will be logged to console.');
    }
  }

  async sendConsultationConfirmation(data: ConsultationEmailData): Promise<boolean> {
    const from = process.env.EMAIL_FROM || 'AstroVD <onboarding@resend.dev>';
    const formattedPrice = typeof data.price === 'number' && data.price === 0 ? '100% Free' : `₹${data.price}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your AstroVD Consultation Confirmation</title>
</head>
<body style="font-family: 'Georgia', serif; background-color: #FAF7F2; margin: 0; padding: 24px; color: #2A1810;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E6D5BC; box-shadow: 0 10px 25px rgba(91,13,21,0.08);">
    <!-- Header Accent -->
    <tr>
      <td style="background: linear-gradient(135deg, #5B0D15 0%, #7B121C 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #F8E7C9; margin: 0 0 6px 0; font-size: 24px; letter-spacing: 1px;">AstroVD</h1>
        <p style="color: #FAF7F2; margin: 0; font-size: 13px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 2px;">Sacred Vedic Consultation Confirmed</p>
      </td>
    </tr>
    <!-- Body Content -->
    <tr>
      <td style="padding: 32px 28px;">
        <h2 style="font-size: 20px; color: #5B0D15; margin-top: 0;">Namaste, ${data.seekerName || 'Devotee'} 🙏</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #524741; font-family: sans-serif;">
          Your 1-on-1 sacred astrological consultation with <strong>${data.astrologerName}</strong> has been successfully scheduled. Below are your divine appointment details:
        </p>

        <!-- Session Pass Box -->
        <table width="100%" border="0" cellspacing="0" cellpadding="10" style="background: #FDFBF7; border: 1px solid #F1E5D1; border-radius: 12px; margin: 20px 0; font-family: sans-serif; font-size: 13px;">
          <tr>
            <td style="color: #7D6B62; width: 35%;">Service:</td>
            <td style="font-weight: bold; color: #5B0D15;">${data.serviceTitle}</td>
          </tr>
          <tr>
            <td style="color: #7D6B62;">Date:</td>
            <td style="font-weight: bold; color: #2A1810;">${data.scheduledDate}</td>
          </tr>
          <tr>
            <td style="color: #7D6B62;">Time:</td>
            <td style="font-weight: bold; color: #2A1810;">${data.scheduledTime} IST (30 Mins)</td>
          </tr>
          <tr>
            <td style="color: #7D6B62;">Dakshina:</td>
            <td style="font-weight: bold; color: #15803D;">${formattedPrice}</td>
          </tr>
          <tr>
            <td style="color: #7D6B62;">Time Extension:</td>
            <td style="font-weight: bold; color: #B45309;">₹50 / Minute</td>
          </tr>
        </table>

        <!-- Direct Meeting Link CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.meetLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #15803D 0%, #166534 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: bold; font-size: 14px; font-family: sans-serif; box-shadow: 0 4px 14px rgba(22,101,52,0.3);">
            🎥 Join Google Meet Consultation
          </a>
          <p style="font-size: 11px; color: #8C7E77; margin-top: 10px; font-family: sans-serif;">
            Or copy this private link to your browser: <br>
            <a href="${data.meetLink}" style="color: #5B0D15; word-break: break-all;">${data.meetLink}</a>
          </p>
        </div>

        <div style="background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #92400E; font-family: sans-serif; line-height: 1.5;">
          <strong>⏱️ Time Extension Policy:</strong> Your session is scheduled for 30 minutes. If you require additional guidance or detailed chart analysis with Guruji, live session extensions are charged at <strong>₹50/minute</strong>.
        </div>

        <p style="font-size: 13px; color: #524741; margin-top: 24px; font-family: sans-serif;">
          You can also join or review this session directly in your <a href="http://localhost:3000/dashboard?tab=consultations" style="color: #5B0D15; font-weight: bold;">My Consultations</a> dashboard at any time.
        </p>

        <p style="font-size: 13px; color: #5B0D15; margin-top: 20px; font-weight: bold;">
          Har Har Mahadev,<br>
          Dr. Pandit Vishal Dubey & The AstroVD Team
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      if (this.resend) {
        const result = await this.resend.emails.send({
          from,
          to: data.seekerEmail,
          subject: `Confirmed: Consultation with ${data.astrologerName} - AstroVD`,
          html: htmlContent,
        });
        this.logger.log(`Consultation confirmation email sent to ${data.seekerEmail}. Resend ID: ${result.data?.id}`);
        return true;
      } else {
        this.logger.log(`[SIMULATED EMAIL] To: ${data.seekerEmail} | Subject: Confirmed: Consultation with ${data.astrologerName} | Meet Link: ${data.meetLink}`);
        return true;
      }
    } catch (error: any) {
      this.logger.error(`Failed to send consultation email to ${data.seekerEmail}: ${error.message}`);
      return false;
    }
  }
}
