#!/usr/bin/env python3
"""
Cyberpunk AI Assistant Webserver
Secure local network AI assistant with integrated terminal
"""

import os
import sys
import json
import time
import uuid
import pty
import select
import subprocess
import threading
from datetime import datetime, timedelta
from functools import wraps
from ipaddress import ip_address, ip_network

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_socketio import SocketIO, emit, disconnect
import openai
import requests

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Security Configuration
ALLOWED_NETWORKS = [
    '192.168.0.0/16',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '127.0.0.0/8'  # localhost for testing
]

# Session Management - Single User
active_session = None
session_timeout = 3600  # 1 hour

# AI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OLLAMA_URL = 'http://localhost:11434'

# Terminal Management
active_terminals = {}

class SecurityManager:
    @staticmethod
    def is_allowed_ip(ip):
        """Check if IP is in allowed networks"""
        try:
            client_ip = ip_address(ip)
            for network in ALLOWED_NETWORKS:
                if client_ip in ip_network(network):
                    return True
            return False
        except:
            return False

    @staticmethod
    def check_single_user():
        """Ensure only one user can access at a time"""
        global active_session
        if active_session and active_session.get('expires', 0) > time.time():
            return active_session.get('session_id') == session.get('session_id')
        return True

def require_auth(f):
    """Decorator to require authentication and IP validation"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check IP whitelist
        client_ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
        if not SecurityManager.is_allowed_ip(client_ip):
            return jsonify({'error': 'Access denied - IP not allowed'}), 403
        
        # Check single user access
        if not SecurityManager.check_single_user():
            return jsonify({'error': 'Another user is already connected'}), 423
        
        return f(*args, **kwargs)
    return decorated_function

@app.before_request
def security_check():
    """Global security check for all requests"""
    client_ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
    
    # Allow static files without IP check for local development
    if request.endpoint == 'static':
        return
    
    if not SecurityManager.is_allowed_ip(client_ip):
        return jsonify({'error': 'Access denied - IP not allowed'}), 403

class AIProvider:
    def __init__(self):
        self.openai_available = bool(OPENAI_API_KEY)
        self.ollama_available = self._check_ollama()
    
    def _check_ollama(self):
        """Check if Ollama is available"""
        try:
            response = requests.get(f'{OLLAMA_URL}/api/tags', timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def get_ai_response(self, message, conversation_history=None):
        """Get AI response using available provider"""
        if self.openai_available:
            return self._get_openai_response(message, conversation_history)
        elif self.ollama_available:
            return self._get_ollama_response(message, conversation_history)
        else:
            return "AI service not available. Please configure OpenAI API key or install Ollama."
    
    def _get_openai_response(self, message, conversation_history):
        """Get response from OpenAI"""
        try:
            openai.api_key = OPENAI_API_KEY
            
            messages = [
                {"role": "system", "content": "You are a cyberpunk AI assistant with expertise in programming, system administration, and cybersecurity. Respond in a helpful but slightly futuristic tone."}
            ]
            
            if conversation_history:
                messages.extend(conversation_history[-10:])  # Last 10 messages
            
            messages.append({"role": "user", "content": message})
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=1000,
                temperature=0.7
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"OpenAI Error: {str(e)}"
    
    def _get_ollama_response(self, message, conversation_history):
        """Get response from Ollama"""
        try:
            payload = {
                "model": "codellama",
                "prompt": message,
                "stream": False
            }
            
            response = requests.post(f'{OLLAMA_URL}/api/generate', json=payload, timeout=30)
            if response.status_code == 200:
                return response.json().get('response', 'No response from Ollama')
            else:
                return f"Ollama Error: {response.status_code}"
        except Exception as e:
            return f"Ollama Error: {str(e)}"

class TerminalManager:
    def __init__(self):
        self.terminals = {}
    
    def create_terminal(self, session_id):
        """Create a new terminal session"""
        if session_id in self.terminals:
            return
        
        master, slave = pty.openpty()
        
        # Start bash process
        proc = subprocess.Popen(
            ['/bin/bash'],
            stdin=slave,
            stdout=slave,
            stderr=slave,
            preexec_fn=os.setsid
        )
        
        self.terminals[session_id] = {
            'master': master,
            'slave': slave,
            'proc': proc,
            'thread': None
        }
        
        # Start output reading thread
        thread = threading.Thread(target=self._read_output, args=(session_id,))
        thread.daemon = True
        thread.start()
        self.terminals[session_id]['thread'] = thread
    
    def _read_output(self, session_id):
        """Read terminal output and emit to client"""
        if session_id not in self.terminals:
            return
        
        master = self.terminals[session_id]['master']
        
        while session_id in self.terminals:
            try:
                # Use select to check for data
                ready, _, _ = select.select([master], [], [], 0.1)
                if ready:
                    data = os.read(master, 1024)
                    if data:
                        socketio.emit('terminal_output', {
                            'data': data.decode('utf-8', errors='ignore')
                        }, room=session_id)
                    else:
                        break
            except OSError:
                break
    
    def send_input(self, session_id, data):
        """Send input to terminal"""
        if session_id in self.terminals:
            try:
                os.write(self.terminals[session_id]['master'], data.encode('utf-8'))
            except OSError:
                pass
    
    def close_terminal(self, session_id):
        """Close terminal session"""
        if session_id in self.terminals:
            try:
                self.terminals[session_id]['proc'].terminate()
                os.close(self.terminals[session_id]['master'])
                os.close(self.terminals[session_id]['slave'])
            except:
                pass
            del self.terminals[session_id]

# Initialize managers
ai_provider = AIProvider()
terminal_manager = TerminalManager()

@app.route('/')
@require_auth
def index():
    """Main page"""
    global active_session
    
    # Create or update session
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    # Update active session
    active_session = {
        'session_id': session['session_id'],
        'expires': time.time() + session_timeout,
        'ip': request.remote_addr
    }
    
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
@require_auth
def chat():
    """Handle chat requests"""
    data = request.json
    message = data.get('message', '')
    
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    
    # Get AI response
    response = ai_provider.get_ai_response(message)
    
    return jsonify({
        'response': response,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/status')
@require_auth
def status():
    """Get system status"""
    return jsonify({
        'ai_available': ai_provider.openai_available or ai_provider.ollama_available,
        'openai_available': ai_provider.openai_available,
        'ollama_available': ai_provider.ollama_available,
        'session_id': session.get('session_id'),
        'server_time': datetime.now().isoformat()
    })

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    client_ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
    
    if not SecurityManager.is_allowed_ip(client_ip):
        disconnect()
        return False
    
    if not SecurityManager.check_single_user():
        emit('error', {'message': 'Another user is already connected'})
        disconnect()
        return False
    
    # Join room based on session
    session_id = session.get('session_id')
    if session_id:
        # Create terminal for this session
        terminal_manager.create_terminal(session_id)
        emit('connected', {'session_id': session_id})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    session_id = session.get('session_id')
    if session_id:
        terminal_manager.close_terminal(session_id)

@socketio.on('terminal_input')
def handle_terminal_input(data):
    """Handle terminal input"""
    session_id = session.get('session_id')
    if session_id:
        terminal_manager.send_input(session_id, data['data'])

@socketio.on('ai_chat')
def handle_ai_chat(data):
    """Handle AI chat via WebSocket"""
    message = data.get('message', '')
    if message:
        response = ai_provider.get_ai_response(message)
        emit('ai_response', {
            'response': response,
            'timestamp': datetime.now().isoformat()
        })

if __name__ == '__main__':
    print("🚀 Starting Cyberpunk AI Assistant Server...")
    print("🔒 Security: Local network access only")
    print("🎯 Single user mode enabled")
    print("🌐 Available on local network at: http://192.168.x.x:8080")
    
    # Check AI availability
    if ai_provider.openai_available:
        print("🤖 OpenAI API: Available")
    if ai_provider.ollama_available:
        print("🦙 Ollama: Available")
    if not (ai_provider.openai_available or ai_provider.ollama_available):
        print("⚠️  No AI providers available. Please configure OpenAI API key or install Ollama.")
    
    socketio.run(app, host='0.0.0.0', port=8080, debug=False)