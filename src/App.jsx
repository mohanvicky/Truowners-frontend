import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import Layout from './components/common/Layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import HomePage from './components/pages/Home/HomePage'
import OwnerDashboard from './components/pages/Owner/OwnerDashboard'
import AdminDashboard from './components/pages/Admin/AdminDashboard'
import SecretAdminAccess from './components/pages/Admin/SecretAdminAccess'
import PropertyDetailsPage from './components/pages/Property/PropertyDetailsPage'
import WishlistPage from './components/pages/Wishlist/WishlistPage'
import ContactPage from './components/pages/other/ContactPage'
import AboutPage from './components/pages/other/AboutPage'
import TermsAndConditions from './components/pages/other/TermConditionPage'
import PrivacyPolicy from './components/pages/other/PrivacyPolicyPage'
import FaqPage from './components/pages/other/FaqPage'
import './styles/globals.css'
import './styles/components.css'
import ScrollToTop from './components/common/ScrollToTop';
import MyBookings from './components/pages/bookings/MyBookings'
import Properties from './components/pages/Property/Properties'

function AppContent() {
  const { user, isAuthenticated } = useAuth()

  // Show Owner Dashboard for logged-in owners
  if (isAuthenticated && user?.role === 'owner') {
    return (
      <Layout>
        <ErrorBoundary>
          <OwnerDashboard />
        </ErrorBoundary>
      </Layout>
    )
  }

  // Show regular HomePage for other users
  return (
    <Layout>
      <ErrorBoundary>
        <HomePage />
      </ErrorBoundary>
    </Layout>
  )
}

// Helper component to wrap routes with Layout and ErrorBoundary
const LayoutWrapper = ({ children }) => (
  <Layout>
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </Layout>
)

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminAuthProvider>
          <Router>
          <ScrollToTop />
            <Routes>
              {/* Main App Route */}
              <Route path="/" element={<AppContent />} />

              {/* Public Pages */}
              <Route path="/contact" element={<LayoutWrapper><ContactPage /></LayoutWrapper>} />
              <Route path="/about" element={<LayoutWrapper><AboutPage /></LayoutWrapper>} />
              <Route path="/privacy" element={<LayoutWrapper><PrivacyPolicy /></LayoutWrapper>} />
              <Route path="/termcondition" element={<LayoutWrapper><TermsAndConditions /></LayoutWrapper>} />
              <Route path="/faq" element={<LayoutWrapper><FaqPage /></LayoutWrapper>} />
              <Route path="/properties" element={<LayoutWrapper><Properties /></LayoutWrapper>} />

              {/* Property & User Pages */}
              <Route path="/property/:id" element={<LayoutWrapper><PropertyDetailsPage /></LayoutWrapper>} />
              <Route path="/wishlist" element={<LayoutWrapper><WishlistPage /></LayoutWrapper>} />
              <Route path="/my-bookings" element={<LayoutWrapper><MyBookings /></LayoutWrapper>}/>

              {/* Admin Routes */}
              <Route 
                path="/system/admin/secure-access-portal-2025" 
                element={<ErrorBoundary><SecretAdminAccess /></ErrorBoundary>} 
              />
              <Route 
                path="/admin/dashboard" 
                element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} 
              />

              {/* Fallback Route */}
              <Route path="*" element={<AppContent />} />
            </Routes>
          </Router>
        </AdminAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App