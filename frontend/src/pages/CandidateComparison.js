import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  X,
  Star,
  TrendingUp,
  Award,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Code,
  Target,
  Zap,
  Brain,
  Eye,
  BarChart3
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const CandidateComparison = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCandidateSelector, setShowCandidateSelector] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await apiService.getCandidates();
      setAllCandidates(response.data.candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const addCandidate = (candidate) => {
    if (selectedCandidates.length >= 4) {
      toast.error('Maximum 4 candidates can be compared');
      return;
    }
    
    if (selectedCandidates.find(c => c.id === candidate.id)) {
      toast.error('Candidate already selected');
      return;
    }

    setSelectedCandidates([...selectedCandidates, candidate]);
    setShowCandidateSelector(false);
    toast.success(`${candidate.analysis?.contact_info?.name || candidate.filename} added to comparison`);
  };

  const removeCandidate = (candidateId) => {
    setSelectedCandidates(selectedCandidates.filter(c => c.id !== candidateId));
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
        return 'bg-success-100 text-success-800 border-success-200';
      case 'Qualified':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'Not a Fit':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-success-100';
    if (score >= 60) return 'bg-warning-100';
    return 'bg-danger-100';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Candidate Comparison</h1>
          <p className="text-gray-600">Compare candidates side-by-side to make better hiring decisions</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCandidateSelector(true)}
          className="btn-primary flex items-center space-x-2"
          disabled={selectedCandidates.length >= 4}
        >
          <Plus className="h-4 w-4" />
          <span>Add Candidate</span>
        </motion.button>
      </motion.div>

      {/* Selected Candidates Count */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-4"
      >
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary-500" />
          <span className="text-sm font-medium text-gray-700">
            {selectedCandidates.length} of 4 candidates selected
          </span>
        </div>
        
        {selectedCandidates.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCandidates([])}
            className="text-sm text-danger-600 hover:text-danger-700 font-medium"
          >
            Clear All
          </motion.button>
        )}
      </motion.div>

      {/* Comparison Grid */}
      {selectedCandidates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-12 text-center"
        >
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Candidates Selected</h3>
          <p className="text-gray-600 mb-6">
            Select candidates to compare their qualifications, skills, and scores side-by-side
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCandidateSelector(true)}
            className="btn-primary"
          >
            Select Candidates
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Candidate Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {selectedCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6 relative group hover:shadow-xl transition-all duration-300"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeCandidate(candidate.id)}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>

                  {/* Candidate Header */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                      {(candidate.analysis?.contact_info?.name || candidate.filename).charAt(0)}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {candidate.analysis?.contact_info?.name || candidate.filename}
                    </h3>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(candidate.analysis?.category)}`}>
                      {getCategoryIcon(candidate.analysis?.category)}
                      <span className="ml-1">{candidate.analysis?.category || 'Pending'}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBgColor(candidate.analysis?.overall_score || 0)} mb-2`}>
                      <span className={`text-2xl font-bold ${getScoreColor(candidate.analysis?.overall_score || 0)}`}>
                        {candidate.analysis?.overall_score || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Overall Score</p>
                  </div>

                  {/* Key Info */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{candidate.analysis?.experience_years || 0} years experience</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{candidate.analysis?.education || 'Not specified'}</span>
                    </div>

                    {candidate.analysis?.contact_info?.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{candidate.analysis.contact_info.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Top Skills */}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {(candidate.analysis?.key_skills || []).slice(0, 3).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {(candidate.analysis?.key_skills || []).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{(candidate.analysis?.key_skills || []).length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Detailed Comparison Table */}
          {selectedCandidates.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="h-5 w-5 text-primary-500 mr-2" />
                Detailed Comparison
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Criteria</th>
                      {selectedCandidates.map((candidate, index) => (
                        <th key={index} className="text-center py-3 px-4 font-medium text-gray-700">
                          {candidate.analysis?.contact_info?.name || candidate.filename}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      {
                        label: 'Overall Score',
                        icon: Star,
                        getValue: (c) => `${c.analysis?.overall_score || 0}%`,
                        getColor: (c) => getScoreColor(c.analysis?.overall_score || 0)
                      },
                      {
                        label: 'Experience',
                        icon: Briefcase,
                        getValue: (c) => `${c.analysis?.experience_years || 0} years`,
                        getColor: () => 'text-gray-700'
                      },
                      {
                        label: 'Skills Match',
                        icon: Target,
                        getValue: (c) => `${c.analysis?.skills_match || 0}%`,
                        getColor: (c) => getScoreColor(c.analysis?.skills_match || 0)
                      },
                      {
                        label: 'Category',
                        icon: Award,
                        getValue: (c) => c.analysis?.category || 'Pending',
                        getColor: (c) => {
                          const category = c.analysis?.category;
                          if (category === 'Highly Qualified') return 'text-success-600';
                          if (category === 'Qualified') return 'text-warning-600';
                          if (category === 'Not a Fit') return 'text-danger-600';
                          return 'text-gray-600';
                        }
                      },
                      {
                        label: 'Key Skills Count',
                        icon: Code,
                        getValue: (c) => (c.analysis?.key_skills || []).length,
                        getColor: () => 'text-gray-700'
                      }
                    ].map((row, rowIndex) => {
                      const Icon = row.icon;
                      return (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-700">{row.label}</span>
                            </div>
                          </td>
                          {selectedCandidates.map((candidate, candidateIndex) => (
                            <td key={candidateIndex} className="py-3 px-4 text-center">
                              <span className={`font-medium ${row.getColor(candidate)}`}>
                                {row.getValue(candidate)}
                              </span>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Skills Comparison */}
          {selectedCandidates.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Brain className="h-5 w-5 text-primary-500 mr-2" />
                Skills Comparison
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {selectedCandidates.map((candidate, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-center">
                      {candidate.analysis?.contact_info?.name || candidate.filename}
                    </h4>
                    <div className="space-y-2">
                      {(candidate.analysis?.key_skills || []).slice(0, 8).map((skill, skillIndex) => (
                        <motion.div
                          key={skillIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + skillIndex * 0.05 }}
                          className="px-3 py-2 bg-primary-50 text-primary-700 text-sm rounded-lg text-center"
                        >
                          {skill}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Candidate Selector Modal */}
      <AnimatePresence>
        {showCandidateSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCandidateSelector(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Select Candidates</h3>
                <button
                  onClick={() => setShowCandidateSelector(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCandidates
                  .filter(candidate => !selectedCandidates.find(c => c.id === candidate.id))
                  .map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => addCandidate(candidate)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(candidate.analysis?.contact_info?.name || candidate.filename).charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {candidate.analysis?.contact_info?.name || candidate.filename}
                          </p>
                          <p className="text-sm text-gray-600">
                            Score: {candidate.analysis?.overall_score || 0}%
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(candidate.analysis?.category)}`}>
                          {candidate.analysis?.category || 'Pending'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandidateComparison;
