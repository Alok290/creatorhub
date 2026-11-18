import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

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
import { MerchantProfilePage } from './pages/MerchantProfilePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback/instagram" element={<InstagramCallback />} />
              <Route path="/explore" element={<CreatorExplore />} />
              <Route path="/creators" element={<MerchantCreatorDirectory />} />

              {/* Creator Protected Routes */}
              <Route element={<ProtectedRoute allowedRole="CREATOR" />}>
                <Route path="/creator/dashboard" element={<CreatorDashboard />} />
                <Route path="/creator/explore" element={<CreatorExplore />} />
                <Route path="/creator/applications" element={<CreatorApplications />} />
                <Route path="/creator/profile" element={<CreatorProfilePage />} />
              </Route>

              {/* Merchant Protected Routes */}
              <Route element={<ProtectedRoute allowedRole="MERCHANT" />}>
                <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
                <Route path="/merchant/campaigns" element={<MerchantCampaigns />} />
                <Route path="/merchant/campaigns/new" element={<MerchantCreateCampaign />} />
                <Route path="/merchant/campaigns/:id" element={<MerchantCampaignDetail />} />
                <Route path="/merchant/creators" element={<MerchantCreatorDirectory />} />
                <Route path="/merchant/profile" element={<MerchantProfilePage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

