// API Configuration
const API_KEY = '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';
const API_MODEL = 'google/gemini-2.0-flash-exp:free';
const API_BASE_URL = 'https://openrouter.ai/api/v1';

// Global State
let worksheetState = {
  prompt: '',
  gradeLevel: '',
  subject: '',
  worksheetType: '',
  currentLaTeX: null,
  chatHistory: [],
  isGenerating: false
};

// Page load animations and initialization
document.addEventListener('DOMContentLoaded', () => {
  initializeAnimations();
  setupEventListeners();
  checkCLSIService(); // Check connection on load
});

function initializeAnimations() {
  // Animate name label - fade in from left
  anime({
    targets: '#name-label',
    opacity: [0, 1],
    translateX: [-20, 0],
    duration: 600,
    easing: 'easeOutCubic',
    delay: 200
  });

  // Animate central text - fade in with scale
  const centralText = document.getElementById('central-text');
  centralText.style.transform = 'translate(-50%, -50%) scale(0.9)';
  anime({
    targets: centralText,
    opacity: [0, 1],
    scale: [0.9, 1],
    duration: 800,
    easing: 'easeOutCubic',
    delay: 400,
    update: function (anim) {
      const scale = anim.animatables[0].target.scale;
      centralText.style.transform = `translate(-50%, -50%) scale(${scale})`;
    },
    complete: function () {
      centralText.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  });

  // Animate input container - pop up from bottom with fade
  const inputContainer = document.getElementById('input-container');
  const inputContainerAnim = { translateY: 20, opacity: 0 };
  anime({
    targets: inputContainerAnim,
    translateY: [20, 0],
    opacity: [0, 1],
    duration: 700,
    easing: 'easeOutCubic',
    delay: 800,
    update: function (anim) {
      const translateY = inputContainerAnim.translateY;
      const opacity = inputContainerAnim.opacity;
      inputContainer.style.transform = `translate(-50%, ${translateY}px)`;
      inputContainer.style.opacity = opacity;
    },
    complete: function () {
      inputContainer.style.transform = 'translate(-50%, 0)';
      inputContainer.style.opacity = '1';
    }
  });

  // Animate filter selects - stagger fade in
  anime({
    targets: '.filter-select',
    opacity: [0, 1],
    scale: [0.95, 1],
    duration: 500,
    easing: 'easeOutCubic',
    delay: anime.stagger(100, { start: 1200 })
  });

  // Animate arrow button - fade in with slight scale
  anime({
    targets: '.arrow-btn',
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 500,
    easing: 'easeOutBack',
    delay: 1500
  });

  // Background floating shapes animations
  const shapes = document.querySelectorAll('.floating-shape');
  shapes.forEach((shape, index) => {
    const randomX = (Math.random() - 0.5) * 200;
    const randomY = (Math.random() - 0.5) * 200;
    const randomDuration = 8000 + Math.random() * 4000;
    const randomDelay = index * 100;

    anime({
      targets: shape,
      opacity: [0, 0.15],
      duration: 600,
      delay: 600 + randomDelay,
      easing: 'easeOutQuad'
    });

    const animObj = { x: 0, y: 0, rotation: 0 };
    function floatShape() {
      anime({
        targets: animObj,
        x: [0, randomX, -randomX, 0],
        y: [0, randomY, -randomY, 0],
        rotation: 360,
        duration: randomDuration * 2,
        easing: 'easeInOutSine',
        delay: 600 + randomDelay,
        update: function () {
          shape.style.transform = `translate(${animObj.x}px, ${animObj.y}px) rotate(${animObj.rotation}deg)`;
        },
        complete: function () {
          animObj.rotation = 0;
          floatShape();
        }
      });
    }
    floatShape();
  });
}

function setupEventListeners() {
  // Generate Button Click
  const generateBtn = document.getElementById('generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', handleGenerate);
  }

  // Input Enter Key
  const input = document.getElementById('worksheet-input');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleGenerate();
      }
    });
  }

  // Chat Input Enter Key
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  // Send Chat Button
  const sendChatBtn = document.getElementById('send-chat-btn');
  if (sendChatBtn) {
    sendChatBtn.addEventListener('click', sendChatMessage);
  }

  // Download Button
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadPDF);
  }

  // Check Connection Button
  const checkConnBtn = document.getElementById('check-connection-btn');
  if (checkConnBtn) {
    checkConnBtn.addEventListener('click', checkCLSIService);
  }

  // Back to Home Button
  const backBtn = document.getElementById('back-home-btn');
  if (backBtn) {
    backBtn.addEventListener('click', transitionToHome);
  }
}

function handleGenerate() {
  const prompt = document.getElementById('worksheet-input').value;
  if (!prompt.trim()) return;

  // Update State
  worksheetState.prompt = prompt;
  worksheetState.gradeLevel = document.getElementById('grade-select').value;
  worksheetState.subject = document.getElementById('subject-select').value;
  worksheetState.worksheetType = document.getElementById('type-select').value;

  // Transition to Workspace
  transitionToWorkspace();

  // Start Generation
  generateWorksheet();
}

function transitionToWorkspace() {
  const inputContainer = document.getElementById('input-container');
  const centralText = document.getElementById('central-text');
  const workspaceContainer = document.getElementById('workspace-container');

  // Animate Central Text Out
  anime({
    targets: centralText,
    opacity: 0,
    scale: 0.8,
    duration: 500,
    easing: 'easeInCubic',
    complete: () => {
      centralText.style.display = 'none';
    }
  });

  // Animate Input Container Out
  anime({
    targets: inputContainer,
    opacity: 0,
    translateY: 20,
    duration: 500,
    easing: 'easeInCubic',
    complete: () => {
      inputContainer.style.display = 'none';
    }
  });

  // Fade In Workspace
  workspaceContainer.classList.remove('hidden');
  anime({
    targets: workspaceContainer,
    opacity: [0, 1],
    duration: 800,
    delay: 300,
    easing: 'easeOutCubic',
    begin: () => {
      workspaceContainer.classList.add('active');
    }
  });
}

function transitionToHome() {
  const inputContainer = document.getElementById('input-container');
  const centralText = document.getElementById('central-text');
  const workspaceContainer = document.getElementById('workspace-container');

  // Fade Out Workspace
  anime({
    targets: workspaceContainer,
    opacity: 0,
    duration: 500,
    easing: 'easeInCubic',
    complete: () => {
      workspaceContainer.classList.add('hidden');
      workspaceContainer.classList.remove('active');

      // Reset Workspace State
      resetWorkspace();
    }
  });

  // Fade In Central Text
  centralText.style.display = 'block';
  anime({
    targets: centralText,
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 800,
    delay: 300,
    easing: 'easeOutCubic'
  });

  // Fade In Input Container
  inputContainer.style.display = 'flex';
  anime({
    targets: inputContainer,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    delay: 400,
    easing: 'easeOutCubic'
  });
}

function resetWorkspace() {
  // Clear chat history except initial message
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML = `
    <div class="chat-bubble ai-bubble">
      Hi! I'm generating your worksheet. Once it's ready, you can ask me to make changes!
    </div>
  `;

  // Clear preview
  const pdfViewer = document.getElementById('pdf-viewer');
  const htmlPreview = document.getElementById('html-preview');
  const loadingState = document.getElementById('loading-state');

  pdfViewer.src = '';
  pdfViewer.classList.add('hidden');
  htmlPreview.innerHTML = '';
  htmlPreview.classList.add('hidden');
  loadingState.classList.remove('hidden');

  // Reset buttons
  document.getElementById('download-btn').disabled = true;
  document.getElementById('chat-input').disabled = true;
  document.getElementById('send-chat-btn').disabled = true;

  // Reset state
  worksheetState.currentLaTeX = null;
  window.currentPdfBlob = null;
}

async function generateWorksheet() {
  setLoadingState(true);

  try {
    const systemPrompt = `You are an expert LaTeX worksheet generator. Generate a complete, valid LaTeX document for a worksheet based on the user's requirements. The LaTeX should be ready to compile and should include:
- Proper document structure with necessary packages
- Professional formatting
- Questions appropriate for the specified grade level
- Answer key section
- Proper mathematical notation using LaTeX math mode

Generate ONLY the LaTeX code, no explanations or markdown formatting. Start with \\documentclass and end with \\end{document}.`;

    const userPrompt = `Create a ${worksheetState.worksheetType || 'practice'} worksheet for ${worksheetState.gradeLevel || 'general'} grade ${worksheetState.subject || 'general'} with the following description: "${worksheetState.prompt}".
    
    Make sure the worksheet is age-appropriate and curriculum-aligned. Include a variety of question types where appropriate.`;

    // Call API with retry logic
    const latexContent = await callAPIWithRetry(systemPrompt, userPrompt);

    worksheetState.currentLaTeX = latexContent;

    // Render Preview
    await renderPreview(latexContent);

    // Enable Chat
    enableChat();

    // Add initial AI message
    addChatMessage("I've generated your worksheet! Let me know if you'd like any changes.", 'ai');

  } catch (error) {
    console.error('Error generating worksheet:', error);
    addChatMessage("Sorry, I encountered an error generating the worksheet after multiple attempts. Please try again.", 'ai');
    setLoadingState(false);
  }
}

async function callAPIWithRetry(systemPrompt, userPrompt, maxRetries = 10) {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      attempts++;
      console.log(`API Attempt ${attempts}/${maxRetries}`);

      const content = await callAPI(systemPrompt, userPrompt);

      // Basic validation - check if it looks like LaTeX
      if (content && content.includes('\\documentclass') && content.includes('\\end{document}')) {
        return content;
      } else {
        console.warn('API returned invalid LaTeX, retrying...');
        throw new Error('Invalid LaTeX response');
      }
    } catch (error) {
      console.warn(`Attempt ${attempts} failed:`, error);
      if (attempts >= maxRetries) throw error;

      // Wait before retry (exponential backoff with higher initial delay for 429s)
      const delay = Math.min(2000 * Math.pow(2, attempts), 10000);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function callAPI(systemPrompt, userPrompt) {
  const response = await fetch(`${API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'WorkNest'
    },
    body: JSON.stringify({
      model: API_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();

  // Clean up markdown
  content = content.replace(/^```latex\n?/g, '').replace(/^```\n?/g, '').replace(/```$/g, '');
  content = content.replace(/^```tex\n?/g, '').replace(/```$/g, '');

  return content;
}

async function renderPreview(latexContent) {
  const pdfViewer = document.getElementById('pdf-viewer');
  const htmlPreview = document.getElementById('html-preview');
  const loadingState = document.getElementById('loading-state');
  const downloadBtn = document.getElementById('download-btn');

  // Show loading
  loadingState.classList.remove('hidden');
  pdfViewer.classList.add('hidden');
  htmlPreview.classList.add('hidden');

  try {
    // Try CLSI Compilation
    const pdfBlob = await compileLaTeXToPDF(latexContent);

    if (pdfBlob) {
      const pdfUrl = URL.createObjectURL(pdfBlob) + '#toolbar=0&navpanes=0&scrollbar=0';
      pdfViewer.src = pdfUrl;
      pdfViewer.classList.remove('hidden');
      loadingState.classList.add('hidden');
      window.currentPdfBlob = pdfBlob;
      downloadBtn.disabled = false;
      return;
    }
  } catch (error) {
    console.warn('PDF compilation failed, falling back to HTML:', error);
  }

  // Fallback to HTML
  loadingState.classList.add('hidden');
  htmlPreview.classList.remove('hidden');
  htmlPreview.innerHTML = convertLaTeXToHTML(latexContent);

  if (window.MathJax) {
    window.MathJax.typesetPromise([htmlPreview]);
  }

  downloadBtn.disabled = false; // Allow download (will use html2pdf)
}

async function compileLaTeXToPDF(latexContent) {
  const CLSI_PROXY = 'http://localhost:3014';
  const projectId = 'worknest-' + Date.now();

  try {
    const response = await fetch(`${CLSI_PROXY}/project/${projectId}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compile: {
          options: { compiler: 'pdflatex', timeout: 60 },
          rootResourcePath: 'main.tex',
          resources: [{ path: 'main.tex', content: latexContent }]
        }
      })
    });

    if (!response.ok) throw new Error('CLSI compilation failed');

    const result = await response.json();
    if (result.compile && result.compile.status === 'success') {
      const pdfFile = result.compile.outputFiles.find(f => f.type === 'pdf');
      if (pdfFile) {
        const pdfUrl = `${CLSI_PROXY}${pdfFile.url.replace(/^https?:\/\/[^\/]+/, '')}`;
        const pdfResponse = await fetch(pdfUrl);
        return await pdfResponse.blob();
      }
    }
  } catch (error) {
    console.warn('CLSI error:', error);
    return null;
  }
}

// Chat Functionality
function enableChat() {
  document.getElementById('chat-input').disabled = false;
  document.getElementById('send-chat-btn').disabled = false;
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  addChatMessage(message, 'user');
  input.value = '';

  // Show typing indicator (simplified)
  const typingId = addChatMessage('...', 'ai');

  try {
    const response = await callChatAPI(message);

    // Remove typing indicator
    const typingBubble = document.querySelector(`[data-msg-id="${typingId}"]`);
    if (typingBubble) typingBubble.remove();

    addChatMessage(response.message, 'ai');

    if (response.latex) {
      worksheetState.currentLaTeX = response.latex;
      renderPreview(response.latex);
    }
  } catch (error) {
    console.error('Chat error:', error);
    addChatMessage('Sorry, something went wrong.', 'ai');
  }
}

function addChatMessage(text, sender) {
  const container = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  const id = Date.now();
  bubble.className = `chat-bubble ${sender === 'user' ? 'user-bubble' : 'ai-bubble'}`;
  bubble.textContent = text;
  bubble.dataset.msgId = id;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return id;
}

async function callChatAPI(userMessage) {
  const systemPrompt = `You are an AI assistant helping to edit a LaTeX worksheet. 
  Return JSON ONLY: {"message": "friendly explanation", "latex": "COMPLETE updated latex code or null if no changes"}.
  Current LaTeX: ${worksheetState.currentLaTeX ? worksheetState.currentLaTeX.substring(0, 500) + '...' : 'None'}`;

  const response = await fetch(`${API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: API_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });

  const data = await response.json();
  let content = data.choices[0].message.content.trim();

  try {
    content = content.replace(/^```json\n?/g, '').replace(/^```\n?/g, '').replace(/```$/g, '');
    return JSON.parse(content);
  } catch (e) {
    return { message: content, latex: null };
  }
}

// Utilities
function setLoadingState(loading) {
  const loadingState = document.getElementById('loading-state');
  if (loading) {
    loadingState.classList.remove('hidden');
  } else {
    loadingState.classList.add('hidden');
  }
}

async function checkCLSIService() {
  const statusEl = document.getElementById('connection-status');
  const dot = statusEl.querySelector('.status-dot');
  const text = statusEl.querySelector('.status-text');

  statusEl.classList.add('checking');
  text.textContent = 'Checking...';

  try {
    await fetch('http://localhost:3014');
    statusEl.classList.remove('checking');
    statusEl.classList.add('connected');
    dot.style.background = 'var(--success-color)';
    text.textContent = 'Connected';
  } catch (e) {
    statusEl.classList.remove('checking');
    statusEl.classList.add('disconnected');
    dot.style.background = 'var(--error-color)';
    text.textContent = 'Disconnected';
  }
}

function downloadPDF() {
  if (window.currentPdfBlob) {
    const url = URL.createObjectURL(window.currentPdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'worksheet.pdf';
    document.body.appendChild(a); // Append to body to ensure click works
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url); // Free memory
  } else {
    // Fallback html2pdf
    const element = document.getElementById('html-preview');
    html2pdf().from(element).save('worksheet.pdf');
  }
}

// Simple LaTeX to HTML converter for fallback
function convertLaTeXToHTML(latex) {
  // Basic replacements for demo purposes
  let html = latex
    .replace(/\\documentclass\[.*?\]\{.*?\}/g, '')
    .replace(/\\usepackage\{.*?\}/g, '')
    .replace(/\\begin\{document\}/g, '')
    .replace(/\\end\{document\}/g, '')
    .replace(/\\section\*?\{([^\}]+)\}/g, '<h2>$1</h2>')
    .replace(/\\textbf\{([^\}]+)\}/g, '<strong>$1</strong>')
    .replace(/\\textit\{([^\}]+)\}/g, '<em>$1</em>')
    .replace(/\\begin\{enumerate\}/g, '<ol>')
    .replace(/\\end\{enumerate\}/g, '</ol>')
    .replace(/\\item\s+([^\n]+)/g, '<li>$1</li>')
    .replace(/\\\\/g, '<br>');
  return `<div class="latex-content">${html}</div>`;
}
