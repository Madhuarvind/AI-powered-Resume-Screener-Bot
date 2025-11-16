import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  Eye,
  Star,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Layers,
  Compass,
  Rocket,
  Users,
  Award,
  Clock,
  Filter,
  RefreshCw,
  Download,
  Settings,
  Play,
  Pause,
  Volume2,
  Maximize,
  Minimize,
  ChevronRight,
  ChevronDown,
  Info,
  X,
  Plus
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const AIInsights = () => {
  const [candidates, setCandidates] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedSections, setExpandedSections] = useState(['predictions', 'recommendations']);

  useEffect(() => {
    fetchData();
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange]);

  const fetchData = async () => {
    try {
      const response = await apiService.getCandidates();
      setCandidates(response.data.candidates);
      generateAIInsights(response.data.candidates);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = (candidateData) => {
    // Advanced AI analysis simulation
    const totalCandidates = candidateData.length;
    const avgScore = candidateData.reduce((sum, c) => sum + (c.analysis?.overall_score || 0), 0) / totalCandidates;
    
    // Skills analysis
    const skillsMap = {};
    const experienceMap = {};
    const locationMap = {};
    
    candidateData.forEach(candidate => {
      const analysis = candidate.analysis || {};
      
      // Skills frequency
      (analysis.key_skills || []).forEach(skill => {
        skillsMap[skill] = (skillsMap[skill] || 0) + 1;
      });
      
      // Experience distribution
      const exp = analysis.experience_years || 0;
      const expRange = exp < 2 ? 'Junior' : exp < 5 ? 'Mid' : exp < 10 ? 'Senior' : 'Expert';
      experienceMap[expRange] = (experienceMap[expRange] || 0) + 1;
      
      // Location analysis
      const location = analysis.contact_info?.location || 'Unknown';
      locationMap[location] = (locationMap[location] || 0) + 1;
    });

    const topSkills = Object.entries(skillsMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count, percentage: (count / totalCandidates * 100).toFixed(1) }));

    // Generate AI predictions based on real data
    const predictions = [];
    
    if (topSkills.length > 0) {
      predictions.push({
        id: 1,
        type: 'trend',
        title: 'Top Skill Trend',
        description: `${topSkills[0].skill} appears in ${topSkills[0].count} candidates - strong market availability`,
        confidence: 85,
        impact: 'medium',
        timeframe: 'Current',
        category: 'skills'
      });
    }
    
    if (totalCandidates > 0) {
      const qualityTrend = avgScore > 70 ? 'improving' : avgScore > 50 ? 'stable' : 'declining';
      predictions.push({
        id: 2,
        type: 'quality',
        title: 'Candidate Quality Analysis',
        description: `Average candidate score is ${avgScore}% - quality appears to be ${qualityTrend}`,
        confidence: 90,
        impact: avgScore > 70 ? 'high' : 'medium',
        timeframe: 'Current period',
        category: 'quality'
      });
    }
    
    if (experienceMap.Senior && experienceMap.Senior > totalCandidates * 0.3) {
      predictions.push({
        id: 3,
        type: 'market',
        title: 'Senior Talent Availability',
        description: `${experienceMap.Senior} senior candidates available - good market conditions`,
        confidence: 82,
        impact: 'high',
        timeframe: 'Current',
        category: 'market'
      });
    }

    // Generate recommendations based on real data
    const recommendations = [];
    
    if (totalCandidates < 10) {
      recommendations.push({
        id: 1,
        type: 'action',
        title: 'Expand Candidate Pool',
        description: `Only ${totalCandidates} candidates in database - consider expanding sourcing efforts`,
        priority: 'high',
        effort: 'medium',
        impact: 'high',
        category: 'sourcing'
      });
    }
    
    const highScorers = candidateData.filter(c => (c.analysis?.overall_score || 0) >= 85).length;
    if (highScorers > 0) {
      recommendations.push({
        id: 2,
        type: 'process',
        title: 'Fast-track High Performers',
        description: `${highScorers} candidates scored above 85% - consider expedited interview process`,
        priority: 'high',
        effort: 'low',
        impact: 'high',
        category: 'process'
      });
    }
    
    if (topSkills.length > 0 && topSkills[0].count > 1) {
      recommendations.push({
        id: 3,
        type: 'strategy',
        title: 'Leverage Skill Trends',
        description: `Focus on ${topSkills[0].skill} - appears in ${topSkills[0].count} candidates`,
        priority: 'medium',
        effort: 'low',
        impact: 'medium',
        category: 'strategy'
      });
    }

    const marketInsights = {
      salaryTrends: {
        average: 'N/A',
        change: 'No data',
        trend: 'neutral'
      },
      competitionLevel: {
        score: totalCandidates > 0 ? Math.min(100, totalCandidates * 10) : 0,
        level: totalCandidates > 10 ? 'High' : totalCandidates > 5 ? 'Medium' : 'Low',
        change: 'Based on candidate pool'
      },
      timeToHire: {
        average: 'N/A',
        change: 'No tracking data',
        trend: 'neutral'
      }
    };

    // Generate risk factors based on real data
    const riskFactors = [];
    
    if (totalCandidates < 5) {
      riskFactors.push({
        type: 'high',
        title: 'Candidate Pool Risk',
        description: `Only ${totalCandidates} candidates available - limited selection`,
        probability: 90,
        mitigation: 'Expand sourcing channels and recruitment efforts'
      });
    }
    
    if (avgScore < 60) {
      riskFactors.push({
        type: 'medium',
        title: 'Quality Risk',
        description: `Average candidate score is ${avgScore}% - below optimal threshold`,
        probability: 75,
        mitigation: 'Improve screening criteria and sourcing quality'
      });
    }
    
    const incompleteProfiles = candidateData.filter(c => 
      !c.analysis?.contact_info?.email || 
      !(c.analysis?.key_skills || []).length
    ).length;
    
    if (incompleteProfiles > totalCandidates * 0.3) {
      riskFactors.push({
        type: 'low',
        title: 'Data Quality Risk',
        description: `${incompleteProfiles} candidates have incomplete profiles`,
        probability: 60,
        mitigation: 'Improve data collection and profile completion processes'
      });
    }

    setInsights({
      overview: {
        totalCandidates,
        avgScore: Math.round(avgScore),
        topSkills,
        experienceDistribution: Object.entries(experienceMap),
        locationDistribution: Object.entries(locationMap)
      },
      predictions,
      recommendations,
      marketInsights,
      riskFactors,
      lastUpdated: new Date()
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (type) => {
    switch (type) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
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
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl"
            >
              <Brain className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Insights Dashboard
              </h1>
              <p className="text-gray-600">Advanced artificial intelligence analysis and predictions</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>

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
              {autoRefresh ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="btn-gradient flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Overview Cards */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Insights',
                value: insights.predictions.length + insights.recommendations.length,
                change: '+15%',
                icon: Lightbulb,
                color: 'from-yellow-500 to-orange-500'
              },
              {
                title: 'Avg Confidence',
                value: `${Math.round(insights.predictions.reduce((sum, p) => sum + p.confidence, 0) / insights.predictions.length)}%`,
                change: '+8%',
                icon: Target,
                color: 'from-green-500 to-blue-500'
              },
              {
                title: 'High Priority',
                value: insights.recommendations.filter(r => r.priority === 'high').length,
                change: '+3',
                icon: AlertTriangle,
                color: 'from-red-500 to-pink-500'
              },
              {
                title: 'Market Score',
                value: insights.marketInsights.competitionLevel.score,
                change: insights.marketInsights.competitionLevel.change,
                icon: TrendingUp,
                color: 'from-purple-500 to-indigo-500'
              }
            ].map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                  className="glass-card p-6 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                      <motion.p 
                        className="text-3xl font-bold text-gray-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      >
                        {card.value}
                      </motion.p>
                      <p className="text-sm text-green-600 font-medium">{card.change} from last period</p>
                    </div>
                    <motion.div 
                      className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* AI Predictions */}
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('predictions')}
            >
              <div className="flex items-center space-x-3">
                <Rocket className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">AI Predictions</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {insights.predictions.length} insights
                </span>
              </div>
              {expandedSections.includes('predictions') ? 
                <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                <ChevronRight className="h-5 w-5 text-gray-500" />
              }
            </div>

            <AnimatePresence>
              {expandedSections.includes('predictions') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 space-y-4"
                >
                  {insights.predictions.map((prediction, index) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{prediction.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                              {prediction.confidence}% confidence
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              prediction.impact === 'high' ? 'bg-red-100 text-red-800' :
                              prediction.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {prediction.impact} impact
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{prediction.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{prediction.timeframe}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Layers className="h-4 w-4" />
                              <span>{prediction.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <Star className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* AI Recommendations */}
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('recommendations')}
            >
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Smart Recommendations</h2>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {insights.recommendations.filter(r => r.priority === 'high').length} high priority
                </span>
              </div>
              {expandedSections.includes('recommendations') ? 
                <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                <ChevronRight className="h-5 w-5 text-gray-500" />
              }
            </div>

            <AnimatePresence>
              {expandedSections.includes('recommendations') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {insights.recommendations.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{rec.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Effort:</span>
                          <span className="font-medium">{rec.effort}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Impact:</span>
                          <span className="font-medium">{rec.impact}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Category:</span>
                          <span className="font-medium">{rec.category}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                        >
                          Implement
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-purple-600"
                        >
                          <Info className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Risk Assessment */}
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Risk Assessment</h2>
            </div>

            <div className="space-y-4">
              {insights.riskFactors.map((risk, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-l-4 rounded-lg p-4 ${getRiskColor(risk.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{risk.title}</h3>
                        <span className="text-sm text-gray-500">({risk.probability}% probability)</span>
                      </div>
                      <p className="text-gray-600 mb-2">{risk.description}</p>
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700">Mitigation:</p>
                        <p className="text-sm text-gray-600">{risk.mitigation}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        risk.type === 'high' ? 'bg-red-100' :
                        risk.type === 'medium' ? 'bg-yellow-100' :
                        'bg-green-100'
                      }`}>
                        <span className={`text-2xl font-bold ${
                          risk.type === 'high' ? 'text-red-600' :
                          risk.type === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {risk.probability}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Market Intelligence */}
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Compass className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Market Intelligence</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${insights.marketInsights.salaryTrends.average.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mb-1">Average Salary</div>
                <div className="text-sm text-green-600 font-medium">
                  {insights.marketInsights.salaryTrends.change} vs last quarter
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {insights.marketInsights.competitionLevel.score}
                </div>
                <div className="text-sm text-gray-600 mb-1">Competition Level</div>
                <div className="text-sm text-purple-600 font-medium">
                  {insights.marketInsights.competitionLevel.level} intensity
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {insights.marketInsights.timeToHire.average} days
                </div>
                <div className="text-sm text-gray-600 mb-1">Avg Time to Hire</div>
                <div className="text-sm text-green-600 font-medium">
                  {insights.marketInsights.timeToHire.change} improvement
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
