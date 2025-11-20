# WorkNest 📚✨

**From Idea to Classroom** - An AI-powered worksheet generator that transforms your teaching ideas into professional, ready-to-use educational materials.

WorkNest combines the power of Claude AI with LaTeX typesetting to create beautiful, curriculum-aligned worksheets in seconds. Simply describe what you need, and let AI handle the rest.

![WorkNest Interface](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

- **🤖 AI-Powered Generation**: Leverages Claude API to generate educational content tailored to your specifications
- **📐 Professional LaTeX Typesetting**: Creates publication-quality worksheets with proper mathematical notation
- **💬 Interactive Editing**: Chat with AI to refine and modify worksheets in real-time
- **🎓 Grade-Specific Content**: Supports all grade levels from 1st grade through University
- **📊 Multiple Subjects**: Math, Science, English, History, and more
- **📝 Various Worksheet Types**: Practice, Quiz, Homework, Review, and Test formats
- **📄 PDF Export**: Download professional PDFs ready for printing or digital distribution
- **🎨 Beautiful UI**: Modern, animated interface with smooth transitions and glassmorphism effects

## 🚀 Quick Start

### Prerequisites

- **Python 3** - For running the proxy server
- **Modern Web Browser** - Chrome, Firefox, Safari, or Edge
- **Anthropic API Key** - [Get one here](https://console.anthropic.com/)
- **Docker Desktop** (Optional) - For full LaTeX PDF compilation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/worknest.git
   cd worknest
   ```

2. **Configure your API key**
   ```bash
   cp config.template.js config.js
   ```
   
   Open `config.js` and add your Anthropic API key:
   ```javascript
   const ANTHROPIC_API_KEY = 'sk-ant-api03-xxxxxxxxxxxxx';
   ```

3. **Set up LaTeX compilation** (Optional but recommended)
   
   Start Docker Desktop, then run:
   ```bash
   ./setup-clsi.sh
   ```
   
   This sets up the Overleaf CLSI service for professional PDF generation.

### Running the Application

**Start all services:**
```bash
./start_all.sh
```

This launches:
- CLSI LaTeX compilation service (port 3013)
- Proxy server for API calls (port 3014)
- Web server (port 8000)

**Open your browser:**
Navigate to [http://localhost:8000](http://localhost:8000)

**Stop all services:**
```bash
./stop_all.sh
```

## 📖 How to Use

### Creating Your First Worksheet

1. **Describe your worksheet** in the input field
   - Example: "Quadratic equations with word problems"
   
2. **Select filters** (optional)
   - **Grade Level**: 1st through 12th grade, or University
   - **Type**: Practice, Quiz, Homework, Review, or Test
   - **Subject**: Math, Science, English, History, etc.

3. **Click the arrow button** to generate

4. **Wait for AI** to create your worksheet (typically 5-15 seconds)

5. **Review the preview** in the right panel

### Refining Your Worksheet

Once generated, you can chat with the AI to make changes:

- "Make it harder"
- "Add 3 more questions"
- "Include an answer key"
- "Change question 2 to focus on fractions"
- "Make this suitable for struggling learners"

The AI will update the worksheet based on your feedback!

### Downloading

Click the **Download PDF** button to save your worksheet. If Docker/CLSI is running, you'll get a professionally typeset LaTeX PDF. Otherwise, it will generate an HTML-based PDF.

## 🏗️ Architecture

### Components

```
worknest/
├── index.html          # Main application interface
├── script.js           # Application logic and AI integration
├── styles.css          # Modern UI styling with animations
├── config.js           # API configuration (gitignored)
├── clsi-proxy.py       # Proxy server for Claude API and LaTeX
├── start_all.sh        # Start all services
├── stop_all.sh         # Stop all services
├── setup-clsi.sh       # Set up LaTeX compilation service
└── start-clsi.sh       # Start CLSI service
```

### How It Works

1. **User Input**: You describe the worksheet you want
2. **AI Generation**: Claude API generates complete LaTeX code
3. **Compilation**: CLSI compiles LaTeX to PDF (or falls back to HTML)
4. **Preview**: PDF/HTML preview displayed in browser
5. **Refinement**: Chat with AI to make iterative improvements
6. **Export**: Download the final worksheet

### Technology Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript with Anime.js for animations
- **AI**: Anthropic Claude API (claude-haiku-4-5-20251001)
- **LaTeX**: Overleaf CLSI (Community Edition) via Docker
- **Proxy**: Python HTTP server for CORS and API routing
- **Math Rendering**: MathJax (fallback when CLSI unavailable)

## 🔧 Configuration

### API Settings

Edit `config.js` to customize:
```javascript
const ANTHROPIC_API_KEY = 'your-api-key-here';
```

### Model Selection

In `script.js`, you can change the AI model:
```javascript
const API_MODEL_ANTHROPIC = 'claude-haiku-4-5-20251001';
```

Available models:
- `claude-haiku-4-5-20251001` - Fast and cost-effective (default)
- `claude-sonnet-4-20250514` - Balanced performance
- `claude-opus-4-20250514` - Highest quality

## 🐛 Troubleshooting

### "Address already in use" error
Services are already running. Stop them first:
```bash
./stop_all.sh
```

### "Docker is not running"
Start Docker Desktop before running `./setup-clsi.sh`

### PDF compilation fails
The app will automatically fall back to HTML preview. For full PDF support:
1. Ensure Docker is running
2. Run `./setup-clsi.sh`
3. Restart services with `./start_all.sh`

### API authentication errors
- Verify your API key in `config.js`
- Check that you have API credits at [console.anthropic.com](https://console.anthropic.com/)
- Ensure the model you're using is available on your plan

### Connection status shows "Disconnected"
Click "Check Connection" button. If it stays disconnected:
1. Verify proxy is running: `lsof -ti:3014`
2. Restart services: `./stop_all.sh && ./start_all.sh`

## 🔒 Security

- **API Key Protection**: `config.js` is gitignored and never committed
- **Local Processing**: All services run locally on your machine
- **No Data Storage**: Worksheets are not stored or transmitted except to Claude API
- **CORS Proxy**: Handles API authentication securely

**⚠️ Never commit your `config.js` file or share your API key publicly!**

## 📝 Examples

### Elementary Math
```
"Addition and subtraction practice for 2nd graders with pictures"
Grade: 2nd | Type: Practice | Subject: Math
```

### High School Science
```
"Chemistry balancing equations worksheet with 15 problems"
Grade: 10th | Type: Homework | Subject: Chemistry
```

### University Level
```
"Calculus integration by parts problems with step-by-step solutions"
Grade: University | Type: Practice | Subject: Math
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Anthropic** for the Claude API
- **Overleaf** for the CLSI LaTeX compilation service
- **Anime.js** for smooth animations
- **MathJax** for mathematical typesetting fallback

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

---

**Made with ❤️ for educators everywhere**

*Transform your teaching ideas into professional worksheets in seconds with WorkNest!*
