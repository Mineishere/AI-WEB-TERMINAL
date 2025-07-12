/**
 * AI Chat Manager for Cyberpunk AI Assistant
 * Handles AI conversation interface with real-time responses
 */

class AIChatManager {
    constructor() {
        this.socket = null;
        this.chatMessages = null;
        this.chatInput = null;
        this.sendButton = null;
        this.conversationHistory = [];
        this.isTyping = false;
        this.typingTimeout = null;
        this.messageId = 0;
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventHandlers();
        this.showWelcomeMessage();
    }

    setupElements() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-btn');
        
        if (!this.chatMessages || !this.chatInput || !this.sendButton) {
            console.error('Required chat elements not found');
            return;
        }
    }

    setupEventHandlers() {
        // Send button click
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send message
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize input
        this.chatInput.addEventListener('input', () => {
            this.autoResizeInput();
        });

        // Clear chat button
        const clearChatBtn = document.getElementById('clear-chat');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => {
                this.clearChat();
            });
        }

        // Focus input on load
        this.chatInput.focus();
    }

    setSocket(socket) {
        this.socket = socket;
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        if (!this.socket) return;

        // Handle AI responses
        this.socket.on('ai_response', (data) => {
            this.hideTypingIndicator();
            this.addMessage('AI', data.response, 'ai-message');
            this.addToHistory('assistant', data.response);
        });

        // Handle connection status
        this.socket.on('connect', () => {
            this.updateConnectionStatus('online');
        });

        this.socket.on('disconnect', () => {
            this.updateConnectionStatus('offline');
            this.hideTypingIndicator();
        });

        // Handle errors
        this.socket.on('error', (error) => {
            this.hideTypingIndicator();
            this.addMessage('ERROR', `Connection error: ${error.message}`, 'error-message');
        });
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage('USER', message, 'user-message');
        this.addToHistory('user', message);

        // Clear input
        this.chatInput.value = '';
        this.autoResizeInput();

        // Send to AI via socket
        if (this.socket && this.socket.connected) {
            this.showTypingIndicator();
            this.socket.emit('ai_chat', { message: message });
        } else {
            // Fallback to HTTP request
            this.sendMessageHttp(message);
        }

        // Focus input
        this.chatInput.focus();
    }

    async sendMessageHttp(message) {
        try {
            this.showTypingIndicator();
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.hideTypingIndicator();
            
            if (data.error) {
                this.addMessage('ERROR', data.error, 'error-message');
            } else {
                this.addMessage('AI', data.response, 'ai-message');
                this.addToHistory('assistant', data.response);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('ERROR', `Failed to get AI response: ${error.message}`, 'error-message');
        }
    }

    addMessage(sender, text, className = '') {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${className}`;
        messageElement.id = `message-${this.messageId++}`;

        const timestamp = new Date().toLocaleTimeString();
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${sender}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-text">${this.formatMessage(text)}</div>
            </div>
        `;

        // Add animation
        messageElement.classList.add('fade-in');
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();

        // Add glitch effect for error messages
        if (className === 'error-message') {
            messageElement.classList.add('glitch');
        }

        // Add cyberpunk effects for AI messages
        if (className === 'ai-message') {
            this.addNeuralEffect(messageElement);
        }
    }

    formatMessage(text) {
        // Convert markdown-style formatting to HTML
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        // Highlight code blocks
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        return formatted;
    }

    addNeuralEffect(element) {
        // Add subtle neural interface effect
        const messageText = element.querySelector('.message-text');
        if (messageText) {
            messageText.style.animation = 'neural-glow 2s ease-in-out';
            
            setTimeout(() => {
                messageText.style.animation = '';
            }, 2000);
        }
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.id = 'typing-indicator';
        
        typingElement.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">AI</span>
                    <span class="message-time">Processing...</span>
                </div>
                <div class="message-text">
                    <span>Neural networks processing</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    addToHistory(role, content) {
        this.conversationHistory.push({ role, content });
        
        // Keep only last 20 messages to manage memory
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    clearChat() {
        // Clear messages but keep system message
        const systemMessage = this.chatMessages.querySelector('.system-message');
        this.chatMessages.innerHTML = '';
        
        if (systemMessage) {
            this.chatMessages.appendChild(systemMessage);
        }
        
        // Clear history
        this.conversationHistory = [];
        
        // Reset message ID
        this.messageId = 0;
        
        // Add clear confirmation
        this.addMessage('SYSTEM', 'Neural interface cleared. Ready for new queries.', 'system-message');
    }

    showWelcomeMessage() {
        // Update the system message timestamp
        const systemMessage = this.chatMessages.querySelector('.system-message .message-time');
        if (systemMessage) {
            systemMessage.textContent = new Date().toLocaleTimeString();
        }
    }

    autoResizeInput() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = status.toUpperCase();
            statusElement.className = `status-value ${status}`;
        }
    }

    // Predefined commands
    handleCommand(command) {
        const cmd = command.toLowerCase().trim();
        
        switch (cmd) {
            case '/help':
                this.showHelpMessage();
                break;
            case '/clear':
                this.clearChat();
                break;
            case '/status':
                this.showSystemStatus();
                break;
            case '/matrix':
                this.showMatrixEffect();
                break;
            case '/glitch':
                this.addGlitchEffect();
                break;
            default:
                return false;
        }
        return true;
    }

    showHelpMessage() {
        const helpText = `
Available Commands:
/help - Show this help message
/clear - Clear chat history
/status - Show system status
/matrix - Show matrix effect
/glitch - Add glitch effect

Tips:
- Use natural language for AI queries
- Ask about programming, systems, or cybersecurity
- Request code examples or explanations
- Get help with terminal commands
        `;
        
        this.addMessage('SYSTEM', helpText, 'system-message');
    }

    async showSystemStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            const statusText = `
System Status Report:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Connection: ${this.socket && this.socket.connected ? 'ONLINE' : 'OFFLINE'}
🤖 AI Core: ${data.ai_available ? 'ACTIVE' : 'INACTIVE'}
🌐 OpenAI: ${data.openai_available ? 'AVAILABLE' : 'UNAVAILABLE'}
🦙 Ollama: ${data.ollama_available ? 'AVAILABLE' : 'UNAVAILABLE'}
🆔 Session: ${data.session_id ? data.session_id.substring(0, 8) + '...' : 'UNKNOWN'}
🕒 Server Time: ${new Date(data.server_time).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            `;
            
            this.addMessage('SYSTEM', statusText, 'system-message');
        } catch (error) {
            this.addMessage('ERROR', `Failed to get system status: ${error.message}`, 'error-message');
        }
    }

    showMatrixEffect() {
        const matrixText = `
█▓▒░ MATRIX INTERFACE ACTIVATED ░▒▓█

01001000 01100101 01101100 01101100 01101111
01010111 01101111 01110010 01101100 01100100
01001001 01000001 01001101 01000001 01001100
01001001 01010110 01000101 01000101 01000101

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

Neural pathways: SYNCHRONIZED
Data streams: FLOWING
Matrix integrity: STABLE

█▓▒░ READY FOR DIGITAL ENLIGHTENMENT ░▒▓█
        `;
        
        this.addMessage('MATRIX', matrixText, 'matrix-message');
    }

    addGlitchEffect() {
        const glitchText = `
█▓▒░ G̴̢̛̘̹̈́L̶̰̈́̈́Ì̴̧̹̤T̵̰̃̈C̷̰̈́̈́M̶̰̈́Ö̶̰́D̶̰̈́Ḛ̶̈́ ̴̰̈́Ä̶̰́C̶̰̈́T̶̰̈́Ḭ̶̈́V̶̰̈́Ä̶̰́T̶̰̈́Ḛ̶̈́D̶̰̈́ ░▒▓█

E̷R̷R̷O̷R̷ ̷I̷N̷ ̷T̷H̷E̷ ̷M̷A̷T̷R̷I̷X̷
R̸E̸A̸L̸I̸T̸Y̸ ̸D̸I̸S̸T̸O̸R̸T̸I̸O̸N̸ ̸D̸E̸T̸E̸C̸T̸E̸D̸
N̶E̶U̶R̶A̶L̶ ̶I̶N̶T̶E̶R̶F̶A̶C̶E̶ ̶C̶O̶M̶P̶R̶O̶M̶I̶S̶E̶D̶

S̴Y̴S̴T̴E̴M̴ ̴R̴E̴S̴T̴A̴B̴I̴L̴I̴Z̴I̴N̴G̴.̴.̴.̴
G̷L̷I̷T̷C̷H̷ ̷E̷F̷F̷E̷C̷T̷ ̷T̷E̷R̷M̷I̷N̷A̷T̷E̷D̷

█▓▒░ NORMAL OPERATIONS RESUMED ░▒▓█
        `;
        
        const messageElement = this.addMessage('GLITCH', glitchText, 'glitch-message');
    }

    // Voice commands (if supported)
    setupVoiceCommands() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.chatInput.value = transcript;
                this.sendMessage();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
        }
    }

    startVoiceInput() {
        if (this.recognition) {
            this.recognition.start();
            this.addMessage('SYSTEM', 'Voice input activated. Speak your command.', 'system-message');
        }
    }

    // Cleanup
    destroy() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        if (this.recognition) {
            this.recognition.stop();
        }
    }
}

// Export for use in other modules
window.AIChatManager = AIChatManager;