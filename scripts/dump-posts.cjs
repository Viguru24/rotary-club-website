const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_PROD,
    ssl: { rejectUnauthorized: false }
});

async function checkPosts() {
    try {
        const res = await pool.query("SELECT id, title, image, length(image) as img_len FROM posts WHERE title ILIKE '%Bench%'");
        console.log("Found posts:", res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkPosts();
