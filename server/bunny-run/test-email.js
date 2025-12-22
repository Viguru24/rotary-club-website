import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
    console.log('📧 Sending test email...');

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
        console.error('❌ RESEND_API_KEY is not set in .env');
        return;
    }

    try {
        const result = await resend.emails.send({
            from: `${process.env.FROM_NAME || 'Rotary Caterham'} <${process.env.FROM_EMAIL}>`,
            to: process.env.TEST_RECEIVER || 'recipient@example.com',
            subject: '✅ Rotary Notification System - Test Email',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                        .success-box { background: #48bb78; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Test Email Successful!</h1>
                        </div>
                        <div class="content">
                            <div class="success-box">
                                <h2 style="margin: 0;">✅ Your notification system is working!</h2>
                            </div>
                            
                            <p>Congratulations! If you're reading this, it means:</p>
                            
                            <ul>
                                <li>✅ Resend API is configured correctly</li>
                                <li>✅ Your domain is verified</li>
                                <li>✅ Email delivery is working</li>
                                <li>✅ The notification system is ready to use</li>
                            </ul>
                            
                            <p><strong>Next steps:</strong></p>
                            <ol>
                                <li>Sync your roster data from the admin panel</li>
                                <li>Set up the cron job to run daily at 6 AM</li>
                                <li>Monitor the logs to ensure everything works smoothly</li>
                            </ol>
                            
                            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 0.9em;">
                                This is a test email from the Rotary Club of Caterham Notification System<br>
                                Sent at: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log('Email ID:', result.data?.id || result.id);
        console.log('\nCheck your inbox (and spam folder) for the test email.');

    } catch (error) {
        console.error('❌ Failed to send test email:', error.message);

        if (error.message.includes('API key')) {
            console.log('\n💡 Tip: Check that RESEND_API_KEY is set correctly in .env');
        } else if (error.message.includes('domain')) {
            console.log('\n💡 Tip: Make sure your domain is verified in Resend dashboard');
        }
    }
}

sendTestEmail();

