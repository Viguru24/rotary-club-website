import 'dotenv/config';
import { Resend } from 'resend';
import pkg from 'pg';
const { Pool } = pkg;
import moment from 'moment-timezone';

const resend = new Resend(process.env.RESEND_API_KEY);
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Set timezone
moment.tz.setDefault('Europe/London');

async function sendNotifications() {
    console.log('🔔 Starting notification job at', moment().format('YYYY-MM-DD HH:mm:ss'));

    try {
        // Get settings
        const settingsResult = await pool.query('SELECT * FROM notification_settings');
        const settings = {};
        settingsResult.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });

        if (settings.enabled !== 'true') {
            console.log('⏸️  Notifications are disabled');
            return;
        }

        const weeklyDays = parseInt(settings.weekly_reminder_days || '7');
        const today = moment().format('YYYY-MM-DD');
        const weekAhead = moment().add(weeklyDays, 'days').format('YYYY-MM-DD');

        console.log(`📅 Checking for assignments on ${today} (today) and ${weekAhead} (${weeklyDays} days ahead)`);

        // Find assignments for TODAY (morning reminder)
        const todayAssignments = await pool.query(`
            SELECT a.*, m.email, m.phone
            FROM assignments a
            JOIN members m ON a.member_name = m.name
            WHERE a.assignment_date = $1 
            AND m.email IS NOT NULL
            AND m.email != ''
            AND NOT EXISTS (
                SELECT 1 FROM notifications_sent ns 
                WHERE ns.assignment_id = a.id 
                AND ns.notification_type = 'daily'
            )
            ORDER BY a.assignment_type, a.role
        `, [today]);

        // Find assignments for WEEK AHEAD (weekly reminder)
        const weeklyAssignments = await pool.query(`
            SELECT a.*, m.email, m.phone
            FROM assignments a
            JOIN members m ON a.member_name = m.name
            WHERE a.assignment_date = $1 
            AND m.email IS NOT NULL
            AND m.email != ''
            AND NOT EXISTS (
                SELECT 1 FROM notifications_sent ns 
                WHERE ns.assignment_id = a.id 
                AND ns.notification_type = 'weekly'
            )
            ORDER BY a.assignment_type, a.role
        `, [weekAhead]);

        console.log(`📧 Found ${todayAssignments.rows.length} daily reminders and ${weeklyAssignments.rows.length} weekly reminders to send`);

        // Send TODAY reminders
        for (const assignment of todayAssignments.rows) {
            try {
                await sendEmail(assignment, 'daily', settings);
                await markAsSent(assignment.id, 'daily');
                console.log(`✅ Sent daily reminder to ${assignment.member_name} (${assignment.email})`);
            } catch (error) {
                console.error(`❌ Failed to send daily reminder to ${assignment.member_name}:`, error.message);
                await markAsFailed(assignment.id, 'daily', error.message);
            }
        }

        // Send WEEKLY reminders
        for (const assignment of weeklyAssignments.rows) {
            try {
                await sendEmail(assignment, 'weekly', settings);
                await markAsSent(assignment.id, 'weekly');
                console.log(`✅ Sent weekly reminder to ${assignment.member_name} (${assignment.email})`);
            } catch (error) {
                console.error(`❌ Failed to send weekly reminder to ${assignment.member_name}:`, error.message);
                await markAsFailed(assignment.id, 'weekly', error.message);
            }
        }

        console.log('✨ Notification job completed successfully');

    } catch (error) {
        console.error('💥 Notification job failed:', error);
    } finally {
        await pool.end();
    }
}

async function sendEmail(assignment, type, settings) {
    const isToday = type === 'daily';
    const typeTitle = assignment.assignment_type === 'santa' ? 'Santa Tour' : (assignment.assignment_type === 'breakfast' ? 'Breakfast with Father Christmas' : 'Knights Garden');
    const subject = isToday
        ? `🎅 Reminder: Your ${typeTitle} Assignment Today`
        : `📅 Upcoming: ${typeTitle} Assignment in 7 Days`;

    const formattedDate = moment(assignment.assignment_date).format('dddd, MMMM Do YYYY');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .assignment-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
                .detail { margin: 10px 0; }
                .label { font-weight: bold; color: #667eea; }
                .footer { text-align: center; color: #718096; font-size: 0.9em; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${isToday ? '🔔 Today\'s Assignment' : '📅 Upcoming Assignment'}</h1>
                </div>
                <div class="content">
                    <p>Hi <strong>${assignment.member_name}</strong>,</p>
                    
                    <p>${isToday
            ? 'This is your reminder for <strong>today\'s</strong> assignment:'
            : 'This is a friendly reminder that you have an assignment coming up in <strong>one week</strong>:'
        }</p>
                    
                    <div class="assignment-box">
                        <div class="detail">
                            <span class="label">📅 Date:</span> ${formattedDate}
                        </div>
                        <div class="detail">
                            <span class="label">📍 Location:</span> ${assignment.location || 'TBA'}
                        </div>
                        <div class="detail">
                            <span class="label">👔 Role:</span> ${assignment.role}
                        </div>
                        <div class="detail">
                            <span class="label">🎯 Type:</span> ${assignment.assignment_type === 'santa' ? 'Santa Tour' : (assignment.assignment_type === 'breakfast' ? 'Breakfast with Father Christmas' : 'Knights Garden Collection')}
                        </div>
                        ${assignment.notes ? `<div class="detail"><span class="label">📝 Notes:</span> ${assignment.notes}</div>` : ''}
                    </div>
                    
                    ${isToday
            ? '<p><strong>Please arrive on time and bring any necessary equipment.</strong></p>'
            : '<p>Please mark this in your calendar and let us know if you have any conflicts.</p>'
        }
                    
                    <p>If you have any questions or need to make changes, please contact the organizer as soon as possible.</p>
                    
                    <div class="footer">
                        <p>This is an automated reminder from Rotary Club of Caterham</p>
                        <p>Registered Charity No: 263629</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    await resend.emails.send({
        from: `${settings.from_name || 'Rotary Caterham'} <${settings.from_email || process.env.FROM_EMAIL}>`,
        to: assignment.email,
        subject: subject,
        html: html
    });
}

async function markAsSent(assignmentId, type) {
    await pool.query(`
        INSERT INTO notifications_sent (assignment_id, notification_type, email_status)
        VALUES ($1, $2, 'sent')
        ON CONFLICT (assignment_id, notification_type) DO NOTHING
    `, [assignmentId, type]);
}

async function markAsFailed(assignmentId, type, errorMessage) {
    await pool.query(`
        INSERT INTO notifications_sent (assignment_id, notification_type, email_status)
        VALUES ($1, $2, $3)
        ON CONFLICT (assignment_id, notification_type) 
        DO UPDATE SET email_status = EXCLUDED.email_status
    `, [assignmentId, type, `failed: ${errorMessage.substring(0, 100)}`]);
}

// Run the job
sendNotifications();
