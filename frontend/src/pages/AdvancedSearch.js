import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  User,
  Star,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Mail,
  Phone,
  Eye,
  Download,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const AdvancedSearch = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    scoreRange: [0, 100],
    categories: [],
    experienceRange: [0, 20],
    skills: [],
    locations: [],
    education: [],
    dateRange: 'all' // all, today, week, month, year
  });

  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    skills: [],
    locations: [],
    education: []
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (candidates.length > 0) {
      extractAvailableFilters();
    }
  }, [candidates]);

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

  const extractAvailableFilters = () => {
    const categories = [...new Set(candidates.map(c => c.analysis?.category).filter(Boolean))];
    const skills = [...new Set(candidates.flatMap(c => c.analysis?.key_skills || []))];
    const locations = [...new Set(candidates.map(c => c.analysis?.contact_info?.location).filter(Boolean))];
    const education = [...new Set(candidates.map(c => c.analysis?.education).filter(Boolean))];

    setAvailableFilters({
      categories: categories.sort(),
      skills: skills.sort(),
      locations: locations.sort(),
      education: education.sort()
    });
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const analysis = candidate.analysis || {};
      const contactInfo = analysis.contact_info || {};
      
      // Text search
      if (searchQuery) {
        const searchFields = [
          contactInfo.name,
          candidate.filename,
          analysis.category,
          ...(analysis.key_skills || []),
          analysis.education,
          contactInfo.location
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchFields.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      // Score range
      const score = analysis.overall_score || 0;
      if (score < filters.scoreRange[0] || score > filters.scoreRange[1]) {
        return false;
      }

      // Categories
      if (filters.categories.length > 0 && !filters.categories.includes(analysis.category)) {
        return false;
      }

      // Experience range
      const experience = analysis.experience_years || 0;
      if (experience < filters.experienceRange[0] || experience > filters.experienceRange[1]) {
        return false;
      }

      // Skills
      if (filters.skills.length > 0) {
        const candidateSkills = analysis.key_skills || [];
        const hasRequiredSkills = filters.skills.some(skill => 
          candidateSkills.some(candidateSkill => 
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (!hasRequiredSkills) {
          return false;
        }
      }

      // Locations
      if (filters.locations.length > 0 && !filters.locations.includes(contactInfo.location)) {
        return false;
      }

      // Education
      if (filters.education.length > 0 && !filters.education.includes(analysis.education)) {
        return false;
      }

      // Date range
      if (filters.dateRange !== 'all') {
        const uploadDate = new Date(candidate.upload_date);
        const now = new Date();
        const diffTime = now - uploadDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'today':
            if (diffDays > 1) return false;
            break;
          case 'week':
            if (diffDays > 7) return false;
            break;
          case 'month':
            if (diffDays > 30) return false;
            break;
          case 'year':
            if (diffDays > 365) return false;
            break;
        }
      }

      return true;
    });
  }, [candidates, searchQuery, filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      scoreRange: [0, 100],
      categories: [],
      experienceRange: [0, 20],
      skills: [],
      locations: [],
      education: [],
      dateRange: 'all'
    });
    setSearchQuery('');
  };

  const exportResults = () => {
    const csvContent = [
      ['Name', 'Score', 'Category', 'Experience', 'Skills', 'Location', 'Education'].join(','),
      ...filteredCandidates.map(candidate => [
        candidate.analysis?.contact_info?.name || candidate.filename,
        candidate.analysis?.overall_score || 0,
        candidate.analysis?.category || 'Unknown',
        candidate.analysis?.experience_years || 0,
        (candidate.analysis?.key_skills || []).join('; '),
        candidate.analysis?.contact_info?.location || '',
        candidate.analysis?.education || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'search_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Highly Qualified':
        return <Award className="h-4 w-4 text-success-500" />;
      case 'Qualified':
        return <Star className="h-4 w-4 text-warning-500" />;
      case 'Not a Fit':
        return <X className="h-4 w-4 text-danger-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Advanced Search</h1>
          <p className="text-gray-600">Find the perfect candidates with powerful search and filtering</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </motion.button>
          
          {filteredCandidates.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportResults}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, skills, location, education..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="card p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 text-primary-500 mr-2" />
                Search Filters
              </h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Score Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score Range: {filters.scoreRange[0]}% - {filters.scoreRange[1]}%
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.scoreRange[0]}
                    onChange={(e) => updateFilter('scoreRange', [parseInt(e.target.value), filters.scoreRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.scoreRange[1]}
                    onChange={(e) => updateFilter('scoreRange', [filters.scoreRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Experience Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience: {filters.experienceRange[0]} - {filters.experienceRange[1]} years
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={filters.experienceRange[0]}
                    onChange={(e) => updateFilter('experienceRange', [parseInt(e.target.value), filters.experienceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={filters.experienceRange[1]}
                    onChange={(e) => updateFilter('experienceRange', [filters.experienceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Date</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilter('dateRange', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableFilters.categories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleArrayFilter('categories', category)}
                        className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableFilters.skills.slice(0, 10).map(skill => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill)}
                        onChange={() => toggleArrayFilter('skills', skill)}
                        className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableFilters.locations.map(location => (
                    <label key={location} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(location)}
                        onChange={() => toggleArrayFilter('locations', location)}
                        className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{location}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <p className="text-gray-600">
          Found <span className="font-semibold text-gray-900">{filteredCandidates.length}</span> candidates
          {candidates.length !== filteredCandidates.length && (
            <span> out of {candidates.length} total</span>
          )}
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchCandidates}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </motion.button>
      </motion.div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="card p-6 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Candidate Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {(candidate.analysis?.contact_info?.name || candidate.filename).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {candidate.analysis?.contact_info?.name || candidate.filename}
                    </h3>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(candidate.analysis?.category)}`}>
                      {getCategoryIcon(candidate.analysis?.category)}
                      <span className="ml-1">{candidate.analysis?.category || 'Pending'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    {candidate.analysis?.overall_score || 0}%
                  </div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>

              {/* Candidate Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{candidate.analysis?.experience_years || 0} years experience</span>
                </div>
                
                {candidate.analysis?.contact_info?.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{candidate.analysis.contact_info.location}</span>
                  </div>
                )}
                
                {candidate.analysis?.education && (
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{candidate.analysis.education}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{new Date(candidate.upload_date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Key Skills</p>
                <div className="flex flex-wrap gap-1">
                  {(candidate.analysis?.key_skills || []).slice(0, 4).map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {(candidate.analysis?.key_skills || []).length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{(candidate.analysis?.key_skills || []).length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {candidate.analysis?.contact_info?.email && (
                    <Mail className="h-3 w-3" />
                  )}
                  {candidate.analysis?.contact_info?.phone && (
                    <Phone className="h-3 w-3" />
                  )}
                </div>
                
                <Link
                  to={`/candidates/${candidate.id}`}
                  className="btn-primary-sm flex items-center space-x-1"
                >
                  <Eye className="h-3 w-3" />
                  <span>View</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {filteredCandidates.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 text-center"
        >
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No candidates found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or filters to find more candidates
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="btn-primary"
          >
            Clear Filters
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedSearch;
