import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Eye, 
  MessageSquare, 
  Shield,
  Star,
  Clock,
  User,
  FileText,
  ChevronDown
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import config from '../config';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('upload_date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterAndSortCandidates();
  }, [candidates, searchTerm, selectedCategory, sortBy, sortOrder]);

  const fetchCandidates = async () => {
    try {
      const response = await apiService.getCandidates();
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCandidates = () => {
    let filtered = [...candidates];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(candidate => {
        const name = candidate.analysis?.contact_info?.name || candidate.filename;
        const skills = candidate.analysis?.key_skills?.join(' ') || '';
        const searchText = `${name} ${skills}`.toLowerCase();
        return searchText.includes(searchTerm.toLowerCase());
      });
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(candidate => 
        candidate.analysis?.category === selectedCategory
      );
    }

    // Sort candidates
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'score':
          aValue = a.analysis?.overall_score || 0;
          bValue = b.analysis?.overall_score || 0;
          break;
        case 'name':
          aValue = a.analysis?.contact_info?.name || a.filename;
          bValue = b.analysis?.contact_info?.name || b.filename;
          break;
        case 'experience':
          aValue = a.analysis?.experience_years || 0;
          bValue = b.analysis?.experience_years || 0;
          break;
        default: // upload_date
          aValue = new Date(a.upload_date);
          bValue = new Date(b.upload_date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCandidates(filtered);
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

  const getBiasRiskColor = (biasScore) => {
    if (biasScore >= config.BIAS_THRESHOLDS.HIGH) return 'text-danger-600';
    if (biasScore >= config.BIAS_THRESHOLDS.MEDIUM) return 'text-warning-600';
    return 'text-success-600';
  };

  const getBiasRiskLabel = (biasScore) => {
    if (biasScore >= config.BIAS_THRESHOLDS.HIGH) return 'High Risk';
    if (biasScore >= config.BIAS_THRESHOLDS.MEDIUM) return 'Medium Risk';
    return 'Low Risk';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600 mt-1">
            {filteredCandidates.length} of {candidates.length} candidates
          </p>
        </div>
        
        <Link to="/upload" className="btn-primary">
          <FileText className="h-4 w-4 mr-2" />
          Upload Resume
        </Link>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field appearance-none pr-10"
            >
              <option value="All">All Categories</option>
              {config.CANDIDATE_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field appearance-none pr-10"
            >
              <option value="upload_date">Upload Date</option>
              <option value="score">Score</option>
              <option value="name">Name</option>
              <option value="experience">Experience</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn-secondary flex items-center justify-center"
          >
            <SortAsc className={`h-4 w-4 mr-2 transition-transform ${
              sortOrder === 'desc' ? 'rotate-180' : ''
            }`} />
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      </motion.div>

      {/* Candidates List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="card p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Candidate Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {candidate.analysis?.contact_info?.name || candidate.filename}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {candidate.analysis?.experience_level} • {candidate.analysis?.experience_years || 0} years experience
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${getCategoryColor(candidate.analysis?.category)}`}>
                        {candidate.analysis?.category || 'Pending'}
                      </span>
                      
                      {candidate.bias_analysis && (
                        <span className={`text-xs font-medium ${getBiasRiskColor(candidate.bias_analysis.overall_bias_score)}`}>
                          {getBiasRiskLabel(candidate.bias_analysis.overall_bias_score)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score and Skills */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        Score: {candidate.analysis?.overall_score || 0}%
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(candidate.upload_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {candidate.analysis?.key_skills && (
                    <div className="flex flex-wrap gap-2">
                      {candidate.analysis.key_skills.slice(0, 5).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.analysis.key_skills.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{candidate.analysis.key_skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/candidates/${candidate.id}`}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </Link>
                  
                  <Link
                    to={`/candidates/${candidate.id}?tab=chat`}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>AI Chat</span>
                  </Link>
                  
                  {candidate.bias_analysis && (
                    <Link
                      to={`/candidates/${candidate.id}?tab=bias`}
                      className="p-2 text-warning-600 hover:bg-warning-50 rounded-lg transition-colors duration-200"
                      title="View Bias Analysis"
                    >
                      <Shield className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {filteredCandidates.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-12 text-center"
          >
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {candidates.length === 0 ? 'No candidates yet' : 'No candidates match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {candidates.length === 0 
                ? 'Upload your first resume to get started with AI-powered candidate screening.'
                : 'Try adjusting your search criteria or filters to find candidates.'
              }
            </p>
            {candidates.length === 0 && (
              <Link to="/upload" className="btn-primary">
                <FileText className="h-4 w-4 mr-2" />
                Upload First Resume
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Candidates;
