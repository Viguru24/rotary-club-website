const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../server/database.sqlite');
console.log('Fixing SQLite DB at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Connected to SQLite');
});

const placeholder = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000";

db.serialize(() => {
    // 1. Update NULL or empty images
    db.run(`UPDATE posts SET image = ? WHERE image IS NULL OR image = '' OR image = 'NULL'`, [placeholder], function (err) {
        if (err) return console.error(err.message);
        console.log(`Updated ${this.changes} rows with empty/null images.`);
    });

    // 2. Update specific known broken titles if needed (the Bench)
    db.run(`UPDATE posts SET image = ? WHERE title LIKE '%Bench%' AND (image IS NULL OR length(image) < 20)`, [placeholder], function (err) {
        if (err) return console.error(err.message);
        console.log(`Updated ${this.changes} 'Bench' rows.`);
    });
});

db.close(() => {
    console.log('Database connection closed.');
});
