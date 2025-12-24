const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../server/database.sqlite');
console.log('Checking SQLite DB at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Connected to SQLite');
});

db.serialize(() => {
    db.all("SELECT id, title, image FROM posts", [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            console.log(`ID: ${row.id}, Title: ${row.title}`);
            console.log(`Image: ${row.image ? row.image.substring(0, 100) : 'NULL'}...`);
            console.log('---');
        });
    });
});

db.close();
