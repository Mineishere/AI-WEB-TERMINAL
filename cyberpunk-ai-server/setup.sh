#!/bin/bash

# Cyberpunk AI Assistant Server Setup Script
# This script automates the installation and setup process

set -e  # Exit on any error

echo "🌐 Cyberpunk AI Assistant Server Setup"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check Python version
print_status "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
REQUIRED_VERSION="3.8"

if ! python3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)"; then
    print_error "Python $PYTHON_VERSION is installed, but Python $REQUIRED_VERSION+ is required."
    exit 1
fi

print_success "Python $PYTHON_VERSION is installed"

# Check if pip is available
print_status "Checking pip availability..."
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip3 first."
    exit 1
fi

print_success "pip3 is available"

# Install Python dependencies
print_status "Installing Python dependencies..."
if pip3 install -r requirements.txt; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Get local IP address
print_status "Detecting local IP address..."
LOCAL_IP=$(ip route get 1 | awk '{print $7}' | head -1 2>/dev/null || echo "127.0.0.1")
if [[ -z "$LOCAL_IP" ]]; then
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "127.0.0.1")
fi

print_success "Local IP address: $LOCAL_IP"

# Check if we're on a local network
if [[ $LOCAL_IP =~ ^192\.168\. ]] || [[ $LOCAL_IP =~ ^10\. ]] || [[ $LOCAL_IP =~ ^172\.1[6-9]\. ]] || [[ $LOCAL_IP =~ ^172\.2[0-9]\. ]] || [[ $LOCAL_IP =~ ^172\.3[0-1]\. ]]; then
    print_success "✓ Local network detected"
else
    print_warning "Warning: You don't appear to be on a typical local network"
    print_warning "The server will still work but may not be accessible from other devices"
fi

# AI Provider Setup
echo ""
print_status "AI Provider Configuration"
echo "Choose your AI provider:"
echo "1) OpenAI API (requires API key)"
echo "2) Ollama (local LLM)"
echo "3) Skip for now"
echo ""
read -p "Enter your choice (1-3): " ai_choice

case $ai_choice in
    1)
        print_status "Setting up OpenAI API..."
        read -p "Enter your OpenAI API key: " openai_key
        if [[ -n "$openai_key" ]]; then
            export OPENAI_API_KEY="$openai_key"
            echo "export OPENAI_API_KEY=\"$openai_key\"" >> ~/.bashrc
            print_success "OpenAI API key configured"
        else
            print_warning "No API key provided. You can set it later with: export OPENAI_API_KEY='your-key'"
        fi
        ;;
    2)
        print_status "Setting up Ollama..."
        if command -v ollama &> /dev/null; then
            print_success "Ollama is already installed"
        else
            print_status "Installing Ollama..."
            if curl -fsSL https://ollama.ai/install.sh | sh; then
                print_success "Ollama installed successfully"
            else
                print_error "Failed to install Ollama"
                print_warning "You can install it manually later"
            fi
        fi
        
        # Check if Ollama is running
        if pgrep -x "ollama" > /dev/null; then
            print_success "Ollama is running"
        else
            print_status "Starting Ollama..."
            ollama serve &
            sleep 2
        fi
        
        # Pull a model
        print_status "Downloading CodeLlama model (this may take a while)..."
        if ollama pull codellama:7b; then
            print_success "CodeLlama model downloaded"
        else
            print_warning "Failed to download model. You can do this later with: ollama pull codellama"
        fi
        ;;
    3)
        print_warning "Skipping AI provider setup. You can configure it later."
        ;;
    *)
        print_warning "Invalid choice. Skipping AI provider setup."
        ;;
esac

# Create startup script
print_status "Creating startup script..."
cat > start_cyberpunk_ai.sh << 'EOF'
#!/bin/bash

# Cyberpunk AI Assistant Startup Script

echo "🚀 Starting Cyberpunk AI Assistant Server..."
echo "=========================================="

# Get local IP
LOCAL_IP=$(ip route get 1 | awk '{print $7}' | head -1 2>/dev/null || echo "127.0.0.1")
if [[ -z "$LOCAL_IP" ]]; then
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "127.0.0.1")
fi

echo "🌐 Server will be available at: http://$LOCAL_IP:8080"
echo "🔒 Access restricted to local network only"
echo "🎯 Single user mode active"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Source environment variables
if [[ -f ~/.bashrc ]]; then
    source ~/.bashrc
fi

# Start the server
cd "$(dirname "$0")"
python3 app.py
EOF

chmod +x start_cyberpunk_ai.sh
print_success "Startup script created: start_cyberpunk_ai.sh"

# Create .env file template
print_status "Creating environment configuration..."
cat > .env << EOF
# Cyberpunk AI Assistant Configuration
# Copy this file and set your actual values

# OpenAI API Key (if using OpenAI)
# OPENAI_API_KEY=your-openai-api-key-here

# Ollama URL (if using Ollama)
# OLLAMA_URL=http://localhost:11434

# Server Port
# PORT=8080

# Security Settings (advanced users only)
# SESSION_TIMEOUT=3600
# MAX_CONNECTIONS=1
EOF

print_success "Environment template created: .env"

# Security check
print_status "Running security checks..."

# Check if firewall is active
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        print_success "UFW firewall is active"
    else
        print_warning "UFW firewall is not active"
        print_warning "Consider enabling it for better security: sudo ufw enable"
    fi
elif command -v firewall-cmd &> /dev/null; then
    if firewall-cmd --state &> /dev/null; then
        print_success "Firewalld is active"
    else
        print_warning "Firewalld is not active"
    fi
else
    print_warning "No firewall detected. Consider setting up a firewall for security."
fi

# Check port availability
if netstat -tuln | grep -q ":8080 "; then
    print_warning "Port 8080 is already in use. The server may not start properly."
    print_warning "You can change the port by setting the PORT environment variable."
else
    print_success "Port 8080 is available"
fi

# Final instructions
echo ""
print_success "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the server:    ./start_cyberpunk_ai.sh"
echo "2. Open your browser:   http://$LOCAL_IP:8080"
echo "3. Enjoy the cyberpunk AI experience!"
echo ""
echo "Security reminders:"
echo "• This server is designed for local network use only"
echo "• Only one user can access at a time"
echo "• Make sure your local network is secure"
echo "• Never expose this server to the internet"
echo ""
echo "For help and troubleshooting, see README.md"
echo ""
print_success "🚀 Welcome to the future of local AI assistance!"
EOF