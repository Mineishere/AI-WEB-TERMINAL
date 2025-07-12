# 🚀 Quick Start Guide

Get your Cyberpunk AI Assistant running in 5 minutes!

## ⚡ Instant Setup

1. **Download and Enter Directory**
   ```bash
   cd cyberpunk-ai-server
   ```

2. **Run Automated Setup**
   ```bash
   ./setup.sh
   ```
   
   The script will:
   - Check Python installation
   - Install dependencies
   - Configure AI provider
   - Create startup scripts
   - Run security checks

3. **Start the Server**
   ```bash
   ./start_cyberpunk_ai.sh
   ```

4. **Open Your Browser**
   - Go to: `http://192.168.x.x:8080`
   - Replace `x.x` with your actual IP address shown in the terminal

## 🎯 First Steps

1. **Test the Chat Interface**
   - Type: `Hello, AI!`
   - Press Enter
   - Wait for response

2. **Try the Terminal**
   - Click on the terminal panel
   - Type: `ls -la`
   - Press Enter

3. **Use Built-in Commands**
   - Type: `/help` in chat
   - Try: `/status` to check system
   - Fun: `/matrix` for matrix effect

## 🔧 Quick Configuration

### For OpenAI API
```bash
export OPENAI_API_KEY="your-api-key-here"
```

### For Ollama (Local AI)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download model
ollama pull codellama

# Start server
ollama serve
```

## 🛡️ Security Notes

- ✅ Only accessible from local network
- ✅ Single user sessions
- ✅ IP address restricted
- ✅ No internet exposure

## 🎮 Keyboard Shortcuts

- `Ctrl+K` - Focus chat
- `Ctrl+T` - Focus terminal
- `F1` - Show help
- `F11` - Fullscreen

## 🐛 Troubleshooting

**Can't access the server?**
- Check your IP address
- Ensure you're on the same network
- Try: `http://localhost:8080`

**AI not responding?**
- Check API key (OpenAI)
- Verify Ollama is running
- Try `/status` command

**Terminal not working?**
- Restart the server
- Check browser console

## 📱 Mobile Access

Access from your phone/tablet on the same network:
```
http://192.168.x.x:8080
```

## 🎨 Features to Try

1. **Chat with AI**
   - Ask coding questions
   - Get explanations
   - Request help

2. **Terminal Commands**
   - `htop` - System monitor
   - `python3` - Python shell
   - `git status` - Git commands

3. **Special Effects**
   - `/matrix` - Matrix animation
   - `/glitch` - Glitch effect
   - Error messages have glitch effects

## 🔄 Restarting

To restart the server:
```bash
# Stop with Ctrl+C
# Then restart with:
./start_cyberpunk_ai.sh
```

## 📋 Next Steps

1. Bookmark the interface
2. Try different AI prompts
3. Explore terminal commands
4. Customize the interface (see README.md)

---

**🎉 You're ready to go! Welcome to the cyberpunk future!**