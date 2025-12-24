
const db = require('../server/db.cjs');

async function migrate() {
    console.log('Running manual migrations...');
    try {
        // Add items column to bunny_run_invoices if it doesn't exist
        // Postgres check
        if (process.env.NODE_ENV === 'production') {
            await db.query(`ALTER TABLE bunny_run_invoices ADD COLUMN IF NOT EXISTS items TEXT`);
            console.log('Postgres: Added items column to bunny_run_invoices (if missing)');
        } else {
            // SQLite doesn't support ADD COLUMN IF NOT EXISTS easily in one line without error
            try {
                await db.query(`ALTER TABLE bunny_run_invoices ADD COLUMN items TEXT`);
                console.log('SQLite: Added items column to bunny_run_invoices');
            } catch (e) {
                if (e.message.includes('duplicate column name')) {
                    console.log('SQLite: items column already exists');
                } else {
                    console.error('SQLite Mig Error:', e.message);
                }
            }
        }

        console.log('Migration Cleanup Complete.');
        process.exit(0);
    } catch (err) {
        console.error('Mig Error:', err);
        process.exit(1);
    }
}

migrate();
