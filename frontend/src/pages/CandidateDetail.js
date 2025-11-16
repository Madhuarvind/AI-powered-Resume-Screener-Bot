import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Shield,
  Eye,
  EyeOff,
  Send,
  Bot
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import config from '../config';

const CandidateDetail = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [candidate, setCandidate] = useState(null);
  const [biasAnalysis, setBiasAnalysis] = useState(null);
  const [blindResume, setBlindResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showBlindResume, setShowBlindResume] = useState(false);

  // Format AI responses for better display
  const formatAIResponse = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
      .replace(/(\d+\.\s)/g, '<br/><strong>$1</strong>') // Numbered lists
      .replace(/(-\s)/g, '<br/>• ') // Bullet points
      .replace(/\n/g, '<br/>') // Line breaks
      .replace(/^<br\/>/, ''); // Remove leading break
  };

  useEffect(() => {
    fetchCandidateData();
  }, [id]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const fetchCandidateData = async () => {
    try {
      const [candidateResponse, biasResponse] = await Promise.all([
        apiService.getCandidate(id),
        apiService.getBiasAnalysis(id).catch(() => null) // Don't fail if bias analysis is not available
      ]);

      setCandidate(candidateResponse.data.candidate);
      
      if (biasResponse) {
        setBiasAnalysis(biasResponse.data.bias_analysis);
      }

      // Fetch blind resume if bias analysis exists
      if (biasResponse?.data.bias_analysis) {
        try {
          const blindResponse = await apiService.getBlindResume(id);
          setBlindResume(blindResponse.data.blind_resume);
        } catch (error) {
          console.error('Error fetching blind resume:', error);
        }
      }

    } catch (error) {
      console.error('Error fetching candidate data:', error);
      toast.error('Failed to load candidate data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isChatLoading) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setIsChatLoading(true);

    // Add user message to chat
    const newUserMessage = {
      type: 'user',
      message: userMessage,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await apiService.chatWithCandidate(id, userMessage);
      
      // Add AI response to chat
      const aiMessage = {
        type: 'ai',
        message: response.data.response,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Add error message
      const errorMessage = {
        type: 'ai',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Highly Qualified':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'Qualified':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'Not a Fit':
        return <XCircle className="h-5 w-5 text-danger-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
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

  const getBiasRiskColor = (score) => {
    if (score >= config.BIAS_THRESHOLDS.HIGH) return 'text-danger-600 bg-danger-50';
    if (score >= config.BIAS_THRESHOLDS.MEDIUM) return 'text-warning-600 bg-warning-50';
    return 'text-success-600 bg-success-50';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'analysis', label: 'AI Analysis', icon: TrendingUp },
    { id: 'bias', label: 'Bias Analysis', icon: Shield },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Candidate not found</h2>
        <p className="text-gray-600 mb-6">The candidate you're looking for doesn't exist.</p>
        <Link to="/candidates" className="btn-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Link
            to="/candidates"
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {candidate.analysis?.contact_info?.name || candidate.filename}
            </h1>
            <p className="text-gray-600">
              Uploaded {new Date(candidate.upload_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`badge ${getCategoryColor(candidate.analysis?.category)}`}>
            {getCategoryIcon(candidate.analysis?.category)}
            <span className="ml-2">{candidate.analysis?.category || 'Pending'}</span>
          </span>
          
          <div className="flex items-center space-x-2 text-sm">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{candidate.analysis?.overall_score || 0}%</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-b border-gray-200"
      >
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Info */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {candidate.analysis?.contact_info?.name && (
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{candidate.analysis.contact_info.name}</span>
                    </div>
                  )}
                  {candidate.analysis?.contact_info?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{candidate.analysis.contact_info.email}</span>
                    </div>
                  )}
                  {candidate.analysis?.contact_info?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{candidate.analysis.contact_info.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Experience & Education */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience & Education</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Experience Level</p>
                    <p className="font-medium text-gray-900">
                      {candidate.analysis?.experience_level || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Years of Experience</p>
                    <p className="font-medium text-gray-900">
                      {candidate.analysis?.experience_years || 0} years
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Education</p>
                    <p className="font-medium text-gray-900">
                      {candidate.analysis?.education || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.analysis?.key_skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  )) || <p className="text-gray-500">No skills identified</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                  {candidate.analysis?.summary || 'No summary available'}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {candidate.analysis?.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-success-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    )) || <p className="text-gray-500">No strengths identified</p>}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-warning-500 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {candidate.analysis?.weaknesses?.map((weakness, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-warning-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{weakness}</span>
                      </li>
                    )) || <p className="text-gray-500">No weaknesses identified</p>}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                <ul className="space-y-2">
                  {candidate.analysis?.recommendations?.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  )) || <p className="text-gray-500">No recommendations available</p>}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'bias' && (
            <div className="space-y-6">
              {biasAnalysis ? (
                <>
                  {/* Bias Overview */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Bias Analysis Overview</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowBlindResume(!showBlindResume)}
                          className="btn-secondary flex items-center space-x-2"
                        >
                          {showBlindResume ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span>{showBlindResume ? 'Show Original' : 'Show Blind Resume'}</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className={`p-4 rounded-lg ${getBiasRiskColor(biasAnalysis.overall_bias_score)}`}>
                        <p className="text-sm font-medium">Overall Bias Risk</p>
                        <p className="text-2xl font-bold">{Math.round(biasAnalysis.overall_bias_score)}%</p>
                        <p className="text-xs">{biasAnalysis.risk_level.toUpperCase()} RISK</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Categories Analyzed</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {Object.keys(biasAnalysis.bias_categories || {}).length}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Indicators Found</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {biasAnalysis.bias_indicators_found?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Bias Categories</h4>
                      {Object.entries(biasAnalysis.bias_categories || {}).map(([category, data]) => (
                        <div key={category} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 capitalize">{category} Bias</h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              data.score >= 70 ? 'bg-danger-100 text-danger-800' :
                              data.score >= 40 ? 'bg-warning-100 text-warning-800' :
                              'bg-success-100 text-success-800'
                            }`}>
                              {data.score}% Risk
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{data.description}</p>
                          {data.indicators && data.indicators.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">Indicators found:</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {data.indicators.map((indicator, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <span className="text-gray-400">•</span>
                                    <span>{indicator}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resume Display */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {showBlindResume ? 'Blind Resume (Bias-Free Version)' : 'Original Resume'}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                        {showBlindResume ? blindResume : candidate.resume_text}
                      </pre>
                    </div>
                  </div>
                </>
              ) : (
                <div className="card p-12 text-center">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bias Analysis Available</h3>
                  <p className="text-gray-600">Bias analysis is not available for this candidate.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bot className="h-5 w-5 text-primary-500 mr-2" />
                AI Chat about {candidate.analysis?.contact_info?.name || 'this candidate'}
              </h3>
              
              {/* Chat Messages */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 h-96 overflow-y-auto mb-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-gray-500 mt-8"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary-400" />
                    </motion.div>
                    <p className="text-lg font-medium text-gray-700">Start a conversation about this candidate</p>
                    <p className="text-sm mt-2 text-gray-500">Ask about their skills, experience, or fit for specific roles</p>
                    
                    {/* Quick suggestion buttons */}
                    <div className="mt-6 space-y-2">
                      {[
                        "What are their key strengths?",
                        "How do they compare to other candidates?",
                        "Are they suitable for a senior role?"
                      ].map((suggestion, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSendMessage(suggestion)}
                          className="block w-full text-sm bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-700 px-4 py-2 rounded-lg border border-gray-200 hover:border-primary-300 transition-all duration-200"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {chatMessages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-xl shadow-sm ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200 hover:shadow-md transition-shadow duration-200'
                          }`}
                        >
                          {msg.type === 'ai' && (
                            <div className="flex items-center space-x-2 mb-2">
                              <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Bot className="h-4 w-4 text-primary-500" />
                              </motion.div>
                              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">AI Assistant</span>
                            </div>
                          )}
                          
                          <div 
                            className="text-sm prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: msg.type === 'ai' ? formatAIResponse(msg.message) : msg.message 
                            }}
                          />
                          
                          <p className={`text-xs mt-2 ${
                            msg.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                
                {isChatLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white text-gray-900 border border-gray-200 shadow-lg max-w-xs lg:max-w-md px-4 py-3 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Bot className="h-4 w-4 text-primary-500" />
                        </motion.div>
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">AI Assistant</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <motion.div 
                          className="flex space-x-1"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-primary-300 rounded-full"></div>
                        </motion.div>
                        <span className="text-sm">Analyzing candidate...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about this candidate..."
                  className="input-field flex-1"
                  disabled={isChatLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isChatLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CandidateDetail;
