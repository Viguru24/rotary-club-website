
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_PROD,
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    try {
        console.log('Connecting to Neon DB...');
        const client = await pool.connect();
        console.log('Connected successfully!');

        const res = await client.query('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'');
        console.log('Tables found:', res.rows.map(r => r.tablename).join(', '));

        client.release();
        await pool.end();
        console.log('Verification Complete: Credentials work.');
    } catch (err) {
        console.error('Connection Failed:', err);
        process.exit(1);
    }
}

verify();
