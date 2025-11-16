import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  FileText,
  Sparkles,
  Clock,
  User
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const HRAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const messagesEndRef = useRef(null);

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
    fetchCandidates();
    // Add welcome message
    setMessages([{
      type: 'ai',
      message: "Hello! I'm your HR Assistant. I can help you analyze candidates, find the best fits for specific roles, and answer questions about your candidate pool. What would you like to know?",
      timestamp: new Date().toISOString(),
      suggestions: [
        "Who are the top 5 candidates?",
        "Show me candidates with Python skills",
        "What's the average experience level?",
        "Find candidates for a Data Scientist role"
      ]
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCandidates = async () => {
    try {
      const response = await apiService.getCandidates();
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText = null) => {
    const message = messageText || newMessage.trim();
    if (!message || isLoading) return;

    setNewMessage('');
    setIsLoading(true);

    // Add user message
    const userMessage = {
      type: 'user',
      message: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await apiService.hrChat(message);
      
      // Add AI response
      const aiMessage = {
        type: 'ai',
        message: response.data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Add error message
      const errorMessage = {
        type: 'ai',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    {
      icon: TrendingUp,
      question: "Who are the top 5 candidates by score?",
      color: "primary",
      description: "Get ranked list of highest scoring candidates"
    },
    {
      icon: Users,
      question: "Show me all highly qualified candidates",
      color: "success",
      description: "View candidates in the top category"
    },
    {
      icon: FileText,
      question: "What skills are most common among candidates?",
      color: "warning",
      description: "Analyze skill distribution across candidates"
    },
    {
      icon: User,
      question: "Find candidates with 5+ years experience",
      color: "secondary",
      description: "Filter by experience level"
    },
    {
      icon: Sparkles,
      question: "Compare top 3 candidates for Data Scientist role",
      color: "purple",
      description: "Side-by-side candidate comparison"
    },
    {
      icon: Clock,
      question: "Show recent uploads this week",
      color: "indigo",
      description: "View latest candidate submissions"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-2xl shadow-lg"
          >
            <Bot className="h-8 w-8 text-white" />
          </motion.div>
        </div>
        
        <h1 className="text-4xl font-bold gradient-text mb-4">
          HR Assistant
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your AI-powered recruitment companion. Ask questions about candidates, get insights, and make better hiring decisions.
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="card p-4 text-center">
          <Users className="h-6 w-6 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
          <p className="text-sm text-gray-600">Total Candidates</p>
        </div>
        
        <div className="card p-4 text-center">
          <TrendingUp className="h-6 w-6 text-success-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {candidates.filter(c => c.analysis?.category === 'Highly Qualified').length}
          </p>
          <p className="text-sm text-gray-600">Highly Qualified</p>
        </div>
        
        <div className="card p-4 text-center">
          <FileText className="h-6 w-6 text-warning-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {candidates.filter(c => c.analysis?.category === 'Qualified').length}
          </p>
          <p className="text-sm text-gray-600">Qualified</p>
        </div>
        
        <div className="card p-4 text-center">
          <Clock className="h-6 w-6 text-gray-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(candidates.reduce((acc, c) => acc + (c.analysis?.overall_score || 0), 0) / candidates.length) || 0}%
          </p>
          <p className="text-sm text-gray-600">Avg Score</p>
        </div>
      </motion.div>

      {/* Quick Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Sparkles className="h-5 w-5 text-primary-500 mr-2" />
          Quick Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickQuestions.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.03,
                  y: -2,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSendMessage(item.question)}
                disabled={isLoading}
                className={`p-4 text-left rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-all duration-300 bg-white ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <motion.div 
                    className={`p-3 rounded-lg ${
                      item.color === 'primary' ? 'bg-gradient-to-br from-primary-100 to-primary-200' :
                      item.color === 'success' ? 'bg-gradient-to-br from-success-100 to-success-200' :
                      item.color === 'warning' ? 'bg-gradient-to-br from-warning-100 to-warning-200' :
                      item.color === 'purple' ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
                      item.color === 'indigo' ? 'bg-gradient-to-br from-indigo-100 to-indigo-200' :
                      'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={`h-5 w-5 ${
                      item.color === 'primary' ? 'text-primary-600' :
                      item.color === 'success' ? 'text-success-600' :
                      item.color === 'warning' ? 'text-warning-600' :
                      item.color === 'purple' ? 'text-purple-600' :
                      item.color === 'indigo' ? 'text-indigo-600' :
                      'text-gray-600'
                    }`} />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{item.question}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        {/* Chat Messages */}
        <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200'
                  }`}
                >
                  {msg.type === 'ai' && (
                    <div className="flex items-center space-x-2 mb-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Bot className="h-4 w-4 text-primary-500" />
                      </motion.div>
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">HR Assistant</span>
                    </div>
                  )}
                  
                  <div 
                    className="text-sm whitespace-pre-wrap prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: msg.type === 'ai' ? formatAIResponse(msg.message) : msg.message 
                    }}
                  />
                  
                  {msg.suggestions && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-500">Try asking:</p>
                      {msg.suggestions.map((suggestion, suggestionIndex) => (
                        <button
                          key={suggestionIndex}
                          onClick={() => handleSendMessage(suggestion)}
                          disabled={isLoading}
                          className="block w-full text-left text-xs bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded border transition-colors duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p className={`text-xs mt-2 ${
                    msg.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-r from-gray-50 to-white text-gray-900 border border-gray-200 shadow-lg max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity }
                    }}
                  >
                    <Bot className="h-4 w-4 text-primary-500" />
                  </motion.div>
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">HR Assistant</span>
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
                  <span className="text-sm">Analyzing your request...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <motion.div 
          className="flex space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex-1 relative">
            <motion.input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me about your candidates..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
              disabled={isLoading}
              whileFocus={{ scale: 1.02 }}
            />
            <motion.div
              animate={{ 
                rotate: newMessage ? [0, 10, -10, 0] : 0,
                scale: newMessage ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 0.5 }}
            >
              <MessageSquare className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </motion.div>
          </div>
          
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendMessage()}
            disabled={!newMessage.trim() || isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              newMessage.trim() && !isLoading
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <motion.div
              animate={isLoading ? { rotate: 360 } : {}}
              transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </motion.div>
            <span>Send</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-primary-900 mb-3">💡 Tips for better results</h3>
        <ul className="space-y-2 text-sm text-primary-800">
          <li>• Ask specific questions like "Find candidates with React and Node.js skills"</li>
          <li>• Request comparisons: "Compare the top 3 candidates for a senior developer role"</li>
          <li>• Get insights: "What are the most common skills among highly qualified candidates?"</li>
          <li>• Ask for recommendations: "Which candidate would be best for a startup environment?"</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default HRAssistant;
