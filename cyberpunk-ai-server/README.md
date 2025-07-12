# 🌐 Cyberpunk AI Assistant Webserver

A futuristic, secure AI assistant with integrated terminal interface designed for local network use only. Features a cyberpunk aesthetic with neon effects and maximum security.

## ✨ Features

### 🛡️ Security First
- **Local Network Only**: Restricts access to 192.168.x.x IP addresses
- **Single User Sessions**: Only one user can access at a time
- **IP Whitelist**: Automated IP filtering middleware
- **Session Management**: Secure session handling with timeouts
- **No External Access**: Cannot be accessed from the internet

### 🤖 AI Integration
- **OpenAI API Support**: GPT-3.5-turbo integration
- **Ollama Support**: Local LLM integration
- **Real-time Chat**: WebSocket-based instant responses
- **Conversation History**: Smart context management
- **Command System**: Built-in chat commands

### 💻 Terminal Interface
- **Web-based Terminal**: Full Linux terminal emulation
- **XTerm.js Integration**: Professional terminal experience
- **Real-time I/O**: Live terminal input/output
- **Syntax Highlighting**: Cyberpunk color scheme
- **Copy/Paste Support**: Standard terminal shortcuts

### 🎨 Cyberpunk UI
- **Neon Color Scheme**: Cyan and green neon effects
- **Matrix Background**: Animated background effects
- **Glowing Elements**: Pulsing and breathing animations
- **Scan Lines**: Retro CRT monitor effects
- **Glass Morphism**: Modern translucent panels
- **Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ installed
- Node.js (for development, optional)
- Local network (192.168.x.x or similar)

### Installation

1. **Clone/Download the Project**
```bash
cd cyberpunk-ai-server
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure AI Provider (Choose One)**

**Option A: OpenAI API**
```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

**Option B: Ollama (Local LLM)**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download a model
ollama pull codellama
```

4. **Start the Server**
```bash
python app.py
```

5. **Access the Interface**
- Open your browser to `http://192.168.x.x:8080`
- Replace `x.x` with your actual IP address
- Only devices on your local network can access it

## 🔧 Configuration

### Environment Variables
```bash
# Required for OpenAI (if using)
export OPENAI_API_KEY="sk-your-key-here"

# Optional: Change port
export PORT=8080

# Optional: Custom Ollama URL
export OLLAMA_URL="http://localhost:11434"
```

### Security Settings
The server automatically:
- Binds to all interfaces (0.0.0.0) but filters IPs
- Blocks non-local network access
- Implements single-user session management
- Uses secure session cookies

## 🎮 Usage

### Chat Interface
- Type natural language queries
- Use `/help` to see available commands
- Press `Enter` to send, `Shift+Enter` for new lines
- Built-in commands:
  - `/help` - Show help
  - `/clear` - Clear chat
  - `/status` - System status
  - `/matrix` - Matrix effect
  - `/glitch` - Glitch effect

### Terminal Interface
- Full Linux terminal access
- Standard keyboard shortcuts:
  - `Ctrl+L` - Clear terminal
  - `Ctrl+Shift+C` - Copy selection
  - `Ctrl+Shift+V` - Paste
- Safe, sandboxed environment
- Real-time command execution

### Global Shortcuts
- `Ctrl+K` - Focus chat input
- `Ctrl+T` - Focus terminal
- `Ctrl+R` - Refresh connection
- `F1` - Show help
- `F11` - Toggle fullscreen
- `Escape` - Close modals

## 🔐 Security Features

### Network Security
- IP whitelist (192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12)
- CORS protection
- Session-based authentication
- Rate limiting (planned)

### Terminal Security
- Process isolation
- Limited file system access
- Command sanitization
- Safe execution environment

### Session Security
- Single active user
- Session timeouts
- Secure session management
- IP-based validation

## 🛠️ Development

### Project Structure
```
cyberpunk-ai-server/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── static/
│   ├── css/
│   │   └── cyberpunk.css # Main stylesheet
│   └── js/
│       ├── main.js       # Application controller
│       ├── ai-chat.js    # Chat interface
│       └── terminal.js   # Terminal manager
├── templates/
│   └── index.html        # Main HTML template
└── assets/               # Static assets (if any)
```

### Development Mode
```bash
# Run in debug mode
export FLASK_ENV=development
python app.py
```

### Customization
- Edit `static/css/cyberpunk.css` for styling
- Modify `templates/index.html` for layout
- Update `static/js/` files for functionality
- Customize AI prompts in `app.py`

## 📡 API Endpoints

### REST API
- `GET /` - Main interface
- `POST /api/chat` - Send chat message
- `GET /api/status` - System status

### WebSocket Events
- `connect` - Client connection
- `disconnect` - Client disconnection
- `ai_chat` - AI chat message
- `ai_response` - AI response
- `terminal_input` - Terminal input
- `terminal_output` - Terminal output

## 🐛 Troubleshooting

### Common Issues

**Connection Refused**
- Check IP address restrictions
- Ensure you're on the local network
- Verify firewall settings

**AI Not Responding**
- Check OpenAI API key
- Verify Ollama installation
- Check network connectivity

**Terminal Not Working**
- Verify Python PTY support
- Check terminal permissions
- Restart the application

**Performance Issues**
- Close unused browser tabs
- Check system resources
- Reduce terminal history

### Debug Commands
```bash
# Check system status
curl http://192.168.x.x:8080/api/status

# View logs
python app.py  # Check console output

# Test AI connection
# Use the /status command in chat
```

## 🔒 Security Notes

### Important Security Considerations
- **Never expose to the internet**
- **Use only on trusted local networks**
- **Regularly update dependencies**
- **Monitor system logs**
- **Use strong network security**

### Access Control
- The server automatically blocks external access
- Only local network IPs can connect
- Single user sessions prevent conflicts
- Session timeouts enhance security

## 📋 TODO / Future Features

- [ ] Multi-tab terminal support
- [ ] File upload/download
- [ ] Voice command integration
- [ ] System monitoring dashboard
- [ ] Custom AI model support
- [ ] Advanced security features
- [ ] Mobile app companion
- [ ] Plugin system
- [ ] Advanced terminal features
- [ ] Code execution sandboxing

## 🤝 Contributing

This is a personal local network tool. If you want to contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for personal use only. Use at your own risk.

## ⚠️ Disclaimer

This software is provided as-is. Always ensure proper security measures when running network services. The authors are not responsible for any security breaches or system damage.

## 🎯 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the configuration
3. Check system logs
4. Restart the application

---

**🚀 Welcome to the future of local AI assistance! 🚀**

*Built with ❤️ for the cyberpunk community*