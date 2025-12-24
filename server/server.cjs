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

// --- BUNNY RUN API ---

// Registrations
app.get('/api/bunny-run/registrations', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM bunny_run_registrations ORDER BY created_at DESC");
    res.json(rows);
}));

app.post('/api/bunny-run/registrations', asyncHandler(async (req, res) => {
    const { name, email, phone, event_type, age, postcode, consent_fitness, consent_photos } = req.body;
    const sql = "INSERT INTO bunny_run_registrations (name, email, phone, event_type, age, postcode, consent_fitness, consent_photos) VALUES (?,?,?,?,?,?,?,?)";
    const params = [name, email, phone || null, event_type, age || null, postcode || null, consent_fitness ? 1 : 0, consent_photos ? 1 : 0];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", id: lastID });
}));

app.delete('/api/bunny-run/registrations/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM bunny_run_registrations WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// Santa Bookings
app.get('/api/bunny-run/santa-bookings', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM bunny_run_santa_bookings ORDER BY created_at DESC");
    res.json(rows);
}));

app.post('/api/bunny-run/santa-bookings', asyncHandler(async (req, res) => {
    const { parent_name, email, phone, child_name, child_age, time_slot, special_requests } = req.body;
    const sql = "INSERT INTO bunny_run_santa_bookings (parent_name, email, phone, child_name, child_age, time_slot, special_requests) VALUES (?,?,?,?,?,?,?)";
    const params = [parent_name, email, phone || null, child_name, child_age || null, time_slot || null, special_requests || null];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", id: lastID });
}));

app.put('/api/bunny-run/santa-bookings/:id', asyncHandler(async (req, res) => {
    const { parent_name, email, phone, child_name, child_age, time_slot, special_requests } = req.body;
    const sql = "UPDATE bunny_run_santa_bookings SET parent_name=?, email=?, phone=?, child_name=?, child_age=?, time_slot=?, special_requests=? WHERE id=?";
    const params = [parent_name, email, phone || null, child_name, child_age || null, time_slot || null, special_requests || null, req.params.id];
    const { changes } = await db.query(sql, params);
    res.json({ message: "success", changes });
}));

app.delete('/api/bunny-run/santa-bookings/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM bunny_run_santa_bookings WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// Breakfast Bookings
app.get('/api/bunny-run/breakfast-bookings', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM bunny_run_breakfast_bookings ORDER BY created_at DESC");
    res.json(rows);
}));

app.post('/api/bunny-run/breakfast-bookings', asyncHandler(async (req, res) => {
    const { name, email, phone, num_adults, num_children, dietary_requirements } = req.body;
    const sql = "INSERT INTO bunny_run_breakfast_bookings (name, email, phone, num_adults, num_children, dietary_requirements) VALUES (?,?,?,?,?,?)";
    const params = [name, email, phone || null, num_adults || 0, num_children || 0, dietary_requirements || null];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", id: lastID });
}));

app.put('/api/bunny-run/breakfast-bookings/:id', asyncHandler(async (req, res) => {
    const { name, email, phone, num_adults, num_children, dietary_requirements } = req.body;
    const sql = "UPDATE bunny_run_breakfast_bookings SET name=?, email=?, phone=?, num_adults=?, num_children=?, dietary_requirements=? WHERE id=?";
    const params = [name, email, phone || null, num_adults || 0, num_children || 0, dietary_requirements || null, req.params.id];
    const { changes } = await db.query(sql, params);
    res.json({ message: "success", changes });
}));

app.delete('/api/bunny-run/breakfast-bookings/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM bunny_run_breakfast_bookings WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// Invoices
app.get('/api/bunny-run/invoices', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM bunny_run_invoices ORDER BY created_at DESC");
    res.json(rows);
}));

app.post('/api/bunny-run/invoices', asyncHandler(async (req, res) => {
    const { invoice_number, company_name, contact_name, email, phone, amount, items, description, status, due_date } = req.body;
    const sql = "INSERT INTO bunny_run_invoices (invoice_number, company_name, contact_name, email, phone, amount, items, description, status, due_date) VALUES (?,?,?,?,?,?,?,?,?,?)";
    const params = [invoice_number, company_name, contact_name || null, email || null, phone || null, amount, items || null, description || null, status || 'pending', due_date || null];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", id: lastID });
}));

app.put('/api/bunny-run/invoices/:id', asyncHandler(async (req, res) => {
    const { invoice_number, company_name, contact_name, email, phone, amount, items, description, status, due_date } = req.body;
    const sql = "UPDATE bunny_run_invoices SET invoice_number=?, company_name=?, contact_name=?, email=?, phone=?, amount=?, items=?, description=?, status=?, due_date=? WHERE id=?";
    const params = [invoice_number, company_name, contact_name || null, email || null, phone || null, amount, items || null, description || null, status || 'pending', due_date || null, req.params.id];
    const { changes } = await db.query(sql, params);
    res.json({ message: "success", changes });
}));

app.delete('/api/bunny-run/invoices/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM bunny_run_invoices WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// Export endpoint for Bunny Run data
app.get('/api/bunny-run/export', asyncHandler(async (req, res) => {
    const { type } = req.query; // 'registrations', 'santa', 'breakfast', 'invoices', or 'all'

    // For now, return JSON. You can add Excel export later with a library like 'exceljs'
    const data = {};

    if (!type || type === 'all' || type === 'registrations') {
        const { rows: registrations } = await db.query("SELECT * FROM bunny_run_registrations ORDER BY created_at DESC");
        data.registrations = registrations;
    }

    if (!type || type === 'all' || type === 'santa') {
        const { rows: santa } = await db.query("SELECT * FROM bunny_run_santa_bookings ORDER BY created_at DESC");
        data.santa_bookings = santa;
    }

    if (!type || type === 'all' || type === 'breakfast') {
        const { rows: breakfast } = await db.query("SELECT * FROM bunny_run_breakfast_bookings ORDER BY created_at DESC");
        data.breakfast_bookings = breakfast;
    }

    if (!type || type === 'all' || type === 'invoices') {
        const { rows: invoices } = await db.query("SELECT * FROM bunny_run_invoices ORDER BY created_at DESC");
        data.invoices = invoices;
    }

    res.json(data);
}));

// --- SANTA TOUR API ---

// Routes
app.get('/api/santa-tour/routes', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM santa_tour_routes ORDER BY name ASC");
    res.json(rows);
}));

app.post('/api/santa-tour/routes', asyncHandler(async (req, res) => {
    const { name, area, duration, stops_count, notes, map_data } = req.body;
    const sql = "INSERT INTO santa_tour_routes (name, area, duration, stops_count, notes, map_data) VALUES (?,?,?,?,?,?)";
    const params = [name, area, duration || null, stops_count || 0, notes || null, map_data || null];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", id: lastID });
}));

app.put('/api/santa-tour/routes/:id', asyncHandler(async (req, res) => {
    const { name, area, duration, stops_count, notes, map_data } = req.body;
    const sql = "UPDATE santa_tour_routes SET name=?, area=?, duration=?, stops_count=?, notes=?, map_data=? WHERE id=?";
    const params = [name, area, duration || null, stops_count || 0, notes || null, map_data || null, req.params.id];
    const { changes } = await db.query(sql, params);
    res.json({ message: "success", changes });
}));

app.delete('/api/santa-tour/routes/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM santa_tour_routes WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// Schedules
app.get('/api/santa-tour/schedules', asyncHandler(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM santa_tour_schedules ORDER BY date ASC, night_number ASC");
    res.json(rows);
}));

app.post('/api/santa-tour/schedules', asyncHandler(async (req, res) => {
    const { night_number, date, route_id, santa_member, driver_member, helper1_member, helper2_member, start_time, notes } = req.body;
    const sql = "INSERT INTO santa_tour_schedules (night_number, date, route_id, santa_member, driver_member, helper1_member, helper2_member, start_time, notes) VALUES (?,?,?,?,?,?,?,?,?)";
    const params = [
        night_number,
        date,
        route_id || null,
        santa_member || null,
        driver_member || null,
        helper1_member || null,
        helper2_member || null,
        start_time || '18:00',
        notes || null
    ];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", id: lastID });
}));

app.put('/api/santa-tour/schedules/:id', asyncHandler(async (req, res) => {
    const { night_number, date, route_id, santa_member, driver_member, helper1_member, helper2_member, start_time, notes } = req.body;
    const sql = "UPDATE santa_tour_schedules SET night_number=?, date=?, route_id=?, santa_member=?, driver_member=?, helper1_member=?, helper2_member=?, start_time=?, notes=? WHERE id=?";
    const params = [
        night_number,
        date,
        route_id || null,
        santa_member || null,
        driver_member || null,
        helper1_member || null,
        helper2_member || null,
        start_time || '18:00',
        notes || null,
        req.params.id
    ];
    const { changes } = await db.query(sql, params);
    res.json({ message: "success", changes });
}));

app.delete('/api/santa-tour/schedules/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM santa_tour_schedules WHERE id = ?", [req.params.id]);
    res.json({ message: "deleted", changes });
}));

// Location Tracking
app.get('/api/santa-tour/location', (req, res) => {
    // Current sleigh position (normally stored in memory or a file during live event)
    const filePath = path.join(__dirname, 'santa_location.json');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // Default to Caterham
        res.json({ lat: 51.280, lng: -0.080, timestamp: new Date() });
    }
});

app.post('/api/santa-tour/location', (req, res) => {
    const { lat, lng, secret } = req.body;
    // Simple secret check for demo
    if (secret !== process.env.SANTA_TRACK_SECRET && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: "Unauthorized" });
    }
    const locationData = { lat, lng, timestamp: new Date() };
    fs.writeFileSync(path.join(__dirname, 'santa_location.json'), JSON.stringify(locationData));
    res.json({ message: "Position updated", data: locationData });
});

// --- EVENT ROSTERS API ---
app.get('/api/event-rosters', asyncHandler(async (req, res) => {
    const { event_key } = req.query;
    let sql = "SELECT * FROM event_rosters";
    let params = [];
    if (event_key) {
        sql += " WHERE event_key = ?";
        params.push(event_key);
    }
    const { rows } = await db.query(sql, params);
    res.json(rows);
}));

app.post('/api/event-rosters', asyncHandler(async (req, res) => {
    const { event_key, title, date, location, slots, notes } = req.body;
    const sql = "INSERT INTO event_rosters (event_key, title, date, location, slots, notes) VALUES (?,?,?,?,?,?)";
    const params = [event_key, title, date || null, location || null, slots || null, notes || null];
    const { lastID } = await db.query(sql, params);
    res.json({ message: "success", id: lastID });
}));

app.put('/api/event-rosters/:id', asyncHandler(async (req, res) => {
    const { title, date, location, slots, notes } = req.body;
    const sql = "UPDATE event_rosters SET title=?, date=?, location=?, slots=?, notes=? WHERE id=?";
    const params = [title, date || null, location || null, slots || null, notes || null, req.params.id];
    const { changes } = await db.query(sql, params);
    res.json({ message: "success", changes });
}));

app.delete('/api/event-rosters/:id', asyncHandler(async (req, res) => {
    const { changes } = await db.query("DELETE FROM event_rosters WHERE id = ?", [req.params.id]);
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
