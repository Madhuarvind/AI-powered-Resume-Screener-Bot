import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  Eye,
  BarChart3,
  Info,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import config from '../config';

const BiasAnalysis = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fairScreeningEnabled, setFairScreeningEnabled] = useState(false);
  const [biasStats, setBiasStats] = useState({
    totalCandidates: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    avgBiasScore: 0
  });

  useEffect(() => {
    fetchCandidatesWithBias();
  }, []);

  const fetchCandidatesWithBias = async () => {
    try {
      const response = await apiService.getCandidates();
      const candidatesData = response.data.candidates;
      
      // Calculate bias statistics
      const candidatesWithBias = candidatesData.filter(c => c.bias_analysis);
      const stats = {
        totalCandidates: candidatesWithBias.length,
        highRisk: candidatesWithBias.filter(c => 
          c.bias_analysis?.overall_bias_score >= config.BIAS_THRESHOLDS.HIGH
        ).length,
        mediumRisk: candidatesWithBias.filter(c => 
          c.bias_analysis?.overall_bias_score >= config.BIAS_THRESHOLDS.MEDIUM &&
          c.bias_analysis?.overall_bias_score < config.BIAS_THRESHOLDS.HIGH
        ).length,
        lowRisk: candidatesWithBias.filter(c => 
          c.bias_analysis?.overall_bias_score < config.BIAS_THRESHOLDS.MEDIUM
        ).length,
        avgBiasScore: candidatesWithBias.length > 0 
          ? Math.round(candidatesWithBias.reduce((acc, c) => acc + (c.bias_analysis?.overall_bias_score || 0), 0) / candidatesWithBias.length)
          : 0
      };

      setCandidates(candidatesData);
      setBiasStats(stats);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load bias analysis data');
    } finally {
      setLoading(false);
    }
  };

  const toggleFairScreening = async () => {
    try {
      const newState = !fairScreeningEnabled;
      await apiService.toggleFairScreening(newState);
      setFairScreeningEnabled(newState);
      toast.success(`Fair screening ${newState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling fair screening:', error);
      toast.error('Failed to update fair screening setting');
    }
  };

  const getBiasRiskColor = (score) => {
    if (score >= config.BIAS_THRESHOLDS.HIGH) return 'text-danger-600 bg-danger-50 border-danger-200';
    if (score >= config.BIAS_THRESHOLDS.MEDIUM) return 'text-warning-600 bg-warning-50 border-warning-200';
    return 'text-success-600 bg-success-50 border-success-200';
  };

  const getBiasRiskLabel = (score) => {
    if (score >= config.BIAS_THRESHOLDS.HIGH) return 'High Risk';
    if (score >= config.BIAS_THRESHOLDS.MEDIUM) return 'Medium Risk';
    return 'Low Risk';
  };

  const getBiasRiskIcon = (score) => {
    if (score >= config.BIAS_THRESHOLDS.HIGH) return <XCircle className="h-5 w-5" />;
    if (score >= config.BIAS_THRESHOLDS.MEDIUM) return <AlertTriangle className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        <div className="flex items-center justify-center mb-6">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="bg-gradient-to-r from-warning-500 to-warning-600 p-4 rounded-2xl shadow-lg"
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>
        </div>
        
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Bias Analysis & Fair Screening
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Ensure fair and unbiased recruitment with AI-powered bias detection and blind screening capabilities
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-gradient p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Analyzed</p>
              <p className="text-3xl font-bold text-gray-900">{biasStats.totalCandidates}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-gradient p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-3xl font-bold text-danger-600">{biasStats.highRisk}</p>
            </div>
            <div className="bg-danger-100 p-3 rounded-lg">
              <XCircle className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-gradient p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medium Risk</p>
              <p className="text-3xl font-bold text-warning-600">{biasStats.mediumRisk}</p>
            </div>
            <div className="bg-warning-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-gradient p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Risk</p>
              <p className="text-3xl font-bold text-success-600">{biasStats.lowRisk}</p>
            </div>
            <div className="bg-success-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fair Screening Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fair Screening Mode</h3>
            <p className="text-gray-600">
              Enable blind recruitment to remove personal identifiers from resume analysis
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFairScreening}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              fairScreeningEnabled ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                fairScreeningEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Bias Analysis Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Bias Detection Overview</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BarChart3 className="h-4 w-4" />
            <span>Average Bias Score: {biasStats.avgBiasScore}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bias Categories */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Bias Categories Detected</h3>
            <div className="space-y-4">
              {config.BIAS_CATEGORIES.map((category) => {
                const categoryData = candidates
                  .filter(c => c.bias_analysis?.bias_categories?.[category])
                  .map(c => c.bias_analysis.bias_categories[category]);
                
                const avgScore = categoryData.length > 0 
                  ? Math.round(categoryData.reduce((acc, cat) => acc + (cat.score || 0), 0) / categoryData.length)
                  : 0;

                return (
                  <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">{category} Bias</h4>
                      <p className="text-sm text-gray-600">
                        {categoryData.length} candidates analyzed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{avgScore}%</p>
                      <p className="text-xs text-gray-500">Avg Risk</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">Use Blind Screening</p>
                    <p className="text-xs text-primary-700">Remove personal identifiers for fair evaluation</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-success-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-success-900">Focus on Skills</p>
                    <p className="text-xs text-success-700">Evaluate based on competencies and experience</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-warning-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning-900">Review High-Risk Cases</p>
                    <p className="text-xs text-warning-700">Manually review candidates with high bias scores</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Candidates with Bias Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Candidates Bias Analysis</h2>
          <Link to="/candidates" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
            <span>View All Candidates</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {candidates
            .filter(candidate => candidate.bias_analysis)
            .slice(0, 10)
            .map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg border ${getBiasRiskColor(candidate.bias_analysis.overall_bias_score)}`}>
                    {getBiasRiskIcon(candidate.bias_analysis.overall_bias_score)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {candidate.analysis?.contact_info?.name || candidate.filename}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Bias Score: {Math.round(candidate.bias_analysis.overall_bias_score)}% • 
                      Risk Level: {getBiasRiskLabel(candidate.bias_analysis.overall_bias_score)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`badge ${
                    candidate.bias_analysis.overall_bias_score >= config.BIAS_THRESHOLDS.HIGH ? 'badge-danger' :
                    candidate.bias_analysis.overall_bias_score >= config.BIAS_THRESHOLDS.MEDIUM ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {getBiasRiskLabel(candidate.bias_analysis.overall_bias_score)}
                  </span>
                  
                  <Link 
                    to={`/candidates/${candidate.id}?tab=bias`}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Analysis</span>
                  </Link>
                </div>
              </motion.div>
            ))}

          {candidates.filter(c => c.bias_analysis).length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bias analysis data available yet.</p>
              <p className="text-sm text-gray-500 mt-1">Upload resumes to see bias detection results.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Information Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-primary-900 mb-3">🛡️ About Bias Detection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-800">
          <div>
            <h4 className="font-medium mb-2">What we detect:</h4>
            <ul className="space-y-1">
              <li>• Gender-identifying information</li>
              <li>• Age-related indicators</li>
              <li>• Location and address details</li>
              <li>• Educational institution bias</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">How it helps:</h4>
            <ul className="space-y-1">
              <li>• Promotes fair recruitment practices</li>
              <li>• Reduces unconscious bias</li>
              <li>• Provides blind resume versions</li>
              <li>• Ensures compliance with diversity goals</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BiasAnalysis;
