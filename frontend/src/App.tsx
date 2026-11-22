import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main Layout to control viewport height and footer visibility
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const isChatPage = pathname.includes('/messages');

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-50 selection:bg-brand-500 selection:text-white ${
        isChatPage ? 'h-screen overflow-hidden' : 'overflow-x-hidden'
      }`}
    >
      <Navbar />
      <main className={`flex-1 ${isChatPage ? 'overflow-hidden flex flex-col' : ''}`}>
        {children}
      </main>
      {!isChatPage && <Footer />}
    </div>
  );
};

// Public Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { InstagramCallback } from './pages/InstagramCallback';

// Creator Pages
import { CreatorDashboard } from './pages/CreatorDashboard';
import { CreatorExplore } from './pages/CreatorExplore';
import { CreatorApplications } from './pages/CreatorApplications';
import { CreatorProfilePage } from './pages/CreatorProfilePage';

// Merchant Pages
import { MerchantDashboard } from './pages/MerchantDashboard';
import { MerchantCampaigns } from './pages/MerchantCampaigns';
import { MerchantCreateCampaign } from './pages/MerchantCreateCampaign';
import { MerchantCampaignDetail } from './pages/MerchantCampaignDetail';
import { MerchantCreatorDirectory } from './pages/MerchantCreatorDirectory';
import { MerchantCreatorDetail } from './pages/MerchantCreatorDetail';
import { MerchantProfilePage } from './pages/MerchantProfilePage';

// Collaboration Chat
import { CollabMessagesPage } from './pages/CollabMessagesPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback/instagram" element={<InstagramCallback />} />
            <Route path="/explore" element={<CreatorExplore />} />
            <Route path="/creators" element={<MerchantCreatorDirectory />} />

            {/* Shared Protected Collab Chat Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/messages" element={<CollabMessagesPage />} />
            </Route>

            {/* Creator Protected Routes */}
            <Route element={<ProtectedRoute allowedRole="CREATOR" />}>
              <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              <Route path="/creator/explore" element={<CreatorExplore />} />
              <Route path="/creator/applications" element={<CreatorApplications />} />
              <Route path="/creator/profile" element={<CreatorProfilePage />} />
              <Route path="/creator/messages" element={<CollabMessagesPage />} />
            </Route>

            {/* Merchant Protected Routes */}
            <Route element={<ProtectedRoute allowedRole="MERCHANT" />}>
              <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
              <Route path="/merchant/campaigns" element={<MerchantCampaigns />} />
              <Route path="/merchant/campaigns/new" element={<MerchantCreateCampaign />} />
              <Route path="/merchant/campaigns/:id" element={<MerchantCampaignDetail />} />
              <Route path="/merchant/creators" element={<MerchantCreatorDirectory />} />
              <Route path="/merchant/creators/:id" element={<MerchantCreatorDetail />} />
              <Route path="/merchant/profile" element={<MerchantProfilePage />} />
              <Route path="/merchant/messages" element={<CollabMessagesPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
