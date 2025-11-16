import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  FileText, 
  Shield,
  ArrowRight,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCandidates();
      
      // Process real data for statistics
      const candidates = response.data.candidates || [];
      const processedStats = {
        total_candidates: candidates.length,
        categories: {
          highly_qualified: candidates.filter(c => c.analysis?.category === 'Highly Qualified').length,
          qualified: candidates.filter(c => c.analysis?.category === 'Qualified').length,
          not_a_fit: candidates.filter(c => c.analysis?.category === 'Not a Fit').length
        },
        average_scores: {
          overall_score: candidates.length > 0 ? 
            Math.round(candidates.reduce((sum, c) => sum + (c.analysis?.overall_score || 0), 0) / candidates.length) : 0
        },
        recent_uploads: candidates.filter(c => {
          const uploadDate = new Date(c.upload_date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return uploadDate >= weekAgo;
        }).length
      };
      
      setStatistics(processedStats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load dashboard statistics');
      // Set empty statistics on error
      setStatistics({
        total_candidates: 0,
        categories: { highly_qualified: 0, qualified: 0, not_a_fit: 0 },
        average_scores: { overall_score: 0 },
        recent_uploads: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Dashboard statistics cards configuration
  const stats = [
    {
      title: 'Total Candidates',
      value: statistics?.total_candidates || 0,
      icon: Users,
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-600',
      change: 12
    },
    {
      title: 'Highly Qualified',
      value: statistics?.categories?.highly_qualified || 0,
      icon: TrendingUp,
      bgColor: 'bg-success-100',
      iconColor: 'text-success-600',
      change: 8
    },
    {
      title: 'Average Score',
      value: `${statistics?.average_scores?.overall_score || 0}%`,
      icon: BarChart3,
      bgColor: 'bg-warning-100',
      iconColor: 'text-warning-600',
      change: 5
    },
    {
      title: 'Recent Uploads',
      value: statistics?.recent_uploads || 0,
      icon: Clock,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      change: -2
    }
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Highly Qualified':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'Qualified':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'Not a Fit':
        return <XCircle className="h-5 w-5 text-danger-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Highly Qualified':
        return 'badge-success';
      case 'Qualified':
        return 'badge-warning';
      case 'Not a Fit':
        return 'badge-danger';
      default:
        return 'badge-primary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Resume Screener Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          AI-powered candidate evaluation with bias detection and fair screening
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05,
                y: -5,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
              className="card-gradient p-6 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <motion.p 
                    className="text-3xl font-bold text-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                  >
                    {stat.value}
                  </motion.p>
                  {stat.change && (
                    <motion.p 
                      className={`text-sm ${stat.change > 0 ? 'text-success-600' : 'text-danger-600'}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      {stat.change > 0 ? '+' : ''}{stat.change}% from last week
                    </motion.p>
                  )}
                </div>
                <motion.div 
                  className={`p-3 rounded-lg ${stat.bgColor}`}
                  whileHover={{ 
                    rotate: [0, -10, 10, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Link to="/upload" className="group">
          <div className="card p-6 group-hover:shadow-xl transition-all duration-300 border-2 border-transparent group-hover:border-primary-200">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors duration-300">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Upload Resume</h3>
                <p className="text-sm text-gray-600">Add new candidate for analysis</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors duration-300" />
            </div>
          </div>
        </Link>

        <Link to="/candidates" className="group">
          <div className="card p-6 group-hover:shadow-xl transition-all duration-300 border-2 border-transparent group-hover:border-primary-200">
            <div className="flex items-center space-x-4">
              <div className="bg-success-100 p-3 rounded-lg group-hover:bg-success-200 transition-colors duration-300">
                <Users className="h-6 w-6 text-success-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">View Candidates</h3>
                <p className="text-sm text-gray-600">Browse all analyzed resumes</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-success-600 transition-colors duration-300" />
            </div>
          </div>
        </Link>

        <Link to="/bias-analysis" className="group">
          <div className="card p-6 group-hover:shadow-xl transition-all duration-300 border-2 border-transparent group-hover:border-primary-200">
            <div className="flex items-center space-x-4">
              <div className="bg-warning-100 p-3 rounded-lg group-hover:bg-warning-200 transition-colors duration-300">
                <Shield className="h-6 w-6 text-warning-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Bias Analysis</h3>
                <p className="text-sm text-gray-600">Fair screening insights</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-warning-600 transition-colors duration-300" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Recent Candidates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Candidates</h2>
          <Link 
            to="/candidates" 
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {recentCandidates.length > 0 ? (
            recentCandidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    {getCategoryIcon(candidate.analysis?.category)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {candidate.analysis?.contact_info?.name || candidate.filename}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Score: {candidate.analysis?.overall_score || 0}% • 
                      Uploaded {new Date(candidate.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`badge ${getCategoryColor(candidate.analysis?.category)}`}>
                    {candidate.analysis?.category || 'Pending'}
                  </span>
                  <Link 
                    to={`/candidates/${candidate.id}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No candidates yet. Upload your first resume to get started!</p>
              <Link to="/upload" className="btn-primary mt-4 inline-flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Upload Resume</span>
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
