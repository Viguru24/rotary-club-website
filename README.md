# Rotary Club Website

Combined website for the Rotary Club of Caterham, featuring the main club website and the Easter Bunny Fun Run event management system.

## Features

### Main Website
- **Home**: Club information and latest news
- **Blog**: News and stories from the community
- **Calendar**: Upcoming events and meetings
- **Business Partners**: Local business partnerships
- **Where We Meet**: Location and meeting information
- **Join Us**: Membership information

### Bunny Fun Run
- **Public Registration**: Online registration for the Easter Bunny Fun Run & 5k
- **Event Information**: Course details, prizes, and entry fees
- **Countdown Timer**: Live countdown to race day
- **Admin Dashboard**: Registration management and export

### Admin Panel
- Blog Management
- Document Management
- Event Management
- Member Management
- Finance Tracking
- Site Settings
- Legal Documents
- **Bunny Run Registrations**

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Custom CSS with glassmorphism design
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Authentication**: Google OAuth
- **AI Features**: Google Generative AI

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Google Cloud account (for OAuth and AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Viguru24/rotary-club-website.git
cd rotary-club-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/rotary_db
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

4. Run database migrations:
```bash
npm run migrate
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
rotary-club-website/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components
│   ├── layouts/        # Layout components
│   ├── context/        # React context providers
│   ├── services/       # API services
│   ├── assets/         # Static assets
│   └── App.jsx         # Main app component
├── server/             # Backend server
│   ├── server.cjs      # Main server file
│   └── bunny-run/      # Bunny Run backend logic
├── public/             # Public static files
│   └── bunny-run/      # Bunny Run assets
└── package.json
```

## Routes

### Public Routes
- `/` - Home page
- `/blog` - Blog listing
- `/calendar` - Events calendar
- `/bunny-fun-run` - Easter Bunny Fun Run registration
- `/business-partners` - Business partners
- `/where-we-meet` - Meeting location
- `/join-us` - Membership information

### Admin Routes (Protected)
- `/admin` - Admin dashboard
- `/admin/blog` - Blog management
- `/admin/events` - Event management
- `/admin/members` - Member management
- `/admin/finance` - Finance tracking
- `/admin/bunny-run` - Bunny Run registrations

## Deployment

This project is configured for deployment on:
- **Vercel** (recommended for frontend)
- **Railway** / **Render** (for backend + database)
- **Google Cloud Run** (containerized deployment)

See `Dockerfile` for containerization.

## Contributing

This is a private project for the Rotary Club of Caterham. For questions or contributions, please contact the club administrator.

## License

© 2025 Rotary Club of Caterham. All rights reserved.

## Support

For technical support, contact: caterhamrotary2@gmail.com
