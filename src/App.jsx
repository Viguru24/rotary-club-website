import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Admin from './pages/Admin';
import Calendar from './pages/Calendar';
import AdminLayout from './layouts/AdminLayout';
import AdminBlog from './pages/AdminBlog';
import AdminDocuments from './pages/AdminDocuments';
import AdminCalendar from './pages/AdminCalendar';
import AdminEventsBunnyRun from './pages/AdminEventsBunnyRun';
import AdminEventsSanta from './pages/AdminEventsSanta';
import AdminEventsKnights from './pages/AdminEventsKnights';
import AdminEventsBreakfast from './pages/AdminEventsBreakfast';
import AdminEventsInvoice from './pages/AdminEventsInvoice';
import AdminMembers from './pages/AdminMembers';
import AdminFinance from './pages/AdminFinance';
import AdminSiteSettings from './pages/AdminSiteSettings';
import AdminHomeSettings from './pages/AdminHomeSettings';
import BusinessPartners from './pages/BusinessPartners';
import AdminLegal from './pages/AdminLegal';
import LegalPage from './pages/LegalPage';
import WhereWeMeet from './pages/WhereWeMeet';
import JoinUs from './pages/JoinUs';
import SubmitStory from './pages/SubmitStory';
import LoginPage from './pages/LoginPage';
import BunnyFunRun from './pages/BunnyFunRun';
import BunnyRunRegistration from './pages/BunnyRunRegistration';
import EventBunnyRun from './pages/EventBunnyRun';
import EventSantaTour from './pages/EventSantaTour';
import EventKnightsGarden from './pages/EventKnightsGarden';
import EventBreakfast from './pages/EventBreakfast';
import EventInvoice from './pages/EventInvoice';
import SantaTracker from './pages/SantaTracker';

// Placeholder for pages not yet implemented
const PlaceholderPage = ({ title }) => (
  <div className="container section-padding" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
    <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '20px' }}>{title}</h1>
    <p className="glass-panel" style={{ padding: '20px', borderRadius: '12px', maxWidth: '500px' }}>
      This page is under construction. Features coming soon with the new Anti-Gravity platform.
    </p>
  </div>
);

import { UIProvider } from './context/UIContext';

import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <UIProvider>
      <ErrorBoundary>
        <ScrollToTop />
        <Routes>
          {/* Public Website Routes */}
          <Route
            path="*"
            element={
              <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/business-partners" element={<BusinessPartners />} />
                    <Route path="/where-we-meet" element={<WhereWeMeet />} />
                    <Route path="/join-us" element={<JoinUs />} />
                    <Route path="/event" element={<PlaceholderPage title="Events" />} />
                    <Route path="/faq" element={<PlaceholderPage title="FAQ" />} />
                    <Route path="/submit-story" element={<SubmitStory />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/bunny-fun-run" element={<BunnyFunRun />} />
                    <Route path="/bunny-run-register" element={<BunnyRunRegistration />} />

                    {/* Event Pages */}
                    <Route path="/events/bunny-run" element={<EventBunnyRun />} />
                    <Route path="/events/santa-tour" element={<EventSantaTour />} />
                    <Route path="/events/knights-garden" element={<EventKnightsGarden />} />
                    <Route path="/events/breakfast" element={<EventBreakfast />} />
                    <Route path="/events/invoice" element={<EventInvoice />} />

                    {/* Legal Routes */}
                    <Route path="/privacy-policy" element={<LegalPage docKey="privacyPolicy" />} />
                    <Route path="/terms-conditions" element={<LegalPage docKey="termsConditions" />} />
                    <Route path="/cookie-policy" element={<LegalPage docKey="cookiePolicy" />} />

                    <Route path="/santa-tracker" element={<SantaTracker />} />

                    <Route path="*" element={<PlaceholderPage title="404 - Not Found" />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />

          {/* Admin Dashboard Routes - Completely Separated */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="events/bunny-run" element={<AdminEventsBunnyRun />} />
            <Route path="events/santa-tour" element={<AdminEventsSanta />} />
            <Route path="events/knights-garden" element={<AdminEventsKnights />} />
            <Route path="events/breakfast" element={<AdminEventsBreakfast />} />
            <Route path="events/invoice" element={<AdminEventsInvoice />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="site-settings" element={<AdminSiteSettings />} />
            <Route path="home-settings" element={<AdminHomeSettings />} />
            <Route path="legals" element={<AdminLegal />} />
          </Route>

          <Route path="/members" element={<AdminLayout />}>
            <Route index element={<Admin />} />
          </Route>

        </Routes>
      </ErrorBoundary>
    </UIProvider>
  );
}

export default App;
