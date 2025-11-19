# WorkNest

AI-powered worksheet generator using Claude API and LaTeX.

## Setup Instructions

### 1. Configure Claude API Key

1. Copy the template configuration file:
   ```bash
   cp config.template.js config.js
   ```

2. Open `config.js` and replace `'your-api-key-here'` with your actual Anthropic API key:
   ```javascript
   const ANTHROPIC_API_KEY = 'sk-ant-api03-xxxxxxxxxxxxx';
   ```

3. The `config.js` file is automatically gitignored and won't be committed to version control.

### 2. Start the CLSI Proxy Server

The application requires a local proxy server for Claude API calls and LaTeX compilation:

```bash
./start-clsi.sh
```

Or manually:
```bash
python3 clsi-proxy.py
```

The proxy server runs on `http://localhost:3014`.

### 3. Open the Application

Open `index.html` in your web browser. The application will:
- Connect to Claude API for worksheet generation
- Use the local CLSI server for LaTeX to PDF compilation
- Display a connection status indicator in the preview panel

## Features

- **AI-Powered Generation**: Uses Claude API to generate educational worksheets
- **LaTeX Support**: Professional typesetting with LaTeX
- **PDF Export**: Compile worksheets to PDF format
- **Interactive Editing**: Chat with AI to refine and modify worksheets
- **Grade & Subject Filters**: Customize worksheets for different grade levels and subjects

## Requirements

- Modern web browser
- Python 3 (for CLSI proxy server)
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## File Structure

- `index.html` - Main application interface
- `script.js` - Application logic and Claude API integration
- `styles.css` - Application styling
- `config.js` - API configuration (gitignored, created from template)
- `config.template.js` - Template for API configuration
- `clsi-proxy.py` - Proxy server for Claude API and LaTeX compilation
- `.gitignore` - Excludes sensitive files from version control

## Security Note

Never commit your `config.js` file or share your API key publicly. The `.gitignore` file is configured to exclude this file from git.
