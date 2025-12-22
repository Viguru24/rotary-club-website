const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db.cjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001; // Support Cloud Run PORT env var

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for bulk/images

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve Uploads Folder Statically
app.use('/uploads', express.static(uploadDir));

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Helper for Async Handlers
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// --- BLOG POSTS API ---

app.get('/api/posts', asyncHandler(async (req, res) => {
    const { status } = req.query;
    let sql = "SELECT * FROM posts ORDER BY id DESC";
    let params = [];

    if (status) {
        sql = "SELECT * FROM posts WHERE status = ? ORDER BY id DESC";
        params = [status];
    }

    const { rows } = await db.query(sql, params);
    res.json({ message: "success", data: rows });
}));

app.get('/api/posts/:id', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM posts WHERE id = ?", [req.params.id]);
    res.json({ message: "success", data: rows[0] });
}));

app.post('/api/posts', asyncHandler(async (req, res) => {
    const { title, date, author, category, readTime, image, content, status } = req.body;
    const sql = `INSERT INTO posts (title, date, author, category, readTime, image, content, status) VALUES (?,?,?,?,?,?,?,?)`;
    const params = [title, date, author, category, readTime, image, content, status];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", data: req.body, id: lastID });
}));

app.put('/api/posts/:id', asyncHandler(async (req, res) => {
    const { title, date, author, category, readTime, image, content, status } = req.body;
    const sql = `UPDATE posts SET title = ?, date = ?, author = ?, category = ?, readTime = ?, image = ?, content = ?, status = ? WHERE id = ?`;
    const params = [title, date, author, category, readTime, image, content, status, req.params.id];
    const { changes } = await db.query(sql, params);
    res.json({ message: "success", data: req.body, changes });
}));

app.delete('/api/posts/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// --- EVENTS API ---

app.get('/api/events', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM events ORDER BY date ASC");
    res.json({ message: "success", data: rows });
}));

app.post('/api/events', asyncHandler(async (req, res) => {
    const { title, date, time, location, description, category, image } = req.body;
    const sql = "INSERT INTO events (title, date, time, location, description, category, image) VALUES (?,?,?,?,?,?,?)";
    const params = [title, date, time, location, description, category, image];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", data: { id: lastID, ...req.body }, id: lastID });
}));

app.put('/api/events/:id', asyncHandler(async (req, res) => {
    const { title, date, time, location, description, category, image } = req.body;
    const sql = "UPDATE events SET title=?, date=?, time=?, location=?, description=?, category=?, image=? WHERE id=?";
    const params = [title, date, time, location, description, category, image, req.params.id];
    const { changes } = await db.query(sql, params);
    res.json({ message: 'success', changes });
}));

app.delete('/api/events/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM events WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// --- MEMBERS API ---

app.get('/api/members', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM members ORDER BY lastName ASC");
    res.json({ message: "success", data: rows });
}));

app.post('/api/members', asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, role, vocation, joinDate, dob, status, attendance, serviceHours, imageUrl, bio } = req.body;
    const sql = `INSERT INTO members (firstName, lastName, email, phone, role, vocation, joinDate, dob, status, attendance, serviceHours, imageUrl, bio) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const params = [firstName, lastName, email, phone, role, vocation, joinDate, dob, status, attendance, serviceHours, imageUrl, bio];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", id: lastID });
}));

app.put('/api/members/:id', asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, role, vocation, joinDate, dob, status, attendance, serviceHours, imageUrl, bio } = req.body;
    const sql = `UPDATE members SET firstName=?, lastName=?, email=?, phone=?, role=?, vocation=?, joinDate=?, dob=?, status=?, attendance=?, serviceHours=?, imageUrl=?, bio=? WHERE id=?`;
    const params = [firstName, lastName, email, phone, role, vocation, joinDate, dob, status, attendance, serviceHours, imageUrl, bio, req.params.id];
    const { changes } = await db.query(sql, params);
    res.json({ message: "success", changes });
}));

app.post('/api/members/bulk', asyncHandler(async (req, res) => {
    const members = req.body;
    if (!Array.isArray(members)) return res.status(400).json({ error: "Expected array" });

    // Iterate sequentially for simplicity/compat
    let count = 0;
    for (const m of members) {
        const sql = `INSERT INTO members (firstName, lastName, email, phone, role, vocation, joinDate, dob, status, attendance, serviceHours, imageUrl, bio) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        const params = [m.firstName, m.lastName, m.email, m.phone, m.role, m.vocation, m.joinDate, m.dob, m.status, m.attendance, m.serviceHours, m.imageUrl, m.bio];
        await db.query(sql, params);
        count++;
    }
    res.json({ message: "success", count });
}));

app.delete('/api/members/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM members WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// --- EXPENSES API ---

app.get('/api/expenses', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM expenses ORDER BY date DESC");
    res.json({ message: "success", data: rows });
}));

app.post('/api/expenses', asyncHandler(async (req, res) => {
    const { merchant, date, amount, category, description } = req.body;
    const sql = "INSERT INTO expenses (merchant, date, amount, category, description) VALUES (?,?,?,?,?)";
    const params = [merchant, date, amount, category, description];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", id: lastID });
}));

app.put('/api/expenses/:id', asyncHandler(async (req, res) => {
    const { merchant, date, amount, category, description } = req.body;
    const sql = "UPDATE expenses SET merchant=?, date=?, amount=?, category=?, description=? WHERE id=?";
    const params = [merchant, date, amount, category, description, req.params.id];
    const { changes } = await db.query(sql, params);
    res.json({ message: "success", changes });
}));

app.delete('/api/expenses/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM expenses WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// --- INCOME API ---

app.get('/api/income', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM income ORDER BY date DESC");
    res.json({ message: "success", data: rows });
}));

app.post('/api/income', asyncHandler(async (req, res) => {
    const { source, date, amount, category, description } = req.body;
    const sql = "INSERT INTO income (source, date, amount, category, description) VALUES (?,?,?,?,?)";
    const params = [source, date, amount, category, description];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", id: lastID });
}));

app.put('/api/income/:id', asyncHandler(async (req, res) => {
    const { source, date, amount, category, description } = req.body;
    const sql = "UPDATE income SET source=?, date=?, amount=?, category=?, description=? WHERE id=?";
    const params = [source, date, amount, category, description, req.params.id];
    const { changes } = await db.query(sql, params);
    res.json({ message: "success", changes });
}));

app.delete('/api/income/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM income WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// --- RECEIPT SCANNER API ---

app.get('/api/lists', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM lists ORDER BY value ASC");
    res.json({ message: "success", data: rows });
}));

app.post('/api/lists', asyncHandler(async (req, res) => {
    const { type, value } = req.body;
    if (!type || !value) return res.status(400).json({ error: "Missing type or value" });
    const { lastID } = await db.query("INSERT INTO lists (type, value) VALUES (?, ?)", [type, value]);
    res.json({ message: "success", id: lastID, type, value });
}));

app.delete('/api/lists/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM lists WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// --- RECEIPT SCANNER API ---

app.post('/api/scan-receipt', asyncHandler(async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image data" });

    const prompt = `
      Analyze this receipt image and extract the following information in strict JSON format:
      - merchant: Name of store/business
      - date: YYYY-MM-DD
      - amount: Total amount (number)
      - description: Brief description
      - category: One of ["Food", "Transport", "Supplies", "Utilities", "Other"]
      Return null for missing fields. valid JSON only.
    `;

    try {
        // Dynamic import for ESM compatibility in CJS
        const { GoogleGenerativeAI } = await import("@google/generative-ai");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        let mimeType = "image/jpeg";
        if (image.startsWith("data:")) {
            const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
            if (matches) mimeType = matches[1];
        }

        const cleanBase64 = image.replace(/^data:image\/[a-z]+;base64,/, "");

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: cleanBase64,
                    mimeType: mimeType,
                },
            }
        ]);

        const text = result.response.text();

        // Helper to clean JSON
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanJson);

        res.json({ success: true, data });
    } catch (error) {
        console.error("Gemini Scan Error:", error);
        res.status(500).json({ error: error.message || "Failed to scan receipt" });
    }
}));

// --- SERVE FRONTEND (PRODUCTION) ---
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Handle SPA Routing (Any non-API route returns index.html)
app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
