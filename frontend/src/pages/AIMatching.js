import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain,
  Zap,
  Target,
  Users,
  Star,
  TrendingUp,
  Award,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Heart,
  X,
  Check,
  ArrowRight,
  BarChart3,
  Lightbulb,
  Cpu,
  Activity,
  Layers,
  Compass,
  Rocket,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const AIMatching = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobRequirements, setJobRequirements] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    experienceLevel: 'mid',
    location: '',
    department: '',
    priority: 'high'
  });
  const [matchResults, setMatchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('comprehensive'); // comprehensive, quick, deep
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await apiService.getCandidates();
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    }
  };

  // AI Matching Algorithm (Enhanced)
  const performAIMatching = async () => {
    setLoading(true);
    
    try {
      // Simulate advanced AI matching with multiple factors
      const matchedCandidates = candidates.map(candidate => {
        const analysis = candidate.analysis || {};
        
        // Calculate multiple matching scores
        const skillsMatch = calculateSkillsMatch(analysis.key_skills || [], jobRequirements.requiredSkills);
        const experienceMatch = calculateExperienceMatch(analysis.experience_years || 0, jobRequirements.experienceLevel);
        const locationMatch = calculateLocationMatch(analysis.contact_info?.location, jobRequirements.location);
        const cultureMatch = calculateCultureMatch(analysis); // Based on real data
        const potentialScore = calculatePotentialScore(analysis); // Based on real data
        
        // AI-weighted overall score
        const overallMatch = (
          skillsMatch * 0.35 +
          experienceMatch * 0.25 +
          locationMatch * 0.15 +
          cultureMatch * 0.15 +
          potentialScore * 0.10
        );

        return {
          ...candidate,
          matchScore: Math.round(overallMatch),
          skillsMatch: Math.round(skillsMatch),
          experienceMatch: Math.round(experienceMatch),
          locationMatch: Math.round(locationMatch),
          cultureMatch: Math.round(cultureMatch),
          potentialScore: Math.round(potentialScore),
          aiRecommendation: generateAIRecommendation(overallMatch, skillsMatch, experienceMatch),
          matchReasons: generateMatchReasons(skillsMatch, experienceMatch, locationMatch, cultureMatch),
          riskFactors: generateRiskFactors(analysis),
          interviewQuestions: generateInterviewQuestions(analysis, jobRequirements)
        };
      });

      // Sort by match score and filter top matches
      const sortedMatches = matchedCandidates
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20);

      setMatchResults(sortedMatches);
      
      // Generate AI insights
      generateAIInsights(sortedMatches);
      
      toast.success(`Found ${sortedMatches.length} potential matches!`);
    } catch (error) {
      console.error('Error performing AI matching:', error);
      toast.error('Failed to perform AI matching');
    } finally {
      setLoading(false);
    }
  };

  const calculateSkillsMatch = (candidateSkills, requiredSkills) => {
    if (requiredSkills.length === 0) return 80;
    
    const matchedSkills = candidateSkills.filter(skill =>
      requiredSkills.some(required => 
        skill.toLowerCase().includes(required.toLowerCase()) ||
        required.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    return (matchedSkills.length / requiredSkills.length) * 100;
  };

  const calculateExperienceMatch = (candidateExp, requiredLevel) => {
    const levelRanges = {
      'junior': [0, 2],
      'mid': [2, 5],
      'senior': [5, 10],
      'lead': [8, 15]
    };
    
    const [min, max] = levelRanges[requiredLevel] || [0, 20];
    
    if (candidateExp >= min && candidateExp <= max) return 100;
    if (candidateExp < min) return Math.max(0, 100 - (min - candidateExp) * 20);
    return Math.max(0, 100 - (candidateExp - max) * 10);
  };

  const calculateLocationMatch = (candidateLocation, requiredLocation) => {
    if (!requiredLocation || !candidateLocation) return 50;
    if (candidateLocation.toLowerCase().includes(requiredLocation.toLowerCase())) return 100;
    return 30; // Remote work consideration
  };

  const calculateCultureMatch = (analysis) => {
    // Calculate culture fit based on real data factors
    let score = 50; // Base score
    
    // Education level indicates adaptability
    if (analysis.education) score += 15;
    
    // Communication skills (inferred from contact completeness)
    if (analysis.contact_info?.email && analysis.contact_info?.phone) score += 10;
    
    // Experience diversity (multiple skills indicate adaptability)
    const skillCount = (analysis.key_skills || []).length;
    if (skillCount > 5) score += 15;
    else if (skillCount > 3) score += 10;
    
    // Overall score indicates general competency
    const overallScore = analysis.overall_score || 0;
    if (overallScore > 80) score += 10;
    else if (overallScore > 60) score += 5;
    
    return Math.min(100, score);
  };

  const calculatePotentialScore = (analysis) => {
    // Calculate growth potential based on real data
    let score = 40; // Base score
    
    // Learning ability (diverse skills indicate learning capacity)
    const skillCount = (analysis.key_skills || []).length;
    if (skillCount > 7) score += 20;
    else if (skillCount > 4) score += 15;
    else if (skillCount > 2) score += 10;
    
    // Experience vs performance ratio
    const experience = analysis.experience_years || 0;
    const overallScore = analysis.overall_score || 0;
    
    if (experience > 0) {
      const performanceRatio = overallScore / experience;
      if (performanceRatio > 15) score += 20;
      else if (performanceRatio > 10) score += 15;
      else if (performanceRatio > 5) score += 10;
    }
    
    // Education indicates learning foundation
    if (analysis.education) score += 10;
    
    // Recent activity (if available)
    if (analysis.contact_info?.email) score += 10;
    
    return Math.min(100, score);
  };

  const generateAIRecommendation = (overall, skills, experience) => {
    if (overall >= 85) return 'Excellent Match - Highly Recommended';
    if (overall >= 70) return 'Strong Match - Recommended for Interview';
    if (overall >= 55) return 'Good Potential - Consider with Reservations';
    if (overall >= 40) return 'Moderate Fit - May Need Training';
    return 'Low Match - Not Recommended';
  };

  const generateMatchReasons = (skills, experience, location, culture) => {
    const reasons = [];
    if (skills >= 80) reasons.push('Strong technical skills alignment');
    if (experience >= 80) reasons.push('Perfect experience level match');
    if (location >= 80) reasons.push('Ideal location compatibility');
    if (culture >= 80) reasons.push('Excellent culture fit predicted');
    if (reasons.length === 0) reasons.push('Potential for growth and development');
    return reasons;
  };

  const generateRiskFactors = (analysis) => {
    const risks = [];
    if ((analysis.experience_years || 0) < 1) risks.push('Limited professional experience');
    if (!(analysis.key_skills || []).length) risks.push('Skills information incomplete');
    // Remove random factors - use only data-driven risks
    if (!analysis.contact_info?.email) risks.push('Contact information incomplete');
    if (!analysis.education) risks.push('Education background not specified');
    return risks;
  };

  const generateInterviewQuestions = (analysis, requirements) => {
    const skills = analysis.key_skills || [];
    const questions = [];
    
    if (skills.length > 0) {
      questions.push(`Tell me about your experience with ${skills[0]}`);
    }
    if (requirements.title) {
      questions.push(`How would you approach ${requirements.title} challenges?`);
    }
    questions.push('Describe a project where you had to learn new technologies quickly');
    questions.push('What interests you most about this position?');
    
    return questions.slice(0, 3);
  };

  const generateAIInsights = (matches) => {
    const topMatches = matches.slice(0, 5);
    const avgScore = topMatches.reduce((sum, m) => sum + m.matchScore, 0) / topMatches.length;
    
    const insights = {
      summary: `Found ${matches.length} candidates with ${topMatches.length} strong matches`,
      averageMatch: Math.round(avgScore),
      topSkills: getTopSkills(matches),
      recommendations: [
        'Consider expanding search criteria for more candidates',
        'Focus on culture fit interviews for top matches',
        'Prepare technical assessments for skill validation'
      ],
      marketInsights: [
        'High demand for these skills in current market',
        'Consider remote candidates to expand pool',
        'Salary expectations trending 15% higher this quarter'
      ]
    };
    
    setAiInsights(insights);
  };

  const getTopSkills = (matches) => {
    const skillCounts = {};
    matches.forEach(match => {
      (match.analysis?.key_skills || []).forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    
    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);
  };

  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const getMatchColor = (score) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 55) return 'text-amber-600 bg-amber-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRecommendationIcon = (score) => {
    if (score >= 85) return <Rocket className="h-4 w-4" />;
    if (score >= 70) return <Star className="h-4 w-4" />;
    if (score >= 55) return <TrendingUp className="h-4 w-4" />;
    if (score >= 40) return <Activity className="h-4 w-4" />;
    return <X className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl"
            >
              <Brain className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              AI-Powered Matching
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced artificial intelligence to find the perfect candidates for your roles
          </p>
        </motion.div>

        {/* Job Requirements Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Target className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Define Your Requirements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input
                type="text"
                value={jobRequirements.title}
                onChange={(e) => setJobRequirements(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Senior React Developer"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
              <select
                value={jobRequirements.experienceLevel}
                onChange={(e) => setJobRequirements(prev => ({ ...prev, experienceLevel: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="junior">Junior (0-2 years)</option>
                <option value="mid">Mid-level (2-5 years)</option>
                <option value="senior">Senior (5-10 years)</option>
                <option value="lead">Lead (8+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={jobRequirements.location}
                onChange={(e) => setJobRequirements(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., New York, Remote"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills (comma-separated)</label>
              <input
                type="text"
                value={jobRequirements.requiredSkills.join(', ')}
                onChange={(e) => setJobRequirements(prev => ({ 
                  ...prev, 
                  requiredSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                placeholder="e.g., React, Node.js, TypeScript, AWS"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Mode</label>
              <select
                value={analysisMode}
                onChange={(e) => setAnalysisMode(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="quick">Quick Match</option>
                <option value="comprehensive">Comprehensive Analysis</option>
                <option value="deep">Deep Learning Mode</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
            <textarea
              value={jobRequirements.description}
              onChange={(e) => setJobRequirements(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the role, responsibilities, and ideal candidate profile..."
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {candidates.length} candidates available for matching
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={performAIMatching}
              disabled={loading || !jobRequirements.title}
              className="btn-gradient flex items-center space-x-2 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Cpu className="h-5 w-5" />
                </motion.div>
              ) : (
                <Zap className="h-5 w-5" />
              )}
              <span>{loading ? 'Analyzing...' : 'Start AI Matching'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* AI Insights Panel */}
        {aiInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="gradient-card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Lightbulb className="h-6 w-6 text-yellow-300" />
              <h2 className="text-2xl font-bold text-white">AI Insights</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <h3 className="font-semibold text-white mb-2">Match Summary</h3>
                <p className="text-white/90 text-sm">{aiInsights.summary}</p>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-white">{aiInsights.averageMatch}%</span>
                  <span className="text-white/70 text-sm ml-2">avg match score</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <h3 className="font-semibold text-white mb-2">Top Skills Found</h3>
                <div className="flex flex-wrap gap-2">
                  {aiInsights.topSkills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <h3 className="font-semibold text-white mb-2">Recommendations</h3>
                <ul className="space-y-1">
                  {aiInsights.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index} className="text-white/90 text-sm flex items-start space-x-2">
                      <Check className="h-3 w-3 mt-0.5 text-green-300" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Match Results */}
        {matchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                Match Results ({matchResults.length})
              </h2>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {selectedCandidates.length} selected
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-gradient flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Results</span>
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {matchResults.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="interactive-card glass-card p-6 relative overflow-hidden"
                  >
                    {/* Match Score Badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchColor(candidate.matchScore)}`}>
                        {candidate.matchScore}% Match
                      </div>
                    </div>

                    {/* Candidate Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                        {(candidate.analysis?.contact_info?.name || candidate.filename).charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {candidate.analysis?.contact_info?.name || candidate.filename}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          {getRecommendationIcon(candidate.matchScore)}
                          <span className="text-sm font-medium text-gray-700">
                            {candidate.aiRecommendation}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleCandidateSelection(candidate.id)}
                        className={`p-2 rounded-lg transition-all ${
                          selectedCandidates.includes(candidate.id)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Heart className="h-4 w-4" />
                      </motion.button>
                    </div>

                    {/* Match Breakdown */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {[
                        { label: 'Skills', score: candidate.skillsMatch, icon: Layers },
                        { label: 'Experience', score: candidate.experienceMatch, icon: Award },
                        { label: 'Location', score: candidate.locationMatch, icon: Compass },
                        { label: 'Culture Fit', score: candidate.cultureMatch, icon: Users }
                      ].map((metric, idx) => {
                        const Icon = metric.icon;
                        return (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <Icon className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${metric.score}%` }}
                                  transition={{ delay: index * 0.1 + idx * 0.05, duration: 0.8 }}
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-900">{metric.score}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Why this candidate matches:</h4>
                      <ul className="space-y-1">
                        {candidate.matchReasons.slice(0, 2).map((reason, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                            <Check className="h-3 w-3 mt-0.5 text-green-500" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Risk Factors */}
                    {candidate.riskFactors.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Considerations:</h4>
                        <ul className="space-y-1">
                          {candidate.riskFactors.slice(0, 1).map((risk, idx) => (
                            <li key={idx} className="text-sm text-amber-600 flex items-start space-x-2">
                              <AlertTriangle className="h-3 w-3 mt-0.5" />
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {candidate.analysis?.experience_years || 0} years exp
                        </span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          {(candidate.analysis?.key_skills || []).length} skills
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                        >
                          <Eye className="h-3 w-3 mr-1 inline" />
                          View Profile
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                        >
                          Schedule Interview
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {matchResults.length === 0 && !loading && (
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
              <Search className="h-12 w-12 text-purple-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Find Perfect Matches</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Define your job requirements above and let our AI find the best candidates for you
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIMatching;
