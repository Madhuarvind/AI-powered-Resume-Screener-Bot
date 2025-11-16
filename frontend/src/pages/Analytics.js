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
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Award,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedChart, setSelectedChart] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCandidates();
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const processScoreDistribution = () => {
    const ranges = [
      { range: '90-100', min: 90, max: 100, count: 0 },
      { range: '80-89', min: 80, max: 89, count: 0 },
      { range: '70-79', min: 70, max: 79, count: 0 },
      { range: '60-69', min: 60, max: 69, count: 0 },
      { range: '0-59', min: 0, max: 59, count: 0 }
    ];

    candidates.forEach(candidate => {
      const score = candidate.analysis?.overall_score || 0;
      const range = ranges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    return ranges;
  };

  const processCategoryDistribution = () => {
    const categories = {};
    candidates.forEach(candidate => {
      const category = candidate.analysis?.category || 'Unknown';
      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const processSkillsData = () => {
    const skillsCount = {};
    candidates.forEach(candidate => {
      const skills = candidate.analysis?.key_skills || [];
      skills.forEach(skill => {
        skillsCount[skill] = (skillsCount[skill] || 0) + 1;
      });
    });

    return Object.entries(skillsCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  };

  const processTimelineData = () => {
    if (!candidates.length) return [];
    
    const timeline = {};
    candidates.forEach(candidate => {
      if (candidate.upload_date) {
        const date = new Date(candidate.upload_date).toLocaleDateString();
        timeline[date] = (timeline[date] || 0) + 1;
      }
    });

    return Object.entries(timeline)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({ date, count }));
  };

  const scoreData = processScoreDistribution();
  const categoryData = processCategoryDistribution();
  const skillsData = processSkillsData();
  const timelineData = processTimelineData();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const chartTypes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'scores', label: 'Score Distribution', icon: TrendingUp },
    { id: 'categories', label: 'Categories', icon: PieChartIcon },
    { id: 'skills', label: 'Skills Analysis', icon: Target },
    { id: 'timeline', label: 'Timeline', icon: Activity }
  ];

  const timeRanges = [
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 3 months' },
    { id: '1y', label: 'Last year' }
  ];

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
          <h1 className="text-4xl font-bold gradient-text mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your recruitment data</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="input-field"
          >
            {timeRanges.map(range => (
              <option key={range.id} value={range.id}>{range.label}</option>
            ))}
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAnalyticsData}
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
            <span>Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Candidates',
            value: candidates.length,
            change: '+12%',
            icon: Users,
            color: 'primary'
          },
          {
            title: 'Avg Score',
            value: `${Math.round(candidates.reduce((acc, c) => acc + (c.analysis?.overall_score || 0), 0) / candidates.length) || 0}%`,
            change: '+5%',
            icon: Target,
            color: 'success'
          },
          {
            title: 'Highly Qualified',
            value: candidates.filter(c => c.analysis?.category === 'Highly Qualified').length,
            change: '+18%',
            icon: Award,
            color: 'warning'
          },
          {
            title: 'This Month',
            value: candidates.filter(c => {
              const uploadDate = new Date(c.upload_date);
              const now = new Date();
              return uploadDate.getMonth() === now.getMonth() && uploadDate.getFullYear() === now.getFullYear();
            }).length,
            change: '+25%',
            icon: Calendar,
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
              className="card-gradient p-6 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <motion.p 
                    className="text-3xl font-bold text-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                  >
                    {metric.value}
                  </motion.p>
                  <p className="text-sm text-success-600 font-medium">{metric.change} from last month</p>
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

      {/* Chart Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    fill="url(#colorGradient)"
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'scores' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" stroke="#666" />
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

            {selectedChart === 'categories' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'skills' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsData} layout="horizontal">
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
                  <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {selectedChart === 'timeline' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 text-warning-500 mr-2" />
            Quick Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
              <span className="text-sm text-primary-700">Most Common Skill</span>
              <span className="font-semibold text-primary-900">
                {skillsData[0]?.skill || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
              <span className="text-sm text-success-700">Top Category</span>
              <span className="font-semibold text-success-900">
                {categoryData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
              <span className="text-sm text-warning-700">Avg Processing Time</span>
              <span className="font-semibold text-warning-900">2.3 seconds</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-success-500 mr-2" />
            Performance Trends
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quality Score Trend</span>
              <span className="text-success-600 font-semibold">↗ +8.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processing Speed</span>
              <span className="text-success-600 font-semibold">↗ +15.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bias Reduction</span>
              <span className="text-success-600 font-semibold">↗ +22.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">User Satisfaction</span>
              <span className="text-success-600 font-semibold">↗ +12.8%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
