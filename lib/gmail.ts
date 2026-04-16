import { google } from 'googleapis';
import { EmailData } from '@/types';

export async function sendEmail(
  accessToken: string,
  emailData: EmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const message = createEmailMessage(emailData);
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      success: true,
      messageId: response.data.id,
    };
  } catch (error: any) {
    console.error('Gmail send error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

function createEmailMessage(emailData: EmailData): string {
  const boundary = '----=_Part_0_' + Date.now();
  
  let message = [
    'MIME-Version: 1.0',
    `To: ${emailData.to}`,
    `Subject: ${emailData.subject}`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    emailData.body,
  ];

  if (emailData.resumeAttachment) {
    message.push(
      '',
      `--${boundary}`,
      `Content-Type: ${emailData.resumeAttachment.mimeType}; name="${emailData.resumeAttachment.filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${emailData.resumeAttachment.filename}"`,
      '',
      emailData.resumeAttachment.content
    );
  }

  message.push('', `--${boundary}--`);

  return message.join('\r\n');
}
