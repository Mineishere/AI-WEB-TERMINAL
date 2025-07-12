# AI-WEB-TERMINAL Setup Instructions

This guide provides step-by-step instructions to set up and run the AI-WEB-TERMINAL project on different platforms.

## 🤖 Android Termux Setup

### Prerequisites
1. Install **Termux** from F-Droid (recommended) or Google Play Store
2. Update package lists: `pkg update && pkg upgrade`

### Step-by-Step Setup

1. **Install Required Packages**
   ```bash
   # Install Python and essential tools
   pkg install python python-pip git nodejs
   
   # Install additional dependencies
   pkg install clang make pkg-config libffi openssl
   ```

2. **Setup Storage Access**
   ```bash
   # Allow Termux to access device storage
   termux-setup-storage
   ```

3. **Clone the Repository**
   ```bash
   # Navigate to shared storage if needed
   cd /sdcard/
   
   # Clone the project
   git clone https://github.com/yourusername/AI-WEB-TERMINAL.git
   cd AI-WEB-TERMINAL
   ```

4. **Install Python Dependencies**
   ```bash
   # Upgrade pip
   pip install --upgrade pip
   
   # Install project dependencies
   pip install flask websockets asyncio aiohttp
   pip install openai anthropic transformers
   ```

5. **Install Node.js Dependencies** (if applicable)
   ```bash
   npm install
   ```

6. **Run the Application**
   ```bash
   # Start the web terminal
   python app.py
   
   # Or if using a different entry point
   python main.py
   ```

7. **Access the Terminal**
   - Open your browser and navigate to `http://localhost:5000`
   - Or use the local IP address to access from other devices

### Termux Tips
- Use `termux-wake-lock` to prevent the app from sleeping
- Install `termux-api` for additional device integration
- Use `pkg list-installed` to see installed packages

---

## 🪟 Windows Visual Studio Setup

### Prerequisites
1. **Visual Studio 2022** (Community, Professional, or Enterprise)
2. **Python 3.8+** installed
3. **Node.js 16+** installed
4. **Git** installed

### Step-by-Step Setup

1. **Install Visual Studio Extensions**
   - Python Development workload
   - Node.js development tools
   - Azure development tools (optional)

2. **Clone the Repository**
   ```cmd
   # Open Command Prompt or PowerShell
   git clone https://github.com/yourusername/AI-WEB-TERMINAL.git
   cd AI-WEB-TERMINAL
   ```

3. **Open Project in Visual Studio**
   - File → Open → Folder
   - Select the `AI-WEB-TERMINAL` folder
   - Visual Studio will detect the project structure

4. **Setup Python Environment**
   ```cmd
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

5. **Install Node.js Dependencies**
   ```cmd
   # If the project has a package.json
   npm install
   ```

6. **Configure Debug Settings**
   - Go to Debug → Start Debugging
   - Select "Python" as the debugger
   - Choose "Flask" if it's a Flask application
   - Set breakpoints as needed

7. **Run the Application**
   - Press `F5` to run with debugging
   - Or `Ctrl+F5` to run without debugging
   - The terminal will open in your default browser

### Visual Studio Tips
- Use the integrated terminal: View → Terminal
- Utilize IntelliSense for code completion
- Set up Git integration for version control
- Use the Python Interactive window for testing

---

## 🍎 Mac PyCharm Setup

### Prerequisites
1. **PyCharm Professional** or **Community Edition**
2. **Python 3.8+** (install via Homebrew recommended)
3. **Node.js 16+** (install via Homebrew)
4. **Git** (usually pre-installed)

### Step-by-Step Setup

1. **Install Prerequisites via Homebrew**
   ```bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install Python and Node.js
   brew install python node git
   ```

2. **Clone the Repository**
   ```bash
   # Open Terminal
   git clone https://github.com/yourusername/AI-WEB-TERMINAL.git
   cd AI-WEB-TERMINAL
   ```

3. **Open Project in PyCharm**
   - Launch PyCharm
   - File → Open → Select the `AI-WEB-TERMINAL` folder
   - PyCharm will index the project files

4. **Setup Python Interpreter**
   - PyCharm → Preferences → Project → Python Interpreter
   - Click gear icon → Add → Virtualenv Environment
   - Create new virtual environment
   - PyCharm will detect requirements.txt and offer to install

5. **Install Dependencies**
   ```bash
   # In PyCharm terminal or external terminal
   pip install -r requirements.txt
   
   # If using Node.js components
   npm install
   ```

6. **Configure Run Configuration**
   - Run → Edit Configurations
   - Click `+` → Python
   - Set Script path to your main application file (e.g., `app.py`)
   - Set Working directory to project root
   - Add environment variables if needed

7. **Run the Application**
   - Click the green Run button
   - Or press `Ctrl+R` (Cmd+R on Mac)
   - The web terminal will open in your default browser

### PyCharm Tips
- Use the built-in terminal: View → Tool Windows → Terminal
- Enable code completion and syntax highlighting
- Use the debugger with breakpoints
- Integrate with Git: VCS → Git

---

## 🔧 Common Configuration

### Environment Variables
Create a `.env` file in the project root:
```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
FLASK_ENV=development
FLASK_DEBUG=true
PORT=5000
```

### Required Dependencies
Create `requirements.txt`:
```txt
flask==2.3.3
websockets==11.0.3
asyncio==3.4.3
aiohttp==3.8.6
openai==1.3.0
anthropic==0.7.0
transformers==4.35.0
torch==2.1.0
numpy==1.24.3
python-dotenv==1.0.0
```

### Basic Project Structure
```
AI-WEB-TERMINAL/
├── app.py                 # Main application
├── static/
│   ├── css/
│   ├── js/
│   └── index.html
├── templates/
├── requirements.txt
├── .env
├── README.md
└── .gitignore
```

---

## 🚀 Running the Application

1. **Start the server:**
   ```bash
   python app.py
   ```

2. **Access the terminal:**
   - Open browser to `http://localhost:5000`
   - Start interacting with the AI terminal

3. **Test the setup:**
   - Try basic commands
   - Test AI integration
   - Verify all features work correctly

---

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change port in configuration
   - Kill existing processes: `lsof -ti:5000 | xargs kill`

2. **API Keys Not Working**
   - Verify API keys in `.env` file
   - Check API key permissions and limits

3. **Dependencies Not Installing**
   - Update pip: `pip install --upgrade pip`
   - Try installing individually
   - Check Python version compatibility

4. **Permission Errors (Linux/Mac)**
   - Use `sudo` for system-wide installs
   - Or use virtual environments (recommended)

### Platform-Specific Issues

**Android Termux:**
- Storage permission issues → Use `termux-setup-storage`
- Package not found → Update packages: `pkg update`

**Windows Visual Studio:**
- Python not found → Reinstall Python with PATH option
- SSL certificates → Update certificates or use `--trusted-host`

**Mac PyCharm:**
- Command not found → Check PATH in PyCharm settings
- Permission denied → Use `chmod +x` for executable files

For additional help, check the project's GitHub Issues or create a new issue with your specific problem.