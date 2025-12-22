import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import { execSync } from 'child_process';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080; // Standard Cloud Run port

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint - early in stack
app.get('/health', (req, res) => {
    try {
        console.log('📋 Health check requested');
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            cwd: process.cwd(),
            dirname: __dirname,
            envCheck: !!process.env.DATABASE_URL
        });
    } catch (error) {
        console.error('💥 Health check failed:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Serve static files from the 'dist' directory
const distPath = join(__dirname, '../dist');
console.log(`📂 Serving static files from: ${distPath}`);
if (fs.existsSync(distPath)) {
    console.log('✅ Dist directory found');
    console.log('📄 Files in dist:', fs.readdirSync(distPath));
} else {
    console.error('❌ Dist directory NOT found at:', distPath);
}

app.use(express.static(distPath));

// Fallback for the root and other pages without .html
app.get('/', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
});

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
    } else {
        console.log('✅ Database connected:', res.rows[0].now);
    }
});

// Simple auth middleware
const authenticate = (req, res, next) => {
    const apiSecret = req.headers['x-api-secret'];
    if (apiSecret !== process.env.API_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Debug catch-all
app.use((req, res, next) => {
    console.log(`🔍 [${req.method}] ${req.url}`);
    next();
});

// Sync members and assignments from frontend
app.post('/api/sync', authenticate, async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { members, assignments } = req.body;

        // 1. Upsert members
        if (members && members.length > 0) {
            for (const member of members) {
                await client.query(`
                    INSERT INTO members (name, email, phone, updated_at)
                    VALUES ($1, $2, $3, NOW())
                    ON CONFLICT (name) 
                    DO UPDATE SET 
                        email = EXCLUDED.email,
                        phone = EXCLUDED.phone,
                        updated_at = NOW()
                `, [member.name, member.email || null, member.phone || null]);
            }
        }

        // 2. Clear existing assignments (we'll do a full replace for simplicity)
        await client.query('DELETE FROM assignments');

        // 3. Insert new assignments
        if (assignments && assignments.length > 0) {
            for (const assignment of assignments) {
                await client.query(`
                    INSERT INTO assignments 
                    (assignment_date, assignment_type, location, role, member_name, notes, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW())
                `, [
                    assignment.date,
                    assignment.type, // 'santa' or 'knights'
                    assignment.location,
                    assignment.role,
                    assignment.memberName,
                    assignment.notes || null
                ]);
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            synced: {
                members: members?.length || 0,
                assignments: assignments?.length || 0
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Sync failed', details: error.message });
    } finally {
        client.release();
    }
});

// Get upcoming assignments (for admin dashboard)
app.get('/api/assignments/upcoming', authenticate, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM upcoming_assignments_with_emails
            WHERE assignment_date >= CURRENT_DATE
            ORDER BY assignment_date, assignment_type
            LIMIT 100
        `);

        res.json({ assignments: result.rows });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// Get notification settings
app.get('/api/settings', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notification_settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update notification settings
app.post('/api/settings', authenticate, async (req, res) => {
    try {
        const { key, value } = req.body;
        await pool.query(`
            INSERT INTO notification_settings (setting_key, setting_value, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (setting_key)
            DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
        `, [key, value]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Manual trigger for testing notifications
app.post('/api/notify/trigger', authenticate, async (req, res) => {
    try {
        execSync('node backend/notifier.js', { stdio: 'inherit' });
        res.json({ success: true, message: 'Notification job triggered' });
    } catch (error) {
        console.error('Error triggering notifications:', error);
        res.status(500).json({ error: 'Failed to trigger notifications' });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Notification service ready`);
});

// Robust error handling for Cloud Run
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down...', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
    });
});
