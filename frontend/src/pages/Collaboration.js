import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  MessageSquare,
  Video,
  Share2,
  Bell,
  Eye,
  Edit3,
  Heart,
  Star,
  Clock,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  UserPlus,
  Settings,
  Zap,
  Activity,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Phone,
  Calendar,
  FileText,
  Download,
  Upload,
  Mic,
  MicOff,
  VideoOff,
  ScreenShare,
  Volume2
} from 'lucide-react';
import { apiService } from '../services/api';
import VideoCallComponent from '../components/VideoCallComponent';
import toast from 'react-hot-toast';

const Collaboration = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [collaborationMode, setCollaborationMode] = useState('chat'); // chat, video, review
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoRoomId, setVideoRoomId] = useState(null);
  const [currentUser] = useState({
    id: 1,
    name: 'You',
    role: 'HR Manager',
    avatar: 'Y',
    status: 'online'
  });
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    initializeCollaboration();
    const cleanup = simulateRealTimeUpdates();
    return cleanup;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeCollaboration = async () => {
    try {
      // Fetch candidates for collaboration
      const candidatesResponse = await apiService.getCandidates();
      setCandidates(candidatesResponse.data.candidates || []);

      // Initialize team members with current user
      const initialTeamMembers = [
        { id: 1, name: 'You', role: 'HR Manager', avatar: 'Y', status: 'online', lastSeen: new Date() },
        { id: 2, name: 'Sarah Wilson', role: 'Senior Recruiter', avatar: 'SW', status: 'online', lastSeen: new Date() },
        { id: 3, name: 'Mike Chen', role: 'Technical Lead', avatar: 'MC', status: 'away', lastSeen: new Date() }
      ];
      
      setActiveUsers(initialTeamMembers);
      setTeamMembers(initialTeamMembers);

      // Initialize with welcome message
      const welcomeMessage = {
        id: Date.now(),
        userId: 2,
        userName: 'Sarah Wilson',
        userAvatar: 'SW',
        content: 'Welcome to the team collaboration space! Let\'s discuss our candidates.',
        timestamp: new Date(),
        type: 'message'
      };
      setMessages([welcomeMessage]);

      // Initialize shared documents
      setSharedDocuments([
        {
          id: 1,
          name: 'Interview Guidelines.pdf',
          size: '2.4 MB',
          sharedBy: 'Sarah Wilson',
          type: 'pdf',
          uploadDate: new Date()
        },
        {
          id: 2,
          name: 'Candidate Evaluation Form.docx',
          size: '1.2 MB',
          sharedBy: 'Mike Chen',
          type: 'docx',
          uploadDate: new Date()
        }
      ]);

      // Add initial notifications
      addNotification('Team collaboration session started');
      
    } catch (error) {
      console.error('Error initializing collaboration:', error);
      toast.error('Failed to load collaboration data');
    } finally {
      setLoading(false);
    }
  };

  const simulateRealTimeUpdates = () => {
    // Simulate periodic team member status updates
    const interval = setInterval(() => {
      setActiveUsers(prev => prev.map(user => {
        if (user.id !== currentUser.id) {
          const statuses = ['online', 'away', 'busy'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return { ...user, status: randomStatus, lastSeen: new Date() };
        }
        return user;
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addNotification = (message) => {
    const notification = {
      id: Date.now(),
      message,
      timestamp: new Date(),
      type: 'info'
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 recent notifications
  };

  const inviteTeamMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      // Send real email invitation
      const response = await apiService.sendTeamInvitation({
        email: newMemberEmail,
        inviter_name: currentUser.name,
        team_name: 'Resume Screener AI Team'
      });

      if (response.data.success) {
        const newMember = {
          id: Date.now(),
          name: newMemberEmail.split('@')[0],
          role: 'Team Member',
          avatar: newMemberEmail.charAt(0).toUpperCase(),
          status: 'invited',
          lastSeen: new Date(),
          email: newMemberEmail
        };

        setTeamMembers(prev => [...prev, newMember]);
        setActiveUsers(prev => [...prev, newMember]);
        setNewMemberEmail('');
        setShowInviteModal(false);

        addNotification(`Invitation sent to ${newMemberEmail}`);

        if (response.data.mock_sent) {
          toast.success(`📧 Mock invitation sent to ${newMemberEmail} (Email service not configured)`);
        } else {
          toast.success(`📧 Real invitation email sent to ${newMemberEmail}!`);
        }
      } else {
        toast.error(`Failed to send invitation: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation. Please try again.');
    }
  };

  const shareCandidate = (candidate) => {
    const candidateMessage = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: `Shared candidate: ${candidate.analysis?.contact_info?.name || candidate.filename}`,
      timestamp: new Date(),
      type: 'candidate_share',
      candidateData: candidate
    };

    setMessages(prev => [...prev, candidateMessage]);
    addNotification(`Candidate ${candidate.analysis?.contact_info?.name || candidate.filename} shared with team`);
    toast.success('Candidate shared with team');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const newDocument = {
      id: Date.now(),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      sharedBy: currentUser.name,
      type: file.type,
      uploadDate: new Date()
    };

    setSharedDocuments(prev => [...prev, newDocument]);
    
    const fileMessage = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: `Shared file: ${file.name}`,
      timestamp: new Date(),
      type: 'file_share',
      attachments: [newDocument]
    };

    setMessages(prev => [...prev, fileMessage]);
    addNotification(`File ${file.name} shared with team`);
    toast.success('File uploaded and shared');
  };

  const scheduleInterview = (candidate) => {
    addNotification(`Interview scheduled for ${candidate.analysis?.contact_info?.name || candidate.filename}`);
    toast.success('Interview scheduled successfully');
  };

  const markAsFavorite = (candidate) => {
    addNotification(`${candidate.analysis?.contact_info?.name || candidate.filename} marked as favorite`);
    toast.success('Candidate marked as favorite');
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: newMessage,
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate response
    setTimeout(() => {
      const responses = [
        'That sounds great! Let me take a look.',
        'I agree with your assessment.',
        'Can we schedule a follow-up meeting?',
        'Thanks for sharing that information.',
        'I\'ll review this and get back to you.'
      ];
      
      const response = {
        id: Date.now() + 1,
        userId: 2,
        userName: 'Sarah Wilson',
        userAvatar: 'SW',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'message'
      };
      
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const startVideoCall = async () => {
    try {
      // Generate unique room ID
      const roomId = `room-${Date.now()}`;
      setVideoRoomId(roomId);
      setShowVideoCall(true);
      setIsVideoCall(true);
      
      addNotification('Video call started');
      toast.success('🎥 Starting professional video call...');
      
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call. Please try again.');
    }
  };

  const endVideoCall = () => {
    setShowVideoCall(false);
    setIsVideoCall(false);
    setCollaborationMode('chat');
    setVideoRoomId(null);
    
    addNotification('Video call ended');
    toast.success('📞 Video call ended');
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toast.success(audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted');
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        toast.success(videoTrack.enabled ? 'Camera enabled' : 'Camera disabled');
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
        
        // Stop screen sharing when user stops it from browser
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          toast.info('Screen sharing stopped');
        };
        
      } else {
        setIsScreenSharing(false);
        toast.success('Screen sharing stopped');
      }
    } catch (error) {
      console.error('Error with screen sharing:', error);
      toast.error('Failed to start screen sharing');
    }
  };

  const addReaction = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          existingReaction.count += 1;
          existingReaction.users.push(currentUser.name);
        } else {
          reactions.push({ emoji, count: 1, users: [currentUser.name] });
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl"
            >
              <Users className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Team Collaboration
              </h1>
              <p className="text-gray-600">Real-time collaboration for hiring decisions</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startVideoCall}
              className="btn-gradient flex items-center space-x-2"
            >
              <Video className="h-4 w-4" />
              <span>Start Video Call</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Active Users Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Active Users */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                <span className="text-sm text-gray-500">{activeUsers.filter(u => u.status === 'online').length} online</span>
              </div>
              
              <div className="space-y-3">
                {activeUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-white`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.role}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 text-gray-400 hover:text-indigo-600"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 text-gray-400 hover:text-indigo-600"
                      >
                        <Video className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInviteModal(true)}
                className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite Team Member</span>
              </motion.button>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-start space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg"
                    >
                      <div className="p-1 bg-indigo-100 rounded-full">
                        <Activity className="h-3 w-3 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Main Collaboration Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Mode Selector */}
            <div className="flex items-center space-x-2 bg-white rounded-xl p-2 shadow-lg">
              {[
                { id: 'chat', label: 'Chat', icon: MessageSquare },
                { id: 'video', label: 'Video', icon: Video },
                { id: 'review', label: 'Review', icon: FileText }
              ].map((mode) => {
                const Icon = mode.icon;
                return (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCollaborationMode(mode.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg font-medium transition-all ${
                      collaborationMode === mode.id
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{mode.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Chat Interface */}
            {collaborationMode === 'chat' && (
              <div className="glass-card h-96 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Team Discussion</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-gray-500">Live</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-start space-x-3 ${
                          message.userId === currentUser.id ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {message.userAvatar}
                        </div>
                        
                        <div className={`flex-1 max-w-xs lg:max-w-md ${
                          message.userId === currentUser.id ? 'text-right' : ''
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-700">{message.userName}</span>
                            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                          </div>
                          
                          <div className={`p-3 rounded-2xl ${
                            message.userId === currentUser.id
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            
                            {message.attachments && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((attachment, idx) => (
                                  <div key={idx} className="flex items-center space-x-2 p-2 bg-white/20 rounded-lg">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-xs">{attachment.name}</span>
                                    <span className="text-xs opacity-70">({attachment.size})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {message.reactions && (
                            <div className="flex items-center space-x-1 mt-2">
                              {message.reactions.map((reaction, idx) => (
                                <motion.button
                                  key={idx}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="flex items-center space-x-1 px-2 py-1 bg-white rounded-full shadow-sm text-xs"
                                >
                                  <span>{reaction.emoji}</span>
                                  <span>{reaction.count}</span>
                                </motion.button>
                              ))}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => addReaction(message.id, '👍')}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Heart className="h-3 w-3" />
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="w-full p-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Paperclip className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Smile className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Call Placeholder */}
            {collaborationMode === 'video' && (
              <div className="glass-card h-96 relative overflow-hidden bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Professional Video Call</h3>
                  <p className="text-gray-300 mb-4">Click "Start Video Call" to launch full-featured video conferencing</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startVideoCall}
                    className="btn-gradient px-6 py-3"
                  >
                    🚀 Launch Video Call
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Shared Documents & Tools */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Shared Documents */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Shared Files</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-indigo-600"
                >
                  <Upload className="h-4 w-4" />
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                />
              </div>
              
              <div className="space-y-3">
                {sharedDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.size} • {doc.sharedBy}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 text-gray-400 hover:text-indigo-600"
                    >
                      <Download className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Calendar, label: 'Schedule', color: 'from-blue-500 to-blue-600', action: () => candidates.length > 0 && scheduleInterview(candidates[0]) },
                  { icon: Share2, label: 'Share', color: 'from-green-500 to-green-600', action: () => candidates.length > 0 && shareCandidate(candidates[0]) },
                  { icon: Bell, label: 'Notify', color: 'from-yellow-500 to-yellow-600', action: () => addNotification('Team notification sent') },
                  { icon: Star, label: 'Favorite', color: 'from-purple-500 to-purple-600', action: () => candidates.length > 0 && markAsFavorite(candidates[0]) }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={action.action}
                      className={`p-4 bg-gradient-to-r ${action.color} text-white rounded-xl text-center`}
                    >
                      <Icon className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Invite Team Member Modal */}
        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowInviteModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Invite Team Member</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowInviteModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && inviteTeamMember()}
                      placeholder="colleague@company.com"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowInviteModal(false)}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={inviteTeamMember}
                      className="btn-gradient px-8 py-3"
                    >
                      Send Invite
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Candidate Selection Modal */}
        {collaborationMode === 'review' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Candidate for Review</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidates.slice(0, 6).map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      shareCandidate(candidate);
                    }}
                    className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {(candidate.analysis?.contact_info?.name || candidate.filename).charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {candidate.analysis?.contact_info?.name || candidate.filename}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Score: {candidate.analysis?.overall_score || 0}% • {candidate.analysis?.experience_level || 'N/A'}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          {(candidate.analysis?.key_skills || []).slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Professional Video Call Component */}
        <VideoCallComponent
          isOpen={showVideoCall}
          onClose={endVideoCall}
          roomId={videoRoomId}
          participantInfo={{
            name: currentUser.name,
            avatar: currentUser.avatar,
            role: currentUser.role
          }}
        />
      </div>
    </div>
  );
};

export default Collaboration;
