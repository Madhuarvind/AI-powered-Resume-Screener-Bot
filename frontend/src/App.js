import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout/Layout';
import './index.css';
import './styles/themes.css';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import BulkUpload from './pages/BulkUpload';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import CandidateComparison from './pages/CandidateComparison';
import Analytics from './pages/Analytics';
import AdvancedSearch from './pages/AdvancedSearch';
import SkillsAnalytics from './pages/SkillsAnalytics';
import AIMatching from './pages/AIMatching';
import Interactive3DDashboard from './pages/Interactive3DDashboard';
import Collaboration from './pages/Collaboration';
import AIInsights from './pages/AIInsights';
import InterviewScheduler from './pages/InterviewScheduler';
import SmartRecommendations from './pages/SmartRecommendations';
import HRAssistant from './pages/HRAssistant';
import BiasAnalysis from './pages/BiasAnalysis';
import { NotificationProvider, ToastContainer } from './components/Notifications/NotificationSystem';

// Dark Mode Context
const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

const AnimatedRoute = ({ children, routeKey }) => (
  <motion.div
    key={routeKey}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

function AppRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <AnimatedRoute routeKey="landing">
              <LandingPage />
            </AnimatedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <Layout>
              <AnimatedRoute routeKey="dashboard">
                <Dashboard />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/upload" 
          element={
            <Layout>
              <AnimatedRoute routeKey="upload">
                <Upload />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/bulk-upload" 
          element={
            <Layout>
              <AnimatedRoute routeKey="bulk-upload">
                <BulkUpload />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/search" 
          element={
            <Layout>
              <AnimatedRoute routeKey="search">
                <AdvancedSearch />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/skills-analytics" 
          element={
            <Layout>
              <AnimatedRoute routeKey="skills-analytics">
                <SkillsAnalytics />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/candidates" 
          element={
            <Layout>
              <AnimatedRoute routeKey="candidates">
                <Candidates />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/candidates/:id" 
          element={
            <Layout>
              <AnimatedRoute routeKey="candidate-detail">
                <CandidateDetail />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/comparison" 
          element={
            <Layout>
              <AnimatedRoute routeKey="comparison">
                <CandidateComparison />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <Layout>
              <AnimatedRoute routeKey="analytics">
                <Analytics />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/hr-assistant" 
          element={
            <Layout>
              <AnimatedRoute routeKey="hr-assistant">
                <HRAssistant />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/ai-matching" 
          element={
            <Layout>
              <AnimatedRoute routeKey="ai-matching">
                <AIMatching />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/3d-dashboard" 
          element={
            <Layout>
              <AnimatedRoute routeKey="3d-dashboard">
                <Interactive3DDashboard />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/collaboration" 
          element={
            <Layout>
              <AnimatedRoute routeKey="collaboration">
                <Collaboration />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/ai-insights" 
          element={
            <Layout>
              <AnimatedRoute routeKey="ai-insights">
                <AIInsights />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/scheduler" 
          element={
            <Layout>
              <AnimatedRoute routeKey="scheduler">
                <InterviewScheduler />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/recommendations" 
          element={
            <Layout>
              <AnimatedRoute routeKey="recommendations">
                <SmartRecommendations />
              </AnimatedRoute>
            </Layout>
          } 
        />
        <Route 
          path="/bias-analysis" 
          element={
            <Layout>
              <AnimatedRoute routeKey="bias-analysis">
                <BiasAnalysis />
              </AnimatedRoute>
            </Layout>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
          <ToastContainer />
        </Router>
      </NotificationProvider>
    </DarkModeProvider>
  );
}

export default App;
