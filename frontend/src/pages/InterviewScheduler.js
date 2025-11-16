import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Users,
  Video,
  Phone,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Send,
  Bell,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  MessageSquare,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  Star,
  Eye,
  MoreHorizontal,
  X
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const InterviewScheduler = () => {
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // calendar, list, timeline
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newInterview, setNewInterview] = useState({
    candidateId: '',
    title: '',
    type: 'video', // video, phone, in-person
    date: '',
    time: '',
    duration: 60,
    interviewers: [],
    location: '',
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesRes] = await Promise.all([
        apiService.getCandidates()
      ]);
      
      setCandidates(candidatesRes.data.candidates);
      
      // Start with empty interviews - user will schedule their own
      setInterviews([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const scheduleInterview = () => {
    if (!newInterview.candidateId || !newInterview.date || !newInterview.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    const candidate = candidates.find(c => c.id === newInterview.candidateId);
    const candidateName = candidate?.analysis?.contact_info?.name || 
                         candidate?.filename || 
                         `Candidate ${newInterview.candidateId}`;
    
    const interview = {
      id: Date.now(),
      ...newInterview,
      candidateName,
      date: new Date(`${newInterview.date}T${newInterview.time}`),
      status: 'scheduled'
    };

    setInterviews(prev => [...prev, interview]);
    setShowScheduleModal(false);
    setNewInterview({
      candidateId: '',
      title: '',
      type: 'video',
      date: '',
      time: '',
      duration: 60,
      interviewers: [],
      location: '',
      notes: '',
      status: 'scheduled'
    });
    
    toast.success('Interview scheduled successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl"
            >
              <Calendar className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Interview Scheduler
              </h1>
              <p className="text-gray-600">Manage and schedule candidate interviews</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white rounded-xl p-2 shadow-lg">
              {['calendar', 'list', 'timeline'].map((mode) => (
                <motion.button
                  key={mode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    viewMode === mode
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {mode}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScheduleModal(true)}
              className="btn-gradient flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Interview</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Interviews', value: interviews.length, change: '+12%', icon: Calendar, color: 'from-blue-500 to-blue-600' },
            { title: 'This Week', value: interviews.filter(i => {
              const weekStart = new Date();
              weekStart.setDate(weekStart.getDate() - weekStart.getDay());
              return i.date >= weekStart;
            }).length, change: '+8%', icon: Clock, color: 'from-green-500 to-green-600' },
            { title: 'Completed', value: interviews.filter(i => i.status === 'completed').length, change: '+15%', icon: CheckCircle, color: 'from-purple-500 to-purple-600' },
            { title: 'Scheduled', value: interviews.filter(i => i.status === 'scheduled').length, change: '+5%', icon: Bell, color: 'from-orange-500 to-orange-600' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interview List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Interviews</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search interviews..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Filter className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {interviews && interviews.length > 0 ? interviews.map((interview, index) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedInterview(interview)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {interview.candidateName ? interview.candidateName.charAt(0).toUpperCase() : 'C'}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{interview.title || 'Interview'}</h3>
                        <p className="text-gray-600">{interview.candidateName || 'Candidate'}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(interview.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{interview.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            {getTypeIcon(interview.type)}
                            <span className="capitalize">{interview.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {interview.interviewers.length > 0 && (
                    <div className="mt-4 flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Interviewers: {interview.interviewers.join(', ')}
                      </span>
                    </div>
                  )}

                  {interview.notes && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{interview.notes}</p>
                    </div>
                  )}
                </motion.div>
              )) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
                  <p className="text-gray-500 mb-4">Schedule your first interview to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowScheduleModal(true)}
                    className="btn-gradient"
                  >
                    Schedule Interview
                  </motion.button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Schedule Interview Modal */}
        <AnimatePresence>
          {showScheduleModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowScheduleModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Schedule New Interview</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowScheduleModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Candidate</label>
                      <select
                        value={newInterview.candidateId}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, candidateId: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a candidate</option>
                        {candidates.map(candidate => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.analysis?.contact_info?.name || candidate.filename}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                      <select
                        value={newInterview.type}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="video">Video Call</option>
                        <option value="phone">Phone Call</option>
                        <option value="in-person">In Person</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Title</label>
                    <input
                      type="text"
                      value={newInterview.title}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Technical Interview - Senior Developer"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={newInterview.date}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        type="time"
                        value={newInterview.time}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        value={newInterview.duration}
                        onChange={(e) => setNewInterview(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location/Meeting Link</label>
                    <input
                      type="text"
                      value={newInterview.location}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Zoom Meeting Room or Office Address"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={newInterview.notes}
                      onChange={(e) => setNewInterview(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Interview notes, focus areas, etc."
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowScheduleModal(false)}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={scheduleInterview}
                      className="btn-gradient px-8 py-3"
                    >
                      Schedule Interview
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterviewScheduler;
