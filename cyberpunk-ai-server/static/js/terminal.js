/**
 * Terminal Management for Cyberpunk AI Assistant
 * Handles web-based terminal using XTerm.js
 */

class TerminalManager {
    constructor() {
        this.socket = null;
        this.terminal = null;
        this.isInitialized = false;
        this.currentTab = 0;
        this.tabs = [];
        this.fitAddon = null;
        
        this.init();
    }

    init() {
        this.setupTerminal();
        this.setupEventHandlers();
    }

    setupTerminal() {
        // Initialize XTerm.js terminal
        this.terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            theme: {
                background: '#050505',
                foreground: '#00FFFF',
                cursor: '#00FFFF',
                cursorAccent: '#00FFFF',
                selection: 'rgba(0, 255, 255, 0.3)',
                black: '#000000',
                red: '#FF073A',
                green: '#00FF41',
                yellow: '#FFFF00',
                blue: '#0080FF',
                magenta: '#FF00FF',
                cyan: '#00FFFF',
                white: '#FFFFFF',
                brightBlack: '#555555',
                brightRed: '#FF6B6B',
                brightGreen: '#51FA7B',
                brightYellow: '#FFFF5D',
                brightBlue: '#1E90FF',
                brightMagenta: '#FF69B4',
                brightCyan: '#00D4FF',
                brightWhite: '#FFFFFF'
            },
            allowTransparency: true,
            rows: 30,
            cols: 100,
            scrollback: 1000,
            rightClickSelectsWord: true,
            windowsMode: false
        });

        // Open terminal in container
        const terminalContainer = document.getElementById('terminal');
        if (terminalContainer) {
            this.terminal.open(terminalContainer);
            this.isInitialized = true;
            
            // Add welcome message
            this.terminal.writeln('\x1b[36m╔═══════════════════════════════════════════════════════════════╗\x1b[0m');
            this.terminal.writeln('\x1b[36m║                 CYBERPUNK AI ASSISTANT TERMINAL               ║\x1b[0m');
            this.terminal.writeln('\x1b[36m║                     NEURAL INTERFACE ACTIVE                   ║\x1b[0m');
            this.terminal.writeln('\x1b[36m╚═══════════════════════════════════════════════════════════════╝\x1b[0m');
            this.terminal.writeln('');
            this.terminal.writeln('\x1b[32mSystem Status: ONLINE\x1b[0m');
            this.terminal.writeln('\x1b[32mSecurity Level: MAXIMUM\x1b[0m');
            this.terminal.writeln('\x1b[32mNetwork: LOCAL ONLY\x1b[0m');
            this.terminal.writeln('');
            this.terminal.writeln('\x1b[33mConnecting to neural interface...\x1b[0m');
        }
    }

    setupEventHandlers() {
        // Handle terminal input
        if (this.terminal) {
            this.terminal.onData((data) => {
                if (this.socket && this.socket.connected) {
                    this.socket.emit('terminal_input', { data: data });
                }
            });

            // Handle terminal resize
            this.terminal.onResize((size) => {
                if (this.socket && this.socket.connected) {
                    this.socket.emit('terminal_resize', { 
                        cols: size.cols, 
                        rows: size.rows 
                    });
                }
            });
        }

        // Clear terminal button
        const clearBtn = document.getElementById('clear-terminal');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearTerminal();
            });
        }

        // New tab button
        const newTabBtn = document.getElementById('new-tab');
        if (newTabBtn) {
            newTabBtn.addEventListener('click', () => {
                this.createNewTab();
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.terminal && this.fitAddon) {
                this.fitAddon.fit();
            }
        });
    }

    setSocket(socket) {
        this.socket = socket;
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        if (!this.socket) return;

        // Handle terminal output
        this.socket.on('terminal_output', (data) => {
            if (this.terminal && data.data) {
                this.terminal.write(data.data);
            }
        });

        // Handle connection
        this.socket.on('connect', () => {
            if (this.terminal) {
                this.terminal.writeln('\x1b[32m✓ Neural interface connected\x1b[0m');
                this.terminal.writeln('');
            }
        });

        // Handle disconnection
        this.socket.on('disconnect', () => {
            if (this.terminal) {
                this.terminal.writeln('\x1b[31m✗ Neural interface disconnected\x1b[0m');
                this.terminal.writeln('\x1b[33mAttempting to reconnect...\x1b[0m');
            }
        });

        // Handle errors
        this.socket.on('error', (error) => {
            if (this.terminal) {
                this.terminal.writeln(`\x1b[31m✗ Terminal error: ${error.message}\x1b[0m`);
            }
        });
    }

    clearTerminal() {
        if (this.terminal) {
            this.terminal.clear();
            this.terminal.writeln('\x1b[36m═══════════════════════════════════════════════════════════════\x1b[0m');
            this.terminal.writeln('\x1b[36m                    TERMINAL CLEARED                           \x1b[0m');
            this.terminal.writeln('\x1b[36m═══════════════════════════════════════════════════════════════\x1b[0m');
            this.terminal.writeln('');
        }
    }

    createNewTab() {
        // For now, just show a message as multi-tab support requires more backend work
        if (this.terminal) {
            this.terminal.writeln('\x1b[33m[INFO] Multi-tab support coming soon...\x1b[0m');
            this.terminal.writeln('\x1b[33m[INFO] Use multiple browser windows for now\x1b[0m');
        }
    }

    focus() {
        if (this.terminal) {
            this.terminal.focus();
        }
    }

    resize() {
        if (this.terminal && this.fitAddon) {
            this.fitAddon.fit();
        }
    }

    // Command helpers
    executeCommand(command) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('terminal_input', { data: command + '\n' });
        }
    }

    // Cyberpunk effects
    addGlitchEffect() {
        if (this.terminal) {
            const glitchChars = ['█', '▓', '▒', '░', '▄', '▀', '■', '□', '●', '○'];
            const originalContent = this.terminal.buffer.active.getLine(0);
            
            // Add random glitch characters
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    this.terminal.write('\x1b[31m' + glitchChars[Math.floor(Math.random() * glitchChars.length)] + '\x1b[0m');
                }, i * 50);
            }
            
            // Clear glitch after effect
            setTimeout(() => {
                this.terminal.write('\b\b\b\b\b     \b\b\b\b\b');
            }, 300);
        }
    }

    showMatrixEffect() {
        if (this.terminal) {
            const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
            const lines = 5;
            const cols = 20;
            
            for (let line = 0; line < lines; line++) {
                setTimeout(() => {
                    let matrixLine = '\x1b[32m';
                    for (let col = 0; col < cols; col++) {
                        matrixLine += matrixChars[Math.floor(Math.random() * matrixChars.length)];
                    }
                    matrixLine += '\x1b[0m';
                    this.terminal.writeln(matrixLine);
                }, line * 100);
            }
        }
    }

    // System monitoring commands
    showSystemInfo() {
        if (this.terminal) {
            this.terminal.writeln('\x1b[36m╔═══════════════════════════════════════════════════════════════╗\x1b[0m');
            this.terminal.writeln('\x1b[36m║                        SYSTEM INFO                            ║\x1b[0m');
            this.terminal.writeln('\x1b[36m╚═══════════════════════════════════════════════════════════════╝\x1b[0m');
            this.terminal.writeln('');
            this.terminal.writeln('\x1b[33mOS:\x1b[0m         Linux (Cyberpunk Enhanced)');
            this.terminal.writeln('\x1b[33mKernel:\x1b[0m     Neural Interface v2.0.1');
            this.terminal.writeln('\x1b[33mArchitecture:\x1b[0m x86_64');
            this.terminal.writeln('\x1b[33mMemory:\x1b[0m     Available');
            this.terminal.writeln('\x1b[33mNetwork:\x1b[0m    Local Only (192.168.x.x)');
            this.terminal.writeln('\x1b[33mSecurity:\x1b[0m   Maximum');
            this.terminal.writeln('\x1b[33mAI Core:\x1b[0m    Active');
            this.terminal.writeln('');
        }
    }

    // Terminal shortcuts and helpers
    setupShortcuts() {
        if (this.terminal) {
            // Add custom key bindings
            this.terminal.attachCustomKeyEventHandler((e) => {
                // Ctrl+L to clear
                if (e.ctrlKey && e.key === 'l') {
                    this.clearTerminal();
                    return false;
                }
                
                // Ctrl+Shift+C to copy
                if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                    this.copySelection();
                    return false;
                }
                
                // Ctrl+Shift+V to paste
                if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                    this.pasteFromClipboard();
                    return false;
                }
                
                return true;
            });
        }
    }

    copySelection() {
        if (this.terminal && this.terminal.hasSelection()) {
            const selection = this.terminal.getSelection();
            navigator.clipboard.writeText(selection).then(() => {
                this.terminal.writeln('\x1b[32m[INFO] Text copied to clipboard\x1b[0m');
            }).catch(() => {
                this.terminal.writeln('\x1b[31m[ERROR] Failed to copy text\x1b[0m');
            });
        }
    }

    pasteFromClipboard() {
        navigator.clipboard.readText().then((text) => {
            if (this.socket && this.socket.connected) {
                this.socket.emit('terminal_input', { data: text });
            }
        }).catch(() => {
            if (this.terminal) {
                this.terminal.writeln('\x1b[31m[ERROR] Failed to paste from clipboard\x1b[0m');
            }
        });
    }

    // Status indicators
    updateStatus(status) {
        const statusElement = document.getElementById('terminal-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = 'status-value ' + status.toLowerCase();
        }
    }

    // Cleanup
    destroy() {
        if (this.terminal) {
            this.terminal.dispose();
            this.terminal = null;
        }
        this.isInitialized = false;
    }
}

// Export for use in other modules
window.TerminalManager = TerminalManager;