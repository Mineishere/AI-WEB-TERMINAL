/**
 * Main Application Controller for Cyberpunk AI Assistant
 * Coordinates all components and manages the overall application state
 */

class CyberpunkAIApp {
    constructor() {
        this.socket = null;
        this.terminalManager = null;
        this.chatManager = null;
        this.isInitialized = false;
        this.connectionRetryCount = 0;
        this.maxRetries = 5;
        this.startTime = Date.now();
        this.sessionId = null;
        
        this.init();
    }

    async init() {
        try {
            this.showLoadingScreen();
            await this.waitForDOM();
            
            // Initialize components
            this.initializeComponents();
            await this.establishConnection();
            await this.checkSystemStatus();
            
            // Setup application events
            this.setupApplicationEvents();
            
            // Start monitoring
            this.startMonitoring();
            
            this.hideLoadingScreen();
            this.isInitialized = true;
            
            console.log('🚀 Cyberpunk AI Assistant initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showError('Failed to initialize neural interface', error.message);
            this.hideLoadingScreen();
        }
    }

    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    initializeComponents() {
        // Initialize Terminal Manager
        if (window.TerminalManager) {
            this.terminalManager = new TerminalManager();
            console.log('✓ Terminal Manager initialized');
        } else {
            console.error('❌ Terminal Manager not found');
        }

        // Initialize Chat Manager
        if (window.AIChatManager) {
            this.chatManager = new AIChatManager();
            console.log('✓ Chat Manager initialized');
        } else {
            console.error('❌ Chat Manager not found');
        }
    }

    async establishConnection() {
        return new Promise((resolve, reject) => {
            try {
                // Initialize Socket.IO connection
                this.socket = io({
                    transports: ['websocket', 'polling'],
                    timeout: 10000,
                    forceNew: true
                });

                // Connection event handlers
                this.socket.on('connect', () => {
                    console.log('🔗 Socket.IO connected');
                    this.connectionRetryCount = 0;
                    
                    // Pass socket to components
                    if (this.terminalManager) {
                        this.terminalManager.setSocket(this.socket);
                    }
                    if (this.chatManager) {
                        this.chatManager.setSocket(this.socket);
                    }
                    
                    this.updateConnectionStatus('online');
                    resolve();
                });

                this.socket.on('disconnect', (reason) => {
                    console.log('❌ Socket.IO disconnected:', reason);
                    this.updateConnectionStatus('offline');
                    
                    // Auto-reconnect if not a manual disconnect
                    if (reason !== 'io client disconnect' && this.connectionRetryCount < this.maxRetries) {
                        this.attemptReconnection();
                    }
                });

                this.socket.on('connect_error', (error) => {
                    console.error('❌ Socket.IO connection error:', error);
                    this.updateConnectionStatus('error');
                    
                    if (this.connectionRetryCount < this.maxRetries) {
                        this.attemptReconnection();
                    } else {
                        this.showError('Connection Failed', 'Unable to establish neural interface connection. Please check your network and try again.');
                        reject(error);
                    }
                });

                this.socket.on('error', (error) => {
                    console.error('❌ Socket.IO error:', error);
                    this.showError('System Error', error.message || 'An unknown error occurred');
                });

                this.socket.on('connected', (data) => {
                    this.sessionId = data.session_id;
                    this.updateSessionId(data.session_id);
                    console.log('🆔 Session established:', data.session_id);
                });

                // Set connection timeout
                setTimeout(() => {
                    if (!this.socket.connected) {
                        reject(new Error('Connection timeout'));
                    }
                }, 10000);

            } catch (error) {
                reject(error);
            }
        });
    }

    attemptReconnection() {
        this.connectionRetryCount++;
        const delay = Math.min(1000 * Math.pow(2, this.connectionRetryCount), 30000);
        
        console.log(`🔄 Attempting reconnection ${this.connectionRetryCount}/${this.maxRetries} in ${delay}ms...`);
        this.updateConnectionStatus('connecting');
        
        setTimeout(() => {
            if (this.socket && !this.socket.connected) {
                this.socket.connect();
            }
        }, delay);
    }

    async checkSystemStatus() {
        try {
            const response = await fetch('/api/status');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const status = await response.json();
            this.updateAIStatus(status);
            console.log('✓ System status retrieved:', status);
            
        } catch (error) {
            console.error('❌ Failed to get system status:', error);
            this.updateAIStatus({ ai_available: false, error: error.message });
        }
    }

    setupApplicationEvents() {
        // Handle window events
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleVisibilityHidden();
            } else {
                this.handleVisibilityVisible();
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });

        // Handle modal events
        this.setupModalEvents();
    }

    handleGlobalKeyboard(event) {
        // Global keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'k':
                    // Ctrl+K: Focus chat input
                    event.preventDefault();
                    const chatInput = document.getElementById('chat-input');
                    if (chatInput) chatInput.focus();
                    break;
                    
                case 't':
                    // Ctrl+T: Focus terminal
                    event.preventDefault();
                    if (this.terminalManager) {
                        this.terminalManager.focus();
                    }
                    break;
                    
                case 'r':
                    // Ctrl+R: Refresh connection
                    event.preventDefault();
                    this.refreshConnection();
                    break;
            }
        }
        
        // F keys
        switch (event.key) {
            case 'F1':
                event.preventDefault();
                this.showHelpModal();
                break;
                
            case 'F5':
                event.preventDefault();
                this.refreshConnection();
                break;
                
            case 'F11':
                event.preventDefault();
                this.toggleFullscreen();
                break;
        }
    }

    setupModalEvents() {
        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
            if (e.target.classList.contains('modal') && e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    startMonitoring() {
        // Update uptime every second
        this.uptimeInterval = setInterval(() => {
            this.updateUptime();
        }, 1000);

        // Periodic system status check
        this.statusInterval = setInterval(() => {
            this.checkSystemStatus();
        }, 60000); // Every minute

        // Connection health check
        this.healthInterval = setInterval(() => {
            this.checkConnectionHealth();
        }, 30000); // Every 30 seconds
    }

    updateUptime() {
        const uptime = Date.now() - this.startTime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        
        const uptimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            uptimeElement.textContent = uptimeString;
        }
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = status.toUpperCase();
            statusElement.className = `status-value ${status}`;
        }
    }

    updateAIStatus(status) {
        const aiStatusElement = document.getElementById('ai-status');
        if (aiStatusElement) {
            if (status.ai_available) {
                aiStatusElement.textContent = 'ACTIVE';
                aiStatusElement.className = 'status-value online';
            } else {
                aiStatusElement.textContent = 'INACTIVE';
                aiStatusElement.className = 'status-value offline';
            }
        }
    }

    updateSessionId(sessionId) {
        const sessionElement = document.getElementById('session-id');
        if (sessionElement && sessionId) {
            sessionElement.textContent = sessionId.substring(0, 8) + '...';
        }
    }

    checkConnectionHealth() {
        if (this.socket && this.socket.connected) {
            // Send ping to check connection health
            this.socket.emit('ping', { timestamp: Date.now() });
        }
    }

    handleResize() {
        if (this.terminalManager) {
            this.terminalManager.resize();
        }
    }

    handleVisibilityHidden() {
        // Reduce activity when tab is hidden
        console.log('🔕 Application hidden, reducing activity');
    }

    handleVisibilityVisible() {
        // Restore activity when tab becomes visible
        console.log('🔔 Application visible, restoring activity');
        this.checkSystemStatus();
    }

    refreshConnection() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket.connect();
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error entering fullscreen:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    showLoadingScreen() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }

    hideLoadingScreen() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    showError(title, message) {
        const modal = document.getElementById('error-modal');
        const errorMessage = document.getElementById('error-message');
        
        if (modal && errorMessage) {
            errorMessage.textContent = message;
            modal.style.display = 'block';
        }
    }

    closeModal() {
        const modal = document.getElementById('error-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showHelpModal() {
        const helpText = `
CYBERPUNK AI ASSISTANT - HELP

KEYBOARD SHORTCUTS:
• Ctrl+K: Focus chat input
• Ctrl+T: Focus terminal
• Ctrl+R: Refresh connection
• F1: Show this help
• F5: Refresh connection
• F11: Toggle fullscreen
• Escape: Close modal

CHAT COMMANDS:
• /help: Show chat help
• /clear: Clear chat history
• /status: Show system status
• /matrix: Show matrix effect
• /glitch: Add glitch effect

TERMINAL SHORTCUTS:
• Ctrl+L: Clear terminal
• Ctrl+Shift+C: Copy selection
• Ctrl+Shift+V: Paste

SECURITY:
• Local network access only
• Single user sessions
• Encrypted connections
• IP address restrictions

For technical support, check system logs or restart the application.
        `;
        
        this.showError('HELP - NEURAL INTERFACE', helpText);
    }

    // System monitoring methods
    getSystemStats() {
        return {
            uptime: Date.now() - this.startTime,
            connected: this.socket?.connected || false,
            sessionId: this.sessionId,
            terminalActive: this.terminalManager?.isInitialized || false,
            chatActive: this.chatManager !== null,
            retryCount: this.connectionRetryCount
        };
    }

    // Performance monitoring
    monitorPerformance() {
        if (performance.memory) {
            const memory = performance.memory;
            console.log('Memory usage:', {
                used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
                total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB',
                limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
            });
        }
    }

    // Emergency reset
    emergencyReset() {
        console.log('🚨 Emergency reset initiated');
        
        // Clear all intervals
        if (this.uptimeInterval) clearInterval(this.uptimeInterval);
        if (this.statusInterval) clearInterval(this.statusInterval);
        if (this.healthInterval) clearInterval(this.healthInterval);
        
        // Reset components
        this.cleanup();
        
        // Reload page
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    cleanup() {
        console.log('🧹 Cleaning up application...');
        
        // Clear intervals
        if (this.uptimeInterval) clearInterval(this.uptimeInterval);
        if (this.statusInterval) clearInterval(this.statusInterval);
        if (this.healthInterval) clearInterval(this.healthInterval);
        
        // Cleanup components
        if (this.terminalManager) {
            this.terminalManager.destroy();
        }
        if (this.chatManager) {
            this.chatManager.destroy();
        }
        
        // Disconnect socket
        if (this.socket) {
            this.socket.disconnect();
        }
        
        this.isInitialized = false;
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.cyberpunkApp) {
        window.cyberpunkApp.showError('System Error', event.error.message);
    }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.cyberpunkApp) {
        window.cyberpunkApp.showError('Promise Error', event.reason.message || 'An async operation failed');
    }
});

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Cyberpunk AI Assistant...');
    window.cyberpunkApp = new CyberpunkAIApp();
});

// Global modal close function
function closeModal() {
    if (window.cyberpunkApp) {
        window.cyberpunkApp.closeModal();
    }
}

// Development helpers (remove in production)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugApp = () => {
        if (window.cyberpunkApp) {
            console.log('App State:', window.cyberpunkApp.getSystemStats());
            window.cyberpunkApp.monitorPerformance();
        }
    };
    
    window.resetApp = () => {
        if (window.cyberpunkApp) {
            window.cyberpunkApp.emergencyReset();
        }
    };
}

console.log('🎯 Cyberpunk AI Assistant - Main module loaded');