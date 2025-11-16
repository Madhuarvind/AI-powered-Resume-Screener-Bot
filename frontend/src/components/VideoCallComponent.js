import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Phone, ScreenShare, 
  MessageSquare, Settings, Users, Maximize2, Minimize2,
  Volume2, VolumeX, Camera, Monitor, PhoneOff
} from 'lucide-react';
import VideoCallService from '../services/videoCallService';
import toast from 'react-hot-toast';

const VideoCallComponent = ({ 
  isOpen, 
  onClose, 
  roomId = null, 
  participantInfo = { name: 'You', avatar: 'Y', role: 'HR Manager' } 
}) => {
  // State management
  const [videoService] = useState(() => new VideoCallService());
  const [isConnected, setIsConnected] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [participants, setParticipants] = useState(new Map());
  const [currentRoomId, setCurrentRoomId] = useState(roomId);
  
  // Media controls
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  
  // UI state
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [error, setError] = useState(null);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const chatEndRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize video service
  useEffect(() => {
    if (isOpen) {
      initializeVideoCall();
    }
    
    return () => {
      if (isInCall) {
        endCall();
      }
    };
  }, [isOpen]);

  // Setup video service callbacks
  useEffect(() => {
    videoService.on('onConnectionStateChange', handleConnectionStateChange);
    videoService.on('onParticipantJoined', handleParticipantJoined);
    videoService.on('onParticipantLeft', handleParticipantLeft);
    videoService.on('onRemoteStream', handleRemoteStream);
    videoService.on('onChatMessage', handleChatMessage);
    videoService.on('onError', handleError);

    return () => {
      videoService.off('onConnectionStateChange');
      videoService.off('onParticipantJoined');
      videoService.off('onParticipantLeft');
      videoService.off('onRemoteStream');
      videoService.off('onChatMessage');
      videoService.off('onError');
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Initialize video call
  const initializeVideoCall = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize socket connection
      const connected = await videoService.initializeSocket();
      if (!connected) {
        throw new Error('Failed to connect to video server');
      }

      // Start local media stream
      const stream = await videoService.startLocalStream();
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join or create room
      if (currentRoomId) {
        await videoService.joinRoom(currentRoomId, participantInfo);
      } else {
        const newRoomId = await videoService.createRoom('Team Meeting');
        setCurrentRoomId(newRoomId);
      }

      setIsInCall(true);
      setIsConnected(true);
      toast.success('🎥 Video call started successfully!');

    } catch (error) {
      console.error('Failed to initialize video call:', error);
      setError(error.message);
      toast.error(`Failed to start video call: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleConnectionStateChange = useCallback((state, participantId) => {
    setConnectionState(state);
    if (participantId) {
      console.log(`Connection with ${participantId}: ${state}`);
    }
  }, []);

  const handleParticipantJoined = useCallback((participant) => {
    if (typeof participant === 'object' && participant.id) {
      setParticipants(prev => new Map(prev.set(participant.id, participant)));
      toast.success(`${participant.name} joined the call`);
    } else {
      // Handle multiple participants (room join)
      const participantMap = new Map();
      Object.entries(participant).forEach(([id, data]) => {
        participantMap.set(id, data);
      });
      setParticipants(participantMap);
    }
  }, []);

  const handleParticipantLeft = useCallback((participantId) => {
    setParticipants(prev => {
      const newMap = new Map(prev);
      const participant = newMap.get(participantId);
      newMap.delete(participantId);
      
      if (participant) {
        toast.info(`${participant.name} left the call`);
      }
      
      return newMap;
    });
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(participantId);
      return newMap;
    });
  }, []);

  const handleRemoteStream = useCallback((participantId, stream) => {
    setRemoteStreams(prev => new Map(prev.set(participantId, stream)));
    
    // Assign stream to video element
    const videoRef = remoteVideoRefs.current.get(participantId);
    if (videoRef) {
      videoRef.srcObject = stream;
    }
  }, []);

  const handleChatMessage = useCallback((message) => {
    setChatMessages(prev => [...prev, message]);
  }, []);

  const handleError = useCallback((error) => {
    setError(error);
    toast.error(`Video call error: ${error}`);
  }, []);

  // Media controls
  const toggleAudio = () => {
    const enabled = !isAudioEnabled;
    const success = videoService.toggleAudio(enabled);
    if (success !== undefined) {
      setIsAudioEnabled(enabled);
      toast.success(enabled ? '🎤 Microphone on' : '🔇 Microphone off');
    }
  };

  const toggleVideo = () => {
    const enabled = !isVideoEnabled;
    const success = videoService.toggleVideo(enabled);
    if (success !== undefined) {
      setIsVideoEnabled(enabled);
      toast.success(enabled ? '📹 Camera on' : '📷 Camera off');
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        await videoService.startScreenShare();
        setIsScreenSharing(true);
        toast.success('🖥️ Screen sharing started');
      } else {
        await videoService.stopScreenShare();
        setIsScreenSharing(false);
        toast.success('🖥️ Screen sharing stopped');
      }
    } catch (error) {
      toast.error('Failed to toggle screen sharing');
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In a real implementation, you'd control audio output here
    toast.success(isSpeakerOn ? '🔇 Speaker off' : '🔊 Speaker on');
  };

  // Chat functionality
  const sendMessage = () => {
    if (newMessage.trim()) {
      videoService.sendChatMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // End call
  const endCall = async () => {
    try {
      await videoService.leaveRoom();
      setIsInCall(false);
      setIsConnected(false);
      setLocalStream(null);
      setRemoteStreams(new Map());
      setParticipants(new Map());
      setChatMessages([]);
      toast.success('📞 Call ended');
      onClose();
    } catch (error) {
      console.error('Error ending call:', error);
      onClose();
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      >
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-gray-900 rounded-2xl overflow-hidden ${
            isFullscreen ? 'w-full h-full' : 'w-11/12 h-5/6 max-w-6xl'
          }`}
        >
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold">Connecting to video call...</h3>
                <p className="text-gray-300">Please allow camera and microphone access</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg z-10">
              <p className="font-semibold">Connection Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Header */}
          <div className="bg-gray-800 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-white text-xl font-semibold">
                Team Video Call {currentRoomId && `• ${currentRoomId}`}
              </h2>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionState === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-gray-300 text-sm">
                  {participants.size + 1} participants
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowParticipants(!showParticipants)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <Users className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowChat(!showChat)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg relative"
              >
                <MessageSquare className="h-5 w-5" />
                {chatMessages.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {chatMessages.length > 9 ? '9+' : chatMessages.length}
                  </div>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>

          {/* Main Video Area */}
          <div className="flex-1 flex relative">
            {/* Video Grid */}
            <div className={`flex-1 p-4 ${showChat ? 'pr-0' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                {/* Local Video */}
                <div className="relative bg-gray-800 rounded-xl overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-lg">
                    <span className="text-white text-sm font-medium">You</span>
                  </div>
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                      <div className="text-center text-white">
                        <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Camera off</p>
                      </div>
                    </div>
                  )}
                  {!isAudioEnabled && (
                    <div className="absolute top-4 right-4 bg-red-500 rounded-full p-2">
                      <MicOff className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Remote Videos */}
                {Array.from(participants.entries()).map(([participantId, participant]) => (
                  <div key={participantId} className="relative bg-gray-800 rounded-xl overflow-hidden">
                    <video
                      ref={(ref) => {
                        if (ref) {
                          remoteVideoRefs.current.set(participantId, ref);
                          const stream = remoteStreams.get(participantId);
                          if (stream) {
                            ref.srcObject = stream;
                          }
                        }
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-lg">
                      <span className="text-white text-sm font-medium">
                        {participant.name}
                      </span>
                    </div>
                    {!participant.video_enabled && (
                      <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-xl font-bold">{participant.avatar}</span>
                          </div>
                          <p className="text-sm">{participant.name}</p>
                        </div>
                      </div>
                    )}
                    {!participant.audio_enabled && (
                      <div className="absolute top-4 right-4 bg-red-500 rounded-full p-2">
                        <MicOff className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Sidebar */}
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-gray-800 border-l border-gray-700 flex flex-col"
                >
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold">Chat</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((message, index) => (
                      <div key={index} className="text-white">
                        <div className="text-xs text-gray-400 mb-1">
                          {message.participant_name} • {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="bg-gray-700 rounded-lg p-2 text-sm">
                          {message.message}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={sendMessage}
                        className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-600"
                      >
                        Send
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleAudio}
              className={`p-4 rounded-full ${
                isAudioEnabled ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleVideo}
              className={`p-4 rounded-full ${
                isVideoEnabled ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleScreenShare}
              className={`p-4 rounded-full ${
                isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
              }`}
            >
              <ScreenShare className="h-6 w-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSpeaker}
              className={`p-4 rounded-full ${
                isSpeakerOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={endCall}
              className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <PhoneOff className="h-6 w-6" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoCallComponent;
