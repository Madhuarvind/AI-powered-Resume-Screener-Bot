import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';
import { 
  Code,
  TrendingUp,
  Users,
  Target,
  Award,
  Brain,
  Zap,
  Filter,
  Download,
  RefreshCw,
  Search,
  Star,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Layers
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const SkillsAnalytics = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChart, setSelectedChart] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  // Process skills data
  const processSkillsData = () => {
    const skillsCount = {};
    const skillsByCategory = {};
    const skillTrends = {};

    candidates.forEach(candidate => {
      const category = candidate.analysis?.category || 'Unknown';
      const skills = candidate.analysis?.key_skills || [];
      
      if (!skillsByCategory[category]) {
        skillsByCategory[category] = {};
      }

      skills.forEach(skill => {
        // Overall count
        skillsCount[skill] = (skillsCount[skill] || 0) + 1;
        
        // By category
        skillsByCategory[category][skill] = (skillsByCategory[category][skill] || 0) + 1;
        
        // Trends (mock data for demonstration)
        if (!skillTrends[skill]) {
          skillTrends[skill] = {
            skill,
            demand: Math.floor(Math.random() * 100) + 1,
            growth: Math.floor(Math.random() * 40) - 20,
            avgSalary: Math.floor(Math.random() * 50000) + 50000
          };
        }
      });
    });

    return { skillsCount, skillsByCategory, skillTrends };
  };

  const { skillsCount, skillsByCategory, skillTrends } = processSkillsData();

  // Filter skills based on category and search
  const getFilteredSkills = () => {
    let skills = skillsCount;
    
    if (selectedCategory !== 'all' && skillsByCategory[selectedCategory]) {
      skills = skillsByCategory[selectedCategory];
    }

    const filteredSkills = Object.entries(skills)
      .filter(([skill]) => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);

    return filteredSkills.map(([skill, count]) => ({ skill, count }));
  };

  // Get top skills for different visualizations
  const getTopSkills = (limit = 10) => {
    return Object.entries(skillsCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([skill, count]) => ({ skill, count }));
  };

  // Get skills distribution by category
  const getSkillsDistribution = () => {
    const categories = Object.keys(skillsByCategory);
    return categories.map(category => ({
      category,
      totalSkills: Object.keys(skillsByCategory[category]).length,
      totalMentions: Object.values(skillsByCategory[category]).reduce((sum, count) => sum + count, 0)
    }));
  };

  // Get skill trends data
  const getSkillTrends = () => {
    return Object.values(skillTrends)
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 10);
  };

  // Get radar chart data for skill categories
  const getSkillCategoriesData = () => {
    const techSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'SQL'];
    const softSkills = ['Communication', 'Leadership', 'Problem Solving', 'Teamwork'];
    const designSkills = ['UI/UX', 'Figma', 'Adobe', 'Design'];
    
    const categories = [
      { category: 'Technical', skills: techSkills },
      { category: 'Soft Skills', skills: softSkills },
      { category: 'Design', skills: designSkills }
    ];

    return categories.map(({ category, skills }) => {
      const totalCount = skills.reduce((sum, skill) => {
        const matchingSkills = Object.keys(skillsCount).filter(s => 
          s.toLowerCase().includes(skill.toLowerCase())
        );
        return sum + matchingSkills.reduce((skillSum, s) => skillSum + (skillsCount[s] || 0), 0);
      }, 0);

      return {
        category,
        count: totalCount,
        fullMark: Math.max(...Object.values(skillsCount))
      };
    });
  };

  const filteredSkills = getFilteredSkills();
  const topSkills = getTopSkills();
  const skillsDistribution = getSkillsDistribution();
  const skillTrendsData = getSkillTrends();
  const skillCategoriesData = getSkillCategoriesData();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const chartTypes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'distribution', label: 'Distribution', icon: PieChartIcon },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'treemap', label: 'Tree Map', icon: Activity }
  ];

  const categories = ['all', ...Object.keys(skillsByCategory)];

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
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Skills Analytics</h1>
          <p className="text-gray-600">Comprehensive analysis of candidate skills and market trends</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchCandidates}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Skills',
            value: Object.keys(skillsCount).length,
            change: '+12%',
            icon: Code,
            color: 'primary'
          },
          {
            title: 'Most Popular',
            value: topSkills[0]?.skill || 'N/A',
            change: `${topSkills[0]?.count || 0} mentions`,
            icon: Star,
            color: 'success'
          },
          {
            title: 'Skill Categories',
            value: Object.keys(skillsByCategory).length,
            change: '+8%',
            icon: Layers,
            color: 'warning'
          },
          {
            title: 'Avg Skills/Candidate',
            value: Math.round(Object.values(skillsCount).reduce((sum, count) => sum + count, 0) / candidates.length) || 0,
            change: '+5%',
            icon: Target,
            color: 'purple'
          }
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
              className="card-gradient p-6 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <motion.p 
                    className="text-2xl font-bold text-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                  >
                    {metric.value}
                  </motion.p>
                  <p className="text-sm text-success-600 font-medium">{metric.change}</p>
                </div>
                <motion.div 
                  className={`p-3 rounded-xl ${
                    metric.color === 'primary' ? 'bg-primary-100' :
                    metric.color === 'success' ? 'bg-success-100' :
                    metric.color === 'warning' ? 'bg-warning-100' :
                    'bg-purple-100'
                  }`}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className={`h-6 w-6 ${
                    metric.color === 'primary' ? 'text-primary-600' :
                    metric.color === 'success' ? 'text-success-600' :
                    metric.color === 'warning' ? 'text-warning-600' :
                    'text-purple-600'
                  }`} />
                </motion.div>
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
        className="card p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Skills</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for specific skills..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <div className="flex flex-wrap gap-2 mb-6">
          {chartTypes.map((chart) => {
            const Icon = chart.icon;
            return (
              <motion.button
                key={chart.id}
                onClick={() => setSelectedChart(chart.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedChart === chart.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-4 w-4" />
                <span>{chart.label}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedChart}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-96"
          >
            {selectedChart === 'overview' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredSkills}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="skill" 
                    stroke="#666" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'distribution' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topSkills.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ skill, percent }) => `${skill} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {topSkills.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'trends' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillTrendsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#666" />
                  <YAxis dataKey="skill" type="category" stroke="#666" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="demand" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'categories' && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillCategoriesData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Skills"
                    dataKey="count"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'treemap' && (
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={topSkills.slice(0, 12)}
                  dataKey="count"
                  ratio={4/3}
                  stroke="#fff"
                  fill="#3B82F6"
                >
                  <Tooltip />
                </Treemap>
              </ResponsiveContainer>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Skills List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 text-warning-500 mr-2" />
            Top Skills
          </h3>
          <div className="space-y-3">
            {topSkills.slice(0, 10).map((skill, index) => (
              <motion.div
                key={skill.skill}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{skill.skill}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{skill.count} mentions</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skills by Category */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="h-5 w-5 text-purple-500 mr-2" />
            Skills by Category
          </h3>
          <div className="space-y-4">
            {skillsDistribution.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{category.category}</h4>
                  <span className="text-sm text-gray-600">{category.totalSkills} skills</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(category.totalMentions / Math.max(...skillsDistribution.map(c => c.totalMentions))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{category.totalMentions}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="h-5 w-5 text-warning-500 mr-2" />
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-2">Most In-Demand</h4>
            <p className="text-sm text-primary-700">
              {topSkills[0]?.skill || 'N/A'} is the most mentioned skill with {topSkills[0]?.count || 0} occurrences
            </p>
          </div>
          <div className="p-4 bg-success-50 rounded-lg">
            <h4 className="font-medium text-success-900 mb-2">Skill Diversity</h4>
            <p className="text-sm text-success-700">
              {Object.keys(skillsCount).length} unique skills across {candidates.length} candidates
            </p>
          </div>
          <div className="p-4 bg-warning-50 rounded-lg">
            <h4 className="font-medium text-warning-900 mb-2">Category Leader</h4>
            <p className="text-sm text-warning-700">
              {skillsDistribution.sort((a, b) => b.totalMentions - a.totalMentions)[0]?.category || 'N/A'} has the most skill mentions
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SkillsAnalytics;
