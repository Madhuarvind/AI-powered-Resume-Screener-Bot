import socketio
import json
from datetime import datetime
import uuid

# Create Socket.IO server
sio = socketio.Server(
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    async_mode='threading'
)

# Create WSGI app
app = socketio.WSGIApp(sio)

# In-memory storage for rooms and participants
rooms = {}
participants = {}

class VideoCallRoom:
    def __init__(self, room_id, name, host_id, settings=None):
        self.id = room_id
        self.name = name
        self.host_id = host_id
        self.participants = {}
        self.created_at = datetime.now()
        self.settings = settings or {
            'video': True,
            'audio': True,
            'chat': True,
            'screenShare': True,
            'maxParticipants': 10
        }
        self.chat_history = []

    def add_participant(self, participant_id, participant_data):
        self.participants[participant_id] = {
            'id': participant_id,
            'name': participant_data.get('name', 'Anonymous'),
            'avatar': participant_data.get('avatar', 'A'),
            'role': participant_data.get('role', 'Member'),
            'joined_at': datetime.now(),
            'is_host': participant_id == self.host_id,
            'audio_enabled': True,
            'video_enabled': True,
            'screen_sharing': False
        }

    def remove_participant(self, participant_id):
        if participant_id in self.participants:
            del self.participants[participant_id]

    def get_participant_count(self):
        return len(self.participants)

    def is_full(self):
        return self.get_participant_count() >= self.settings['maxParticipants']

    def add_chat_message(self, message_data):
        message = {
            'id': str(uuid.uuid4()),
            'participant_id': message_data['participant_id'],
            'participant_name': message_data['participant_name'],
            'message': message_data['message'],
            'timestamp': datetime.now().isoformat()
        }
        self.chat_history.append(message)
        return message

@sio.event
def connect(sid, environ):
    print(f'🔗 Client connected: {sid}')
    participants[sid] = {
        'id': sid,
        'room_id': None,
        'connected_at': datetime.now()
    }

@sio.event
def disconnect(sid):
    print(f'❌ Client disconnected: {sid}')
    
    # Remove from room if in one
    if sid in participants:
        participant = participants[sid]
        if participant['room_id']:
            leave_room_handler(sid, {'roomId': participant['room_id']})
        del participants[sid]

@sio.event
def create_room(sid, data):
    """Create a new video call room"""
    try:
        room_id = str(uuid.uuid4())[:8]  # Short room ID
        room_name = data.get('name', 'Team Meeting')
        settings = data.get('settings', {})
        
        # Create room
        room = VideoCallRoom(room_id, room_name, sid, settings)
        rooms[room_id] = room
        
        # Add creator as host
        room.add_participant(sid, {
            'name': 'Host',
            'avatar': 'H',
            'role': 'Host'
        })
        
        # Join socket room
        sio.enter_room(sid, room_id)
        participants[sid]['room_id'] = room_id
        
        print(f'🏠 Room created: {room_id} by {sid}')
        
        sio.emit('room-created', {
            'roomId': room_id,
            'name': room_name,
            'host': True,
            'participants': room.participants,
            'settings': room.settings
        }, room=sid)
        
    except Exception as e:
        print(f'❌ Error creating room: {e}')
        sio.emit('room-error', {'error': str(e)}, room=sid)

@sio.event
def join_room(sid, data):
    """Join an existing video call room"""
    try:
        room_id = data.get('roomId')
        participant_data = data.get('participant', {})
        
        if room_id not in rooms:
            sio.emit('room-error', {'error': 'Room not found'}, room=sid)
            return
        
        room = rooms[room_id]
        
        if room.is_full():
            sio.emit('room-error', {'error': 'Room is full'}, room=sid)
            return
        
        # Add participant to room
        room.add_participant(sid, participant_data)
        
        # Join socket room
        sio.enter_room(sid, room_id)
        participants[sid]['room_id'] = room_id
        
        print(f'🚪 {sid} joined room: {room_id}')
        
        # Notify existing participants
        sio.emit('participant-joined', room.participants[sid], room=room_id, skip_sid=sid)
        
        # Send room info to new participant
        sio.emit('room-joined', {
            'roomId': room_id,
            'name': room.name,
            'participants': room.participants,
            'settings': room.settings,
            'chatHistory': room.chat_history[-50:]  # Last 50 messages
        }, room=sid)
        
    except Exception as e:
        print(f'❌ Error joining room: {e}')
        sio.emit('room-error', {'error': str(e)}, room=sid)

@sio.event
def leave_room(sid, data):
    """Leave video call room"""
    leave_room_handler(sid, data)

def leave_room_handler(sid, data):
    try:
        room_id = data.get('roomId') or participants.get(sid, {}).get('room_id')
        
        if not room_id or room_id not in rooms:
            return
        
        room = rooms[room_id]
        
        # Remove participant
        room.remove_participant(sid)
        sio.leave_room(sid, room_id)
        
        if sid in participants:
            participants[sid]['room_id'] = None
        
        print(f'👋 {sid} left room: {room_id}')
        
        # Notify other participants
        sio.emit('participant-left', sid, room=room_id)
        
        # Delete room if empty
        if room.get_participant_count() == 0:
            del rooms[room_id]
            print(f'🗑️ Room deleted: {room_id}')
        
    except Exception as e:
        print(f'❌ Error leaving room: {e}')

# WebRTC Signaling Events
@sio.event
def offer(sid, data):
    """Forward WebRTC offer"""
    try:
        to_participant = data.get('to')
        offer_data = data.get('offer')
        
        sio.emit('offer', {
            'offer': offer_data,
            'from': sid
        }, room=to_participant)
        
        print(f'📞 Offer sent from {sid} to {to_participant}')
        
    except Exception as e:
        print(f'❌ Error forwarding offer: {e}')

@sio.event
def answer(sid, data):
    """Forward WebRTC answer"""
    try:
        to_participant = data.get('to')
        answer_data = data.get('answer')
        
        sio.emit('answer', {
            'answer': answer_data,
            'from': sid
        }, room=to_participant)
        
        print(f'📱 Answer sent from {sid} to {to_participant}')
        
    except Exception as e:
        print(f'❌ Error forwarding answer: {e}')

@sio.event
def ice_candidate(sid, data):
    """Forward ICE candidate"""
    try:
        to_participant = data.get('to')
        candidate_data = data.get('candidate')
        
        sio.emit('ice-candidate', {
            'candidate': candidate_data,
            'from': sid
        }, room=to_participant)
        
    except Exception as e:
        print(f'❌ Error forwarding ICE candidate: {e}')

# Media Control Events
@sio.event
def toggle_audio(sid, data):
    """Toggle participant audio"""
    try:
        room_id = participants.get(sid, {}).get('room_id')
        if room_id and room_id in rooms:
            room = rooms[room_id]
            if sid in room.participants:
                enabled = data.get('enabled', True)
                room.participants[sid]['audio_enabled'] = enabled
                
                sio.emit('participant-audio-toggle', {
                    'participantId': sid,
                    'enabled': enabled
                }, room=room_id, skip_sid=sid)
                
    except Exception as e:
        print(f'❌ Error toggling audio: {e}')

@sio.event
def toggle_video(sid, data):
    """Toggle participant video"""
    try:
        room_id = participants.get(sid, {}).get('room_id')
        if room_id and room_id in rooms:
            room = rooms[room_id]
            if sid in room.participants:
                enabled = data.get('enabled', True)
                room.participants[sid]['video_enabled'] = enabled
                
                sio.emit('participant-video-toggle', {
                    'participantId': sid,
                    'enabled': enabled
                }, room=room_id, skip_sid=sid)
                
    except Exception as e:
        print(f'❌ Error toggling video: {e}')

@sio.event
def start_screen_share(sid, data):
    """Start screen sharing"""
    try:
        room_id = participants.get(sid, {}).get('room_id')
        if room_id and room_id in rooms:
            room = rooms[room_id]
            if sid in room.participants:
                room.participants[sid]['screen_sharing'] = True
                
                sio.emit('participant-screen-share', {
                    'participantId': sid,
                    'sharing': True
                }, room=room_id, skip_sid=sid)
                
    except Exception as e:
        print(f'❌ Error starting screen share: {e}')

@sio.event
def stop_screen_share(sid, data):
    """Stop screen sharing"""
    try:
        room_id = participants.get(sid, {}).get('room_id')
        if room_id and room_id in rooms:
            room = rooms[room_id]
            if sid in room.participants:
                room.participants[sid]['screen_sharing'] = False
                
                sio.emit('participant-screen-share', {
                    'participantId': sid,
                    'sharing': False
                }, room=room_id, skip_sid=sid)
                
    except Exception as e:
        print(f'❌ Error stopping screen share: {e}')

# Chat Events
@sio.event
def chat_message(sid, data):
    """Send chat message"""
    try:
        room_id = data.get('roomId') or participants.get(sid, {}).get('room_id')
        message_text = data.get('message', '').strip()
        
        if not room_id or room_id not in rooms or not message_text:
            return
        
        room = rooms[room_id]
        participant = room.participants.get(sid)
        
        if not participant:
            return
        
        # Create message
        message_data = {
            'participant_id': sid,
            'participant_name': participant['name'],
            'message': message_text
        }
        
        message = room.add_chat_message(message_data)
        
        # Broadcast to room
        sio.emit('chat-message', message, room=room_id)
        
        print(f'💬 Chat message in {room_id}: {participant["name"]}: {message_text}')
        
    except Exception as e:
        print(f'❌ Error sending chat message: {e}')

# Room Management Events
@sio.event
def get_room_info(sid, data):
    """Get room information"""
    try:
        room_id = data.get('roomId')
        
        if room_id in rooms:
            room = rooms[room_id]
            sio.emit('room-info', {
                'roomId': room_id,
                'name': room.name,
                'participantCount': room.get_participant_count(),
                'maxParticipants': room.settings['maxParticipants'],
                'participants': room.participants,
                'settings': room.settings,
                'createdAt': room.created_at.isoformat()
            }, room=sid)
        else:
            sio.emit('room-error', {'error': 'Room not found'}, room=sid)
            
    except Exception as e:
        print(f'❌ Error getting room info: {e}')

@sio.event
def get_active_rooms(sid, data):
    """Get list of active rooms"""
    try:
        active_rooms = []
        for room_id, room in rooms.items():
            active_rooms.append({
                'roomId': room_id,
                'name': room.name,
                'participantCount': room.get_participant_count(),
                'maxParticipants': room.settings['maxParticipants'],
                'createdAt': room.created_at.isoformat()
            })
        
        sio.emit('active-rooms', {'rooms': active_rooms}, room=sid)
        
    except Exception as e:
        print(f'❌ Error getting active rooms: {e}')

# Health check
@sio.event
def ping(sid, data):
    """Health check ping"""
    sio.emit('pong', {'timestamp': datetime.now().isoformat()}, room=sid)

if __name__ == '__main__':
    print('🚀 Starting Video Call Server...')
    print('📹 WebRTC Signaling Server')
    print('🔗 Socket.IO Server')
    print('🌐 Server running on http://localhost:5001')

    # Run the server with threading
    import threading
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    server = pywsgi.WSGIServer(('localhost', 5001), app, handler_class=WebSocketHandler)
    server.serve_forever()
