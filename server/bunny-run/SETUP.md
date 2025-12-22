# Rotary Notification System - Setup Guide

## Prerequisites
- ✅ Google Server (with Node.js installed)
- ✅ Neon Postgres database
- ✅ Resend account and API key

---

## Step 1: Database Setup (Neon)

1. **Create a new Neon project** at https://neon.tech
2. **Copy your connection string** (looks like: `postgresql://username:password@...`)
3. **Run the schema**:
   ```bash
   # Option A: Using psql
   psql "your-connection-string" < schema.sql
   
   # Option B: Copy/paste into Neon SQL Editor
   # Just paste the contents of schema.sql into the Neon dashboard
   ```

---

## Step 2: Resend Setup

1. **Sign up** at https://resend.com
2. **Verify your domain** (rotarycaterham.org.uk):
   - Add DNS records as shown in Resend dashboard
   - Wait for verification (usually 5-10 minutes)
3. **Create an API key**:
   - Go to Settings → API Keys
   - Create new key
   - Copy it (starts with `re_...`)

---

## Step 3: Backend Deployment (Google Server)

### Upload files to server
```bash
# SSH into your Google server
ssh user@your-server.com

# Create project directory
mkdir -p /opt/rotary-notifications
cd /opt/rotary-notifications

# Upload files (from your local machine)
scp -r backend/* user@your-server.com:/opt/rotary-notifications/
```

### Install dependencies
```bash
cd /opt/rotary-notifications
npm install
```

### Configure environment
```bash
# Copy example env file
cp .env.example .env

# Edit with your actual credentials
nano .env
```

**Fill in:**
```env
DATABASE_URL=postgresql://your-neon-connection-string
RESEND_API_KEY=re_your_resend_api_key
API_SECRET=generate_a_random_string_here
FROM_EMAIL=noreply@rotarycaterham.org.uk
FROM_NAME=Rotary Club of Caterham
PORT=3000
```

### Test the setup
```bash
# Test database connection
node -e "require('./server.js')"

# Test email sending (will send a test email)
node test-email.js
```

---

## Step 4: Setup Cron Job

### Option A: Linux Crontab (Recommended)
```bash
# Edit crontab
crontab -e

# Add this line (runs at 6:00 AM every day)
0 6 * * * cd /opt/rotary-notifications && /usr/bin/node notifier.js >> /var/log/rotary-notifications.log 2>&1
```

### Option B: PM2 with Cron Module
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rotary-api',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }, {
    name: 'rotary-notifier',
    script: './notifier.js',
    instances: 1,
    autorestart: false,
    cron_restart: '0 6 * * *'  // 6 AM daily
  }]
};
EOF

# Start services
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

---

## Step 5: Frontend Integration

### Update santa.js and knights.js

Add this sync function to both files:

```javascript
// Add at the top of the file
const API_URL = 'https://your-google-server.com';
const API_SECRET = 'your_api_secret_here';

// Add after saveState() function
const syncToDatabase = async () => {
    try {
        const assignments = extractAssignmentsForSync(); // See helper below
        const members = memberList.map(m => ({
            name: m.name || m,
            email: m.email || '',
            phone: m.phone || ''
        }));
        
        const response = await fetch(`${API_URL}/api/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Secret': API_SECRET
            },
            body: JSON.stringify({ members, assignments })
        });
        
        if (!response.ok) throw new Error('Sync failed');
        console.log('✅ Synced to database');
    } catch (error) {
        console.error('❌ Sync error:', error);
        // Don't block the UI, just log
    }
};

// Helper to extract assignments from scheduleData
function extractAssignmentsForSync() {
    const assignments = [];
    
    // For santa.js
    scheduleData.forEach(day => {
        const date = parseDateFromDayString(day.date); // e.g., "Mon 1" → "2025-12-01"
        
        // Add role assignments
        Object.entries(day.roles).forEach(([role, memberName]) => {
            if (memberName) {
                assignments.push({
                    date: date,
                    type: 'santa',
                    location: day.location,
                    role: role,
                    memberName: memberName
                });
            }
        });
        
        // Add collector assignments
        day.collectors.forEach((memberName, idx) => {
            if (memberName) {
                assignments.push({
                    date: date,
                    type: 'santa',
                    location: day.location,
                    role: `Collector ${idx + 1}`,
                    memberName: memberName
                });
            }
        });
    });
    
    return assignments;
}

// Helper to parse dates (you'll need to customize this)
function parseDateFromDayString(dayStr) {
    // Example: "Mon 1" → "2025-12-01"
    // You'll need to add logic based on your date format
    const year = 2025; // Or get from context
    const month = 12;  // December (Santa tour month)
    const day = parseInt(dayStr.match(/\d+/)[0]);
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Call sync after every save
const originalSaveState = saveState;
saveState = function() {
    originalSaveState();
    syncToDatabase(); // Non-blocking
};
```

---

## Step 6: Testing

### Manual test
```bash
# Trigger notification job manually
curl -X POST https://your-server.com/api/notify/trigger \
  -H "X-API-Secret: your_secret"
```

### Check logs
```bash
# View notification logs
tail -f /var/log/rotary-notifications.log

# Or with PM2
pm2 logs rotary-notifier
```

---

## Step 7: Monitoring

### Set up log rotation
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/rotary

# Add:
/var/log/rotary-notifications.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
}
```

### Health check
```bash
# Add to crontab (runs every hour)
0 * * * * curl -f https://your-server.com/health || echo "API is down!" | mail -s "Rotary API Alert" your@email.com
```

---

## Troubleshooting

### Emails not sending?
1. Check Resend dashboard for errors
2. Verify domain is verified
3. Check email addresses are valid
4. Look at `notifications_sent` table for failed status

### Database connection issues?
```bash
# Test connection
psql "your-connection-string" -c "SELECT NOW();"
```

### Cron not running?
```bash
# Check cron logs
grep CRON /var/log/syslog

# Test manually
cd /opt/rotary-notifications && node notifier.js
```

---

## Security Checklist

- [ ] API_SECRET is strong and random
- [ ] .env file is not in git
- [ ] Firewall allows only necessary ports
- [ ] SSL/TLS enabled on API endpoint
- [ ] Database uses SSL connection
- [ ] Resend API key is kept secret

---

## Next Steps

1. ✅ Test with a few real assignments
2. ✅ Monitor for 1 week to ensure reliability
3. ✅ Add admin panel for settings (optional)
4. ✅ Set up email delivery monitoring

---

## Support

If you encounter issues:
1. Check logs first
2. Verify all environment variables
3. Test each component individually
4. Check Resend and Neon dashboards

Good luck! 🚀
