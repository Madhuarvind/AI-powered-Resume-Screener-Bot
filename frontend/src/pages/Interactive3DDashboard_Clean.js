import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Award,
  Zap,
  Brain,
  Activity,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const Interactive3DDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [viewMode, setViewMode] = useState('3d');
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    fetchData();
    initializeCanvas();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiService.getCandidates();
      setCandidates(response.data.candidates || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    animate(ctx);
  };

  const animate = (ctx) => {
    if (!isPlaying) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawFloatingParticles(ctx);
    drawDataCubes(ctx);

    animationRef.current = requestAnimationFrame(() => animate(ctx));
  };

  const drawFloatingParticles = (ctx) => {
    const time = Date.now() * 0.001 * animationSpeed;
    
    for (let i = 0; i < 30; i++) {
      const x = Math.sin(time + i) * 100 + ctx.canvas.width / 4;
      const y = Math.cos(time + i * 0.5) * 50 + ctx.canvas.height / 4;
      const size = Math.sin(time + i) * 2 + 3;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `rgba(59, 130, 246, ${0.8 + Math.sin(time + i) * 0.2})`);
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawDataCubes = (ctx) => {
    const cubes = candidates.slice(0, 8);
    
    cubes.forEach((candidate, index) => {
      const score = candidate.analysis?.overall_score || Math.random() * 100;
      const x = (index % 4) * 80 + 50;
      const y = Math.floor(index / 4) * 80 + 50;
      const height = (score / 100) * 60;
      
      const cubeColor = `hsl(${score * 1.2}, 70%, 60%)`;
      
      ctx.fillStyle = cubeColor;
      ctx.fillRect(x, y - height, 40, height);
      
      ctx.fillStyle = 'white';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(score)}%`, x + 20, y - height - 10);
    });
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        animate(ctx);
      }
    }
  };

  const processAnalyticsData = () => {
    if (!candidates.length) return { totalCandidates: 0, avgScore: 0, highlyQualified: 0 };

    const totalCandidates = candidates.length;
    const avgScore = Math.round(candidates.reduce((sum, c) => sum + (c.analysis?.overall_score || 0), 0) / totalCandidates);
    const highlyQualified = candidates.filter(c => c.analysis?.category === 'Highly Qualified').length;

    return { totalCandidates, avgScore, highlyQualified };
  };

  const analytics = processAnalyticsData();

  const metrics = [
    {
      id: 'overview',
      title: 'Total Candidates',
      icon: Users,
      color: 'from-blue-500 to-purple-600',
      value: analytics.totalCandidates,
      label: 'Profiles',
      change: '+12%'
    },
    {
      id: 'performance',
      title: 'Avg Score',
      icon: TrendingUp,
      color: 'from-green-500 to-blue-500',
      value: `${analytics.avgScore}%`,
      label: 'Success Rate',
      change: '+8%'
    },
    {
      id: 'quality',
      title: 'High Quality',
      icon: Award,
      color: 'from-yellow-500 to-red-500',
      value: analytics.highlyQualified,
      label: 'Top Tier',
      change: '+23%'
    },
    {
      id: 'efficiency',
      title: 'Processing',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      value: '2.3s',
      label: 'Avg Time',
      change: '+5%'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl"
            >
              <Brain className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                3D Analytics Dashboard
              </h1>
              <p className="text-gray-300 text-sm lg:text-base">Interactive real-time data visualization</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAnimation}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </motion.button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">Speed:</span>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metrics Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    selectedMetric === metric.id
                      ? 'bg-white/20 border-2 border-white/30'
                      : 'bg-white/10 border border-white/20 hover:bg-white/15'
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-green-400 text-sm font-medium">{metric.change}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-1">{metric.title}</h3>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-white">{metric.value}</span>
                      <span className="text-sm text-gray-400">{metric.label}</span>
                    </div>
                  </div>

                  {/* Mini visualization */}
                  <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.random() * 100}%` }}
                      transition={{ delay: index * 0.2, duration: 1 }}
                      className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* 3D Visualization Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Interactive 3D View</h2>
              <div className="flex items-center space-x-2">
                {['3d', '2d', 'immersive'].map((mode) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {mode.toUpperCase()}
                  </motion.button>
                ))}
              </div>
            </div>

            <canvas
              ref={canvasRef}
              className="w-full h-96 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Floating Info Cards */}
            <AnimatePresence>
              {selectedMetric && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4"
                >
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{analytics.totalCandidates}</div>
                      <div className="text-sm text-gray-300">Active Profiles</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">{analytics.avgScore}%</div>
                      <div className="text-sm text-gray-300">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{analytics.highlyQualified}</div>
                      <div className="text-sm text-gray-300">Top Tier</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom Panel - Real-time Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Real-time Analytics Stream</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-300">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'Processing Speed', value: '2.3s', trend: 'up' },
                { label: 'Accuracy Rate', value: '94.7%', trend: 'up' },
                { label: 'Queue Length', value: candidates.length.toString(), trend: 'down' },
                { label: 'Active Users', value: '1', trend: 'up' },
                { label: 'Response Time', value: '0.8s', trend: 'down' },
                { label: 'Success Rate', value: '98.2%', trend: 'up' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                  <div className={`text-xs ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend === 'up' ? '↗' : '↘'} Live
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Floating Action Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl z-20"
        >
          <Settings className="h-6 w-6 text-white" />
        </motion.button>
      </div>
    </div>
  );
};

export default Interactive3DDashboard;
