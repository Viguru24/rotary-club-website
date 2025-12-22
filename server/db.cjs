const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const isProd = process.env.NODE_ENV === 'production';
console.log(`Database Mode: ${isProd ? 'Production (Neon Postgres)' : 'Development (SQLite)'}`);

let dbAPI;

const INITIAL_POSTS = [
    {
        title: "Modern slavery exists in the UK!",
        date: "2024-11-15",
        author: "Caterham Rotary",
        category: "Community Action",
        readTime: "2 min",
        image: "https://assets.zyrosite.com/A85wDMJxW0U0RxO0/whatsapp-image-2024-12-08-at-08.46.45_e2ff522e-AMqb0XN1J1ueQbOB.jpg",
        content: `
            <p>Modern slavery is happening in towns, cities and rural areas across the UK. Victims are trapped in crime, sex trafficking, forced labour, coerced marriages and drug exploitation, often suffering long-term trauma.</p>
            <p>According to the National Referral Mechanism, 19,125 potential victims were identified in the UK last year. However, because modern slavery is hidden, the real figure is likely far higher—the Global Slavery Index 2023 estimates around 122,000 people are living in these conditions.</p>
            <p>In response to these alarming statistics, Caterham Rotary Club partnered with local charity <strong>Their Voice</strong>, along with volunteers from North Downs Hospital and Rokewood Court Care Home.</p>
            <p>Together, a team of eight packed brand-new essential items for children and adults who have been rescued and are preparing for a safer future.</p>
            <p>Carolyn Thom, who runs Their Voice, said: "We are so grateful to Caterham Rotary Club... Their commitment made a real difference to our charity and the community we serve."</p>
        `,
        status: 'published'
    },
    {
        title: "A Festival full of cricket",
        date: "2024-07-15",
        author: "Caterham Rotary",
        category: "Events",
        readTime: "3 min",
        image: "https://assets.zyrosite.com/A85wDMJxW0U0RxO0/crickete6080c28e848-mxB7DQZ68EsaNGBN.JPG",
        content: `
            <p>This heralded the introduction of a new community Cricket Day organised by Caterham Rotary.</p>
            <p>It was a day filled with sunshine, laughter, and friendly competition as teams gathered to celebrate the spirit of cricket and community.</p>
        `,
        status: 'published'
    },
    {
        title: "Archaeological dig for the kids",
        date: "2024-06-17",
        author: "Caterham Rotary",
        category: "Community",
        readTime: "4 min",
        image: "https://assets.zyrosite.com/A85wDMJxW0U0RxO0/archaeological-dig-for-the-kids-caterham-rotary-AGBG8v4kr9ipxaoN.png",
        content: `
            <p>Caterham Rotary Club were recently delighted to support The East Surrey Museum at the “Rod Stead Archaeological Dig” for young people, which took place at Queens Park Caterham.</p>
            <p>It was a fantastic opportunity for the children to get hands-on experience with history, digging for artifacts and learning about the local heritage from experts.</p>
        `,
        status: 'published'
    },
    {
        title: "Caterham Rotarians win Rotary Regional Quiz",
        date: "2024-09-05",
        author: "Caterham Rotary",
        category: "Club News",
        readTime: "2 min",
        image: "https://assets.zyrosite.com/A85wDMJxW0U0RxO0/photo-2024-09-05-11-05-39-AQEpR0Xa6phBGqpQ.jpg",
        content: `
            <p>We are proud to announce that the Caterham Rotarians have won the Rotary Regional Quiz!</p>
            <p>It was a battle of wits and knowledge, but our team came out on top, showcasing their broad understanding of various subjects and excellent teamwork.</p>
        `,
        status: 'published'
    },
    {
        title: "Charity Golf Day Proves a Massive Success",
        date: "2024-08-31",
        author: "Caterham Rotary",
        category: "Fundraising",
        readTime: "5 min",
        image: "https://assets.zyrosite.com/A85wDMJxW0U0RxO0/8c0b811b-d509-482e-be64-9e1a56f421e2-YbN9rGPQDzTVQRl2.JPG",
        content: `
            <p>Caterham Rotary Club’s Charity Golf Day Proves a Massive Success, Raising Nearly £5,600.</p>
            <p>Golfers enjoyed a beautiful day on the course, knowing that their participation was contributing to a great cause. The funds raised will go a long way in supporting our various community projects.</p>
        `,
        status: 'published'
    },
    {
        title: "A Heartwarming Visit to the Community Sand Dam Project",
        date: "2024-09-05",
        author: "Geoff",
        category: "International",
        readTime: "6 min",
        image: "https://assets.zyrosite.com/A85wDMJxW0U0RxO0/photo-2024-09-05-11-35-19-ALpo9VxbD4F9O4pz.jpg",
        content: `
            <p>It was a heartwarming visit to the Community Sand Dam Project.</p>
            <p>Seeing the impact of the project firsthand was truly inspiring. The community has come together to build a sustainable water source that will benefit generations to come.</p>
        `,
        status: 'published'
    }
];

if (isProd) {
    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL_PROD,
        ssl: { rejectUnauthorized: false } // Required for Neon
    });

    const initPostgres = async () => {
        try {
            // Events Table
            await pool.query(`CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title TEXT,
                date TEXT,
                time TEXT,
                location TEXT,
                description TEXT,
                category TEXT,
                image TEXT
            )`);

            // Posts Table
            await pool.query(`CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                title TEXT,
                date TEXT,
                author TEXT,
                category TEXT,
                readTime TEXT,
                image TEXT,
                content TEXT,
                status TEXT
            )`);

            // Members Table
            await pool.query(`CREATE TABLE IF NOT EXISTS members (
                id SERIAL PRIMARY KEY,
                firstName TEXT,
                lastName TEXT,
                email TEXT,
                phone TEXT,
                role TEXT,
                vocation TEXT,
                joinDate TEXT,
                dob TEXT,
                status TEXT,
                attendance INTEGER,
                serviceHours INTEGER,
                imageUrl TEXT,
                bio TEXT
            )`);

            // Expenses Table
            await pool.query(`CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                merchant TEXT,
                date TEXT,
                amount REAL,
                category TEXT,
                description TEXT
            )`);

            // Income Table
            await pool.query(`CREATE TABLE IF NOT EXISTS income (
                id SERIAL PRIMARY KEY,
                source TEXT,
                date TEXT,
                amount REAL,
                category TEXT,
                description TEXT
            )`);

            // Lists Table (for dynamic dropdowns)
            await pool.query(`CREATE TABLE IF NOT EXISTS lists (
                id SERIAL PRIMARY KEY,
                type TEXT,
                value TEXT
            )`);

            // Seed Lists if empty
            const { rows: listRows } = await pool.query('SELECT count(*) FROM lists');
            if (parseInt(listRows[0].count) === 0) {
                console.log('Seeding Lists...');
                const defaults = [
                    { type: 'role', value: 'Member' },
                    { type: 'role', value: 'Committee' },
                    { type: 'role', value: 'Administrator' },
                    { type: 'strength', value: 'Community Service' },
                    { type: 'strength', value: 'Leadership' },
                    { type: 'strength', value: 'Event Planning' },
                    { type: 'event_category', value: 'Meeting' },
                    { type: 'event_category', value: 'Fundraiser' },
                    { type: 'event_category', value: 'Social' },
                    { type: 'event_category', value: 'Other' },
                    { type: 'event_location', value: 'Surrey National Golf Club' },
                    { type: 'event_location', value: 'Zoom' }
                ];
                for (const d of defaults) {
                    await pool.query('INSERT INTO lists (type, value) VALUES ($1, $2)', [d.type, d.value]);
                }
            }

            // Seed logic (Basic check)
            const { rows } = await pool.query('SELECT count(*) FROM events');
            if (parseInt(rows[0].count) === 0) {
                console.log('Seeding Events (Postgres)...');
                // ... Add explicit event seeding if needed later
            }

            console.log('Postgres Schema Synced.');
        } catch (err) {
            console.error('Postgres Init Error:', err);
        }
    };

    initPostgres();

    dbAPI = {
        query: async (text, params = []) => {
            // Convert SQLite ? syntax to Postgres $1 syntax
            let i = 1;
            // Use a function to ensure correct replacement index
            const pgText = text.replace(/\?/g, () => `$${i++}`);

            // Handle INSERT ... RETURNING id
            let finalSql = pgText;
            if (/^insert/i.test(finalSql) && !/returning/i.test(finalSql)) {
                finalSql += ' RETURNING id';
            }

            const res = await pool.query(finalSql, params);
            return {
                rows: res.rows,
                lastID: res.rows[0]?.id || 0,
                changes: res.rowCount
            };
        }
    };

} else {
    // SQLite Implementation
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, 'database.sqlite');
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error(err.message);
        else console.log('Connected to SQLite');
    });

    // Seeding Logic (Preserved from original)
    const initSqlite = () => {
        db.serialize(() => {
            // Events
            db.run(`CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                date TEXT,
                time TEXT,
                location TEXT,
                description TEXT,
                category TEXT,
                image TEXT
            )`);
            // Posts
            db.run(`CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                date TEXT,
                author TEXT,
                category TEXT,
                readTime TEXT,
                image TEXT,
                content TEXT,
                status TEXT
            )`);
            // Members
            db.run(`CREATE TABLE IF NOT EXISTS members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firstName TEXT,
                lastName TEXT,
                email TEXT,
                phone TEXT,
                role TEXT,
                vocation TEXT,
                joinDate TEXT,
                dob TEXT,
                status TEXT,
                attendance INTEGER,
                serviceHours INTEGER,
                imageUrl TEXT,
                bio TEXT
            )`);

            // Expenses
            db.run(`CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                merchant TEXT,
                date TEXT,
                amount REAL,
                category TEXT,
                description TEXT
            )`);

            // Income
            db.run(`CREATE TABLE IF NOT EXISTS income (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT,
                date TEXT,
                amount REAL,
                category TEXT,
                description TEXT
            )`);

            // Lists
            db.run(`CREATE TABLE IF NOT EXISTS lists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT,
                value TEXT
            )`);

            // Seed Lists if empty
            db.get("SELECT count(*) as count FROM lists", [], (err, row) => {
                if (!err && row && row.count === 0) {
                    const stmt = db.prepare("INSERT INTO lists (type, value) VALUES (?, ?)");
                    const defaults = [
                        { type: 'role', value: 'Member' },
                        { type: 'role', value: 'Committee' },
                        { type: 'role', value: 'Administrator' },
                        { type: 'strength', value: 'Community Service' },
                        { type: 'strength', value: 'Leadership' },
                        { type: 'strength', value: 'Event Planning' },
                        { type: 'event_category', value: 'Meeting' },
                        { type: 'event_category', value: 'Fundraiser' },
                        { type: 'event_category', value: 'Social' },
                        { type: 'event_category', value: 'Other' },
                        { type: 'event_location', value: 'Surrey National Golf Club' },
                        { type: 'event_location', value: 'Zoom' }
                    ];
                    defaults.forEach(d => stmt.run(d.type, d.value));
                    stmt.finalize();
                }
            });

            // Seed Check Posts
            db.get("SELECT count(*) as count FROM posts", [], (err, row) => {
                if (!err && row && row.count === 0) {
                    const stmt = db.prepare(`INSERT INTO posts (title, date, author, category, readTime, image, content, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
                    INITIAL_POSTS.forEach(post => {
                        stmt.run(post.title, post.date, post.author, post.category, post.readTime, post.image, post.content, post.status);
                    });
                    stmt.finalize();
                }
            });
        });
    }
    initSqlite();

    dbAPI = {
        query: (text, params = []) => {
            return new Promise((resolve, reject) => {
                const isSelect = /^(select|pragma)/i.test(text.trim());
                if (isSelect) {
                    db.all(text, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve({ rows });
                    });
                } else {
                    const isInsert = /^insert/i.test(text.trim());
                    const isUpdate = /^update/i.test(text.trim());
                    // SQLite 'get' for single row? No, wrapper assumes rows array for selects.
                    // But if it's run/exec:
                    db.run(text, params, function (err) {
                        if (err) reject(err);
                        else resolve({ lastID: this.lastID, changes: this.changes });
                    });
                }
            });
        }
    };
}

module.exports = dbAPI;
