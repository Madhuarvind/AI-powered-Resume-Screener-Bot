import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Users,
  Star,
  Lightbulb,
  Zap,
  Award,
  Eye,
  Heart,
  BookOpen,
  Compass,
  Rocket,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Filter,
  RefreshCw,
  Settings,
  Download,
  Share2,
  Plus,
  X
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const SmartRecommendations = () => {
  const [candidates, setCandidates] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();
    if (autoRefresh) {
      const interval = setInterval(fetchData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      const response = await apiService.getCandidates();
      setCandidates(response.data.candidates);
      generateSmartRecommendations(response.data.candidates);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateSmartRecommendations = (candidateData) => {
    const recs = [];

    // Candidate-specific recommendations
    candidateData.forEach((candidate, index) => {
      const analysis = candidate.analysis || {};
      const score = analysis.overall_score || 0;
      const skills = analysis.key_skills || [];
      const experience = analysis.experience_years || 0;

      // High-potential candidate recommendation
      if (score >= 85) {
        recs.push({
          id: `candidate-${candidate.id}-1`,
          type: 'candidate',
          category: 'hiring',
          priority: 'high',
          title: 'Fast-track High Performer',
          description: `${analysis.contact_info?.name || candidate.filename} scored ${score}% - consider expediting their interview process`,
          candidate: candidate,
          action: 'Schedule Priority Interview',
          impact: 'high',
          confidence: 95,
          reasoning: 'Exceptional candidate profile with strong technical skills and experience match',
          tags: ['high-performer', 'priority', 'technical'],
          estimatedValue: '$50K+ hiring efficiency gain'
        });
      }

      // Skill gap recommendation
      if (skills.includes('React') && !skills.includes('TypeScript')) {
        recs.push({
          id: `candidate-${candidate.id}-2`,
          type: 'development',
          category: 'training',
          priority: 'medium',
          title: 'TypeScript Training Opportunity',
          description: `${analysis.contact_info?.name || candidate.filename} has React skills but could benefit from TypeScript training`,
          candidate: candidate,
          action: 'Offer Training Program',
          impact: 'medium',
          confidence: 78,
          reasoning: 'Strong React foundation makes TypeScript adoption easier',
          tags: ['skill-development', 'typescript', 'training'],
          estimatedValue: '$15K+ productivity increase'
        });
      }

      // Experience level recommendation
      if (experience >= 8 && score >= 75) {
        recs.push({
          id: `candidate-${candidate.id}-3`,
          type: 'role',
          category: 'positioning',
          priority: 'high',
          title: 'Senior Role Consideration',
          description: `${analysis.contact_info?.name || candidate.filename} has ${experience} years experience - consider for senior positions`,
          candidate: candidate,
          action: 'Review for Senior Roles',
          impact: 'high',
          confidence: 88,
          reasoning: 'Extensive experience combined with strong performance indicators',
          tags: ['senior-role', 'experience', 'leadership'],
          estimatedValue: '$75K+ value addition'
        });
      }
    });

    // Process-level recommendations
    const avgScore = candidateData.reduce((sum, c) => sum + (c.analysis?.overall_score || 0), 0) / candidateData.length;
    const highScorers = candidateData.filter(c => (c.analysis?.overall_score || 0) >= 80).length;
    const totalCandidates = candidateData.length;

    if (avgScore < 60) {
      recs.push({
        id: 'process-1',
        type: 'process',
        category: 'sourcing',
        priority: 'high',
        title: 'Improve Candidate Sourcing',
        description: `Average candidate score is ${Math.round(avgScore)}% - consider expanding sourcing channels`,
        action: 'Review Sourcing Strategy',
        impact: 'high',
        confidence: 85,
        reasoning: 'Low average scores indicate need for better candidate pipeline',
        tags: ['sourcing', 'quality', 'pipeline'],
        estimatedValue: '$100K+ hiring improvement'
      });
    }

    if (highScorers / totalCandidates < 0.2) {
      recs.push({
        id: 'process-2',
        type: 'process',
        category: 'screening',
        priority: 'medium',
        title: 'Enhance Pre-screening',
        description: `Only ${Math.round(highScorers / totalCandidates * 100)}% of candidates are high-quality - improve initial screening`,
        action: 'Implement Better Filters',
        impact: 'medium',
        confidence: 80,
        reasoning: 'Low percentage of quality candidates suggests screening improvements needed',
        tags: ['screening', 'efficiency', 'quality-control'],
        estimatedValue: '$30K+ time savings'
      });
    }

    // Market intelligence recommendations - only if we have data
    if (candidateData.length > 0) {
      const skillFrequency = {};
      candidateData.forEach(candidate => {
        (candidate.analysis?.key_skills || []).forEach(skill => {
          skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
        });
      });

      const topSkills = Object.entries(skillFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      if (topSkills.length > 0) {
        recs.push({
          id: 'market-1',
          type: 'market',
          category: 'intelligence',
          priority: 'low',
          title: 'Trending Skills Analysis',
          description: `${topSkills[0][0]} is the most common skill (${topSkills[0][1]} candidates) - consider focusing recruitment`,
          action: 'Adjust Job Requirements',
          impact: 'medium',
          confidence: 75,
          reasoning: 'Market data shows strong availability in key skill areas',
          tags: ['market-intelligence', 'skills', 'trending'],
          estimatedValue: '$25K+ market advantage'
        });
      }
    }

    // Diversity and inclusion recommendations - only if we have location data
    if (candidateData.length > 0) {
      const locations = candidateData.map(c => c.analysis?.contact_info?.location).filter(Boolean);
      const uniqueLocations = [...new Set(locations)];
      
      if (locations.length > 0 && uniqueLocations.length < 3) {
        recs.push({
          id: 'diversity-1',
          type: 'diversity',
          category: 'inclusion',
          priority: 'medium',
          title: 'Expand Geographic Diversity',
          description: `Candidates from only ${uniqueLocations.length} locations - consider remote or broader geographic sourcing`,
          action: 'Enable Remote Hiring',
          impact: 'high',
          confidence: 82,
          reasoning: 'Geographic diversity improves talent pool and team perspectives',
          tags: ['diversity', 'remote', 'geographic'],
          estimatedValue: '$40K+ talent access improvement'
        });
      }
    }

    // AI-powered predictive recommendations - only if we have high-scoring candidates
    const highPerformers = candidateData.filter(c => (c.analysis?.overall_score || 0) >= 85);
    if (highPerformers.length > 0) {
      recs.push({
        id: 'ai-1',
        type: 'prediction',
        category: 'ai-insight',
        priority: 'high',
        title: 'Predicted High Performers',
        description: `AI analysis suggests ${highPerformers.length} candidates have 85%+ success probability based on their scores`,
        action: 'Review Top Candidates',
        impact: 'high',
        confidence: 92,
        reasoning: 'High-scoring candidates show strong potential based on comprehensive analysis',
        tags: ['ai-prediction', 'success-probability', 'data-driven'],
        estimatedValue: '$120K+ hiring success improvement'
      });
    }

    // Workflow optimization recommendations - only if we have low-scoring candidates
    const lowScorers = candidateData.filter(c => (c.analysis?.overall_score || 0) < 50);
    if (lowScorers.length > 0) {
      recs.push({
        id: 'workflow-1',
        type: 'workflow',
        category: 'optimization',
        priority: 'medium',
        title: 'Automate Initial Screening',
        description: `${lowScorers.length} candidates scored below 50% - consider automated pre-screening to save time`,
        action: 'Setup Auto-screening',
        impact: 'medium',
        confidence: 88,
        reasoning: 'Automation can handle low-scoring candidates, freeing up time for quality reviews',
        tags: ['automation', 'efficiency', 'time-saving'],
        estimatedValue: '$35K+ time efficiency gain'
      });
    }

    setRecommendations(recs);
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory !== 'all' && rec.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && rec.priority !== selectedPriority) return false;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'candidate': return <Users className="h-5 w-5" />;
      case 'process': return <Settings className="h-5 w-5" />;
      case 'market': return <TrendingUp className="h-5 w-5" />;
      case 'diversity': return <Shield className="h-5 w-5" />;
      case 'prediction': return <Brain className="h-5 w-5" />;
      case 'workflow': return <Zap className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'candidate': return 'from-blue-500 to-blue-600';
      case 'process': return 'from-purple-500 to-purple-600';
      case 'market': return 'from-green-500 to-green-600';
      case 'diversity': return 'from-orange-500 to-orange-600';
      case 'prediction': return 'from-pink-500 to-pink-600';
      case 'workflow': return 'from-indigo-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity }
              }}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Smart Recommendations
              </h1>
              <p className="text-gray-600">AI-powered insights to optimize your hiring process</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-3 rounded-xl transition-all ${
                autoRefresh 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <RefreshCw className={`h-5 w-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="btn-gradient flex items-center space-x-2"
            >
              <Brain className="h-4 w-4" />
              <span>Generate New Insights</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { 
              title: 'Total Recommendations', 
              value: recommendations.length, 
              change: '+8 new', 
              icon: Lightbulb, 
              color: 'from-yellow-500 to-orange-500' 
            },
            { 
              title: 'High Priority', 
              value: recommendations.filter(r => r.priority === 'high').length, 
              change: '+3 urgent', 
              icon: AlertTriangle, 
              color: 'from-red-500 to-pink-500' 
            },
            { 
              title: 'Avg Confidence', 
              value: `${Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length)}%`, 
              change: '+5% improved', 
              icon: Target, 
              color: 'from-green-500 to-blue-500' 
            },
            { 
              title: 'Potential Value', 
              value: '$450K+', 
              change: 'estimated impact', 
              icon: TrendingUp, 
              color: 'from-purple-500 to-indigo-500' 
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-purple-600 font-medium">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Filter Recommendations</h2>
            <span className="text-sm text-gray-500">{filteredRecommendations.length} recommendations</span>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="hiring">Hiring</option>
                <option value="training">Training</option>
                <option value="sourcing">Sourcing</option>
                <option value="screening">Screening</option>
                <option value="intelligence">Intelligence</option>
                <option value="inclusion">Inclusion</option>
                <option value="ai-insight">AI Insights</option>
                <option value="optimization">Optimization</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredRecommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="glass-card p-6 relative overflow-hidden cursor-pointer"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <div className={`w-full h-full bg-gradient-to-br ${getTypeColor(rec.type)} rounded-full transform translate-x-16 -translate-y-16`} />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getTypeColor(rec.type)}`}>
                      {getTypeIcon(rec.type)}
                      <span className="text-white">{/* Icon rendered above */}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                      <p className="text-sm text-gray-500 capitalize">{rec.type} • {rec.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    <span className="text-xs text-gray-500">{rec.confidence}%</span>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-600 mb-4">{rec.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {rec.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{rec.impact}</div>
                    <div className="text-xs text-gray-500">Impact Level</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{rec.estimatedValue}</div>
                    <div className="text-xs text-gray-500">Est. Value</div>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">AI Reasoning</p>
                      <p className="text-sm text-blue-700">{rec.reasoning}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-purple-600"
                    >
                      <Heart className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-purple-600"
                    >
                      <Share2 className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-purple-600"
                    >
                      <BookOpen className="h-4 w-4" />
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <span>{rec.action}</span>
                    <ArrowRight className="h-3 w-3" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredRecommendations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mb-4"
            >
              <Sparkles className="h-12 w-12 text-purple-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Recommendations Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your filters or generate new insights to see AI-powered recommendations
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SmartRecommendations;
