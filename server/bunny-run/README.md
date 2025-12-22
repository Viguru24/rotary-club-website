# Rotary Notification System - Implementation Summary

## ✅ What's Been Created

### Backend Files (`/backend/`)
1. **schema.sql** - Database schema for Neon Postgres
2. **server.js** - Express API server for syncing roster data
3. **notifier.js** - Email notification service (runs via cron)
4. **package.json** - Node.js dependencies
5. **.env.example** - Environment variables template
6. **test-email.js** - Test script for Resend email
7. **SETUP.md** - Complete deployment guide

### Frontend Files
1. **sync-santa.js** - Auto-sync Santa Tour roster to database
2. **sync-knights.js** - Auto-sync Knights Garden roster to database
3. **admin.html** - Updated with Notifications tab

---

## 🚀 Quick Start Guide

### 1. Set Up Database (5 minutes)
```bash
# Go to https://neon.tech and create a project
# Copy your connection string
# Run schema.sql in the Neon SQL Editor
```

### 2. Set Up Resend (5 minutes)
```bash
# Go to https://resend.com
# Verify your domain (rotarycaterham.org.uk)
# Create API key
```

### 3. Deploy Backend (15 minutes)
```bash
# On your Google server:
cd /opt
mkdir rotary-notifications
cd rotary-notifications

# Upload all files from /backend/ folder

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Fill in your credentials

# Test the setup
node test-email.js  # Should send you a test email
node server.js      # Should start the API server
```

### 4. Set Up Cron Job (2 minutes)
```bash
# Add to crontab
crontab -e

# Add this line (runs at 6 AM daily):
0 6 * * * cd /opt/rotary-notifications && /usr/bin/node notifier.js >> /var/log/rotary-notifications.log 2>&1
```

### 5. Configure Frontend (2 minutes)
1. Open the Admin Dashboard (admin.html)
2. Go to "Notifications" tab
3. Enter your Google server URL (e.g., `https://your-server.com:3000`)
4. Enter the API_SECRET (same as in backend .env)
5. Click "Save Configuration"
6. Click "Sync All Rosters Now"

---

## 📧 How It Works

### Automatic Notifications
Every day at 6:00 AM, the system:
1. Checks database for assignments happening **today**
   - Sends "Morning Reminder" emails
2. Checks database for assignments happening **in 7 days**
   - Sends "Weekly Reminder" emails
3. Tracks what's been sent (no duplicates)
4. Logs everything to `/var/log/rotary-notifications.log`

### Data Flow
```
Frontend (santa.html, knights.html)
    ↓ (auto-sync on save)
Backend API (server.js)
    ↓ (stores in)
Neon Postgres Database
    ↓ (read by)
Notification Service (notifier.js)
    ↓ (sends via)
Resend API
    ↓ (delivers to)
Team Members' Inboxes
```

---

## 🎯 Features

### Admin Dashboard
- ✅ View system status (API online/offline)
- ✅ Manual sync button
- ✅ Test email button
- ✅ View upcoming assignments
- ✅ Configure API settings

### Email Notifications
- ✅ Beautiful HTML emails with Rotary branding
- ✅ Includes all assignment details (date, location, role)
- ✅ Different templates for daily vs weekly reminders
- ✅ Automatic duplicate prevention

### Data Management
- ✅ Auto-sync from frontend to database
- ✅ Tracks member emails
- ✅ Stores both Santa Tour and Knights Garden assignments
- ✅ Notification history tracking

---

## 🔧 Configuration

### Environment Variables (.env)
```env
DATABASE_URL=postgresql://...        # Your Neon connection string
RESEND_API_KEY=re_...               # Your Resend API key
API_SECRET=your_random_secret       # Generate a strong random string
FROM_EMAIL=noreply@rotarycaterham.org.uk
FROM_NAME=Rotary Club of Caterham
PORT=3000
```

### Frontend Config (saved in localStorage)
- API URL: Your Google server address
- API Secret: Must match backend

---

## 📊 Monitoring

### Check Logs
```bash
# View notification logs
tail -f /var/log/rotary-notifications.log

# Check if cron is running
grep CRON /var/log/syslog
```

### Test Manually
```bash
# Trigger notification job
cd /opt/rotary-notifications
node notifier.js

# Check API health
curl http://localhost:3000/health
```

---

## 🐛 Troubleshooting

### Emails not sending?
1. Check Resend dashboard for errors
2. Verify domain is verified (green checkmark)
3. Ensure member emails are valid
4. Check `notifications_sent` table for failed status

### Database connection failed?
```bash
# Test connection
psql "your-connection-string" -c "SELECT NOW();"
```

### API offline?
```bash
# Check if server is running
ps aux | grep node

# Restart server
pm2 restart rotary-api
# OR
node server.js
```

---

## 📝 Next Steps

1. ✅ Test with real data
2. ✅ Monitor for 1 week
3. ✅ Adjust email templates if needed
4. ✅ Set up monitoring/alerts
5. ✅ Train team on using the system

---

## 💰 Cost

- **Neon Postgres**: Free tier (0.5 GB) - $0/month
- **Resend**: Free tier (100 emails/day) - $0/month
- **Google Server**: (You already have) - $0 additional

**Total: $0/month** 🎉

---

## 📞 Support

For issues or questions:
1. Check SETUP.md for detailed instructions
2. Review logs for error messages
3. Test each component individually
4. Verify all environment variables

Good luck! 🚀
