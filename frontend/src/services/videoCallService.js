import { io } from 'socket.io-client';

class VideoCallService {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.remoteStreams = new Map();
    this.peerConnections = new Map();
    this.isHost = false;
    this.roomId = null;
    this.participants = new Map();
    this.isConnected = false;
    
    // WebRTC configuration
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        // Add TURN servers for production
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
      iceCandidatePoolSize: 10
    };

    this.mediaConstraints = {
      video: {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        frameRate: { min: 15, ideal: 30, max: 60 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };

    this.callbacks = {
      onParticipantJoined: null,
      onParticipantLeft: null,
      onRemoteStream: null,
      onConnectionStateChange: null,
      onError: null,
      onChatMessage: null
    };
  }

  // Initialize socket connection
  async initializeSocket() {
    try {
      this.socket = io('http://localhost:5001', {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to video call server');
        this.isConnected = true;
        this.callbacks.onConnectionStateChange?.('connected');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from video call server');
        this.isConnected = false;
        this.callbacks.onConnectionStateChange?.('disconnected');
      });

      // Room events
      this.socket.on('room-created', (data) => {
        console.log('🏠 Room created:', data.roomId);
        this.roomId = data.roomId;
        this.isHost = true;
      });

      this.socket.on('room-joined', (data) => {
        console.log('🚪 Joined room:', data.roomId);
        this.roomId = data.roomId;
        this.participants = new Map(Object.entries(data.participants));
        this.callbacks.onParticipantJoined?.(data.participants);
      });

      // Participant events
      this.socket.on('participant-joined', (participant) => {
        console.log('👤 Participant joined:', participant);
        this.participants.set(participant.id, participant);
        this.callbacks.onParticipantJoined?.(participant);
        this.createPeerConnection(participant.id);
      });

      this.socket.on('participant-left', (participantId) => {
        console.log('👋 Participant left:', participantId);
        this.participants.delete(participantId);
        this.closePeerConnection(participantId);
        this.callbacks.onParticipantLeft?.(participantId);
      });

      // WebRTC signaling
      this.socket.on('offer', async (data) => {
        await this.handleOffer(data.offer, data.from);
      });

      this.socket.on('answer', async (data) => {
        await this.handleAnswer(data.answer, data.from);
      });

      this.socket.on('ice-candidate', async (data) => {
        await this.handleIceCandidate(data.candidate, data.from);
      });

      // Chat events
      this.socket.on('chat-message', (data) => {
        this.callbacks.onChatMessage?.(data);
      });

      // Error handling
      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
        this.callbacks.onError?.(error);
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize socket:', error);
      this.callbacks.onError?.(error);
      return false;
    }
  }

  // Start local media stream
  async startLocalStream(constraints = this.mediaConstraints) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('📹 Local stream started');
      return this.localStream;
    } catch (error) {
      console.error('❌ Failed to start local stream:', error);
      this.callbacks.onError?.('Failed to access camera/microphone');
      throw error;
    }
  }

  // Create or join room
  async createRoom(roomName = 'Team Meeting') {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    const roomData = {
      name: roomName,
      maxParticipants: 10,
      settings: {
        video: true,
        audio: true,
        chat: true,
        screenShare: true
      }
    };

    this.socket.emit('create-room', roomData);
    return new Promise((resolve) => {
      this.socket.once('room-created', (data) => {
        resolve(data.roomId);
      });
    });
  }

  async joinRoom(roomId, participantInfo) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    const joinData = {
      roomId,
      participant: {
        name: participantInfo.name,
        avatar: participantInfo.avatar,
        role: participantInfo.role
      }
    };

    this.socket.emit('join-room', joinData);
    return new Promise((resolve, reject) => {
      this.socket.once('room-joined', resolve);
      this.socket.once('room-error', reject);
    });
  }

  // Create peer connection
  async createPeerConnection(participantId) {
    try {
      const peerConnection = new RTCPeerConnection(this.rtcConfig);
      this.peerConnections.set(participantId, peerConnection);

      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
        });
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('📺 Received remote stream from:', participantId);
        const [remoteStream] = event.streams;
        this.remoteStreams.set(participantId, remoteStream);
        this.callbacks.onRemoteStream?.(participantId, remoteStream);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('ice-candidate', {
            candidate: event.candidate,
            to: participantId
          });
        }
      };

      // Connection state monitoring
      peerConnection.onconnectionstatechange = () => {
        console.log(`🔗 Connection state with ${participantId}:`, peerConnection.connectionState);
        this.callbacks.onConnectionStateChange?.(peerConnection.connectionState, participantId);
      };

      // Create offer if we're the caller
      if (this.isHost) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        this.socket.emit('offer', {
          offer: offer,
          to: participantId
        });
      }

      return peerConnection;
    } catch (error) {
      console.error('❌ Failed to create peer connection:', error);
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  // Handle incoming offer
  async handleOffer(offer, fromParticipant) {
    try {
      const peerConnection = this.peerConnections.get(fromParticipant) || 
                           await this.createPeerConnection(fromParticipant);

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.socket.emit('answer', {
        answer: answer,
        to: fromParticipant
      });
    } catch (error) {
      console.error('❌ Failed to handle offer:', error);
      this.callbacks.onError?.(error);
    }
  }

  // Handle incoming answer
  async handleAnswer(answer, fromParticipant) {
    try {
      const peerConnection = this.peerConnections.get(fromParticipant);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('❌ Failed to handle answer:', error);
      this.callbacks.onError?.(error);
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(candidate, fromParticipant) {
    try {
      const peerConnection = this.peerConnections.get(fromParticipant);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('❌ Failed to handle ICE candidate:', error);
    }
  }

  // Media controls
  toggleAudio(enabled) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Screen sharing
  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          mediaSource: 'screen',
          width: { max: 1920 },
          height: { max: 1080 },
          frameRate: { max: 30 }
        },
        audio: true
      });

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      
      this.peerConnections.forEach(async (peerConnection) => {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      return screenStream;
    } catch (error) {
      console.error('❌ Failed to start screen share:', error);
      this.callbacks.onError?.('Failed to start screen sharing');
      throw error;
    }
  }

  async stopScreenShare() {
    try {
      // Replace back to camera
      const videoTrack = this.localStream?.getVideoTracks()[0];
      
      if (videoTrack) {
        this.peerConnections.forEach(async (peerConnection) => {
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        });
      }
    } catch (error) {
      console.error('❌ Failed to stop screen share:', error);
    }
  }

  // Chat functionality
  sendChatMessage(message) {
    if (this.socket && this.roomId) {
      const chatData = {
        roomId: this.roomId,
        message: message,
        timestamp: new Date().toISOString()
      };
      this.socket.emit('chat-message', chatData);
    }
  }

  // Close peer connection
  closePeerConnection(participantId) {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
    }
    
    const remoteStream = this.remoteStreams.get(participantId);
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStreams.delete(participantId);
    }
  }

  // Leave room and cleanup
  async leaveRoom() {
    try {
      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Close all peer connections
      this.peerConnections.forEach((peerConnection, participantId) => {
        this.closePeerConnection(participantId);
      });

      // Leave room via socket
      if (this.socket && this.roomId) {
        this.socket.emit('leave-room', { roomId: this.roomId });
      }

      // Reset state
      this.roomId = null;
      this.isHost = false;
      this.participants.clear();
      this.remoteStreams.clear();
      this.peerConnections.clear();

      console.log('👋 Left video call room');
    } catch (error) {
      console.error('❌ Error leaving room:', error);
      this.callbacks.onError?.(error);
    }
  }

  // Disconnect from service
  disconnect() {
    this.leaveRoom();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
  }

  // Event listeners
  on(event, callback) {
    this.callbacks[event] = callback;
  }

  off(event) {
    this.callbacks[event] = null;
  }

  // Get statistics
  async getConnectionStats(participantId) {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      const stats = await peerConnection.getStats();
      return stats;
    }
    return null;
  }
}

export default VideoCallService;
