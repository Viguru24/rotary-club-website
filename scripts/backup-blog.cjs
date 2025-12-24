const fs = require('fs');
const path = require('path');
const db = require('../server/db.cjs');

const backup = async () => {
    console.log('Starting Blog Backup...');
    try {
        const result = await db.query('SELECT * FROM posts');
        const posts = result.rows || [];

        const backupPath = path.join(__dirname, `blog_backup_${Date.now()}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(posts, null, 2));

        console.log(`✅ Backup successful! Saved ${posts.length} posts to ${backupPath}`);
    } catch (err) {
        console.error('❌ Backup failed:', err);
    }
};

backup();
