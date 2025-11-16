import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Menu, 
  X, 
  Home, 
  Upload, 
  Users, 
  MessageSquare, 
  Shield,
  BarChart3,
  GitCompare,
  Moon,
  Sun,
  FileText,
  Search,
  Code,
  Brain,
  Zap,
  Calendar,
  UserCheck,
  Lightbulb,
  Video,
  Target,
  MoreHorizontal
} from 'lucide-react';
import { useDarkMode } from '../../App';
import { NotificationBell } from '../Notifications/NotificationSystem';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Primary navigation items (always visible)
  const primaryNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/candidates', label: 'Candidates', icon: Users },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/hr-assistant', label: 'HR Assistant', icon: MessageSquare }
  ];

  // Secondary navigation items (in dropdown)
  const secondaryNavItems = [
    { path: '/3d-dashboard', label: '3D Dashboard', icon: Video, category: 'Advanced' },
    { path: '/ai-insights', label: 'AI Insights', icon: Brain, category: 'AI Tools' },
    { path: '/ai-matching', label: 'AI Matching', icon: Target, category: 'AI Tools' },
    { path: '/recommendations', label: 'Smart Tips', icon: Lightbulb, category: 'AI Tools' },
    { path: '/bulk-upload', label: 'Bulk Upload', icon: FileText, category: 'Upload' },
    { path: '/search', label: 'Advanced Search', icon: Search, category: 'Search' },
    { path: '/comparison', label: 'Compare', icon: GitCompare, category: 'Analysis' },
    { path: '/skills-analytics', label: 'Skills Analytics', icon: Code, category: 'Analysis' },
    { path: '/scheduler', label: 'Scheduler', icon: Calendar, category: 'Tools' },
    { path: '/collaboration', label: 'Team Collaboration', icon: UserCheck, category: 'Tools' },
    { path: '/bias-analysis', label: 'Bias Analysis', icon: Shield, category: 'Analysis' }
  ];

  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-lg"
              >
                <Bot className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold gradient-text">
                Resume Screener AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Primary Navigation Items */}
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </motion.div>
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* More Menu Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-all duration-200"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="font-medium text-sm">More</span>
              </motion.button>

              <AnimatePresence>
                {showMoreMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMoreMenu(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 max-h-96 overflow-y-auto"
                    >
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Advanced Features</h3>
                        
                        {/* Group by category */}
                        {['AI Tools', 'Analysis', 'Tools', 'Advanced', 'Upload', 'Search'].map(category => {
                          const categoryItems = secondaryNavItems.filter(item => item.category === category);
                          if (categoryItems.length === 0) return null;
                          
                          return (
                            <div key={category} className="mb-4">
                              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{category}</h4>
                              <div className="space-y-1">
                                {categoryItems.map((item) => {
                                  const Icon = item.icon;
                                  return (
                                    <Link
                                      key={item.path}
                                      to={item.path}
                                      onClick={() => setShowMoreMenu(false)}
                                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                                        isActive(item.path)
                                          ? 'text-primary-600 bg-primary-50'
                                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                      }`}
                                    >
                                      <Icon className="h-4 w-4" />
                                      <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Notifications, Dark Mode Toggle and Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            <NotificationBell />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2">
            {/* Primary Items */}
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Advanced Features</h3>
            </div>
            
            {/* Secondary Items */}
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                  <span className="text-xs text-gray-400 ml-auto">{item.category}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;
