// Worksheet Creator - Main JavaScript File

// API Configuration
const API_KEY = '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';
const API_MODEL = 'openai/gpt-oss-20b:free';
const API_BASE_URL = 'https://openrouter.ai/api/v1';

// Global state management
let worksheetState = {
    prompt: '',
    gradeLevel: '',
    subject: '',
    worksheetType: '',
    questionCount: '',
    isGenerating: false,
    currentPDF: null,
    currentLaTeX: null,
    chatHistory: []
};

// LaTeX template system
const latexTemplates = {
    math: {
        practice: `\\documentclass[12pt]{article}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{geometry}
\\usepackage{fancyhdr}
\\usepackage{graphicx}
\\usepackage{enumerate}

\\geometry{margin=1in}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\textbf{Math Practice Worksheet}}
\\fancyhead[R]{Name: \\underline{\\hspace{3cm}} \ Date: \\underline{\\hspace{2cm}}}
\\fancyfoot[C]{\\thepage}

\\begin{document}

\\section*{Instructions}
Solve each problem below. Show all your work in the space provided.

\\vspace{0.5cm}

\\begin{enumerate}
[QUESTIONS_PLACEHOLDER]
\\end{enumerate}

\\newpage
\\section*{Answer Key}
[ANSWERS_PLACEHOLDER]

\\end{document}`,
        
        quiz: `\\documentclass[12pt]{article}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{geometry}
\\usepackage{fancyhdr}
\\usepackage{graphicx}
\\usepackage{multicol}

\\geometry{margin=1in}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\textbf{Math Quiz}}
\\fancyhead[R]{Name: \\underline{\\hspace{3cm}} \ Date: \\underline{\\hspace{2cm}}}
\\fancyfoot[C]{\\thepage}

\\begin{document}

\\section*{Instructions}
Choose the best answer for each question. Circle your answer clearly.

\\vspace{0.5cm}

\\begin{multicols}{2}
[QUESTIONS_PLACEHOLDER]
\\end{multicols}

\\newpage
\\section*{Answer Key}
[ANSWERS_PLACEHOLDER]

\\end{document}`
    },
    
    science: {
        practice: `\\documentclass[12pt]{article}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{geometry}
\\usepackage{fancyhdr}
\\usepackage{graphicx}
\\usepackage{enumerate}

\\geometry{margin=1in}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\textbf{Science Practice Worksheet}}
\\fancyhead[R]{Name: \\underline{\\hspace{3cm}} \ Date: \\underline{\\hspace{2cm}}}
\\fancyfoot[C]{\\thepage}

\\begin{document}

\\section*{Instructions}
Read each question carefully and provide detailed answers based on your scientific knowledge.

\\vspace{0.5cm}

\\begin{enumerate}
[QUESTIONS_PLACEHOLDER]
\\end{enumerate}

\\newpage
\\section*{Answer Key}
[ANSWERS_PLACEHOLDER]

\\end{document}`
    },
    
    english: {
        practice: `\\documentclass[12pt]{article}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{geometry}
\\usepackage{fancyhdr}
\\usepackage{graphicx}
\\usepackage{enumerate}

\\geometry{margin=1in}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\textbf{English Practice Worksheet}}
\\fancyhead[R]{Name: \\underline{\\hspace{3cm}} \ Date: \\underline{\\hspace{2cm}}}
\\fancyfoot[C]{\\thepage}

\\begin{document}

\\section*{Instructions}
Complete each exercise according to the directions provided.

\\vspace{0.5cm}

\\begin{enumerate}
[QUESTIONS_PLACEHOLDER]
\\end{enumerate}

\\newpage
\\section*{Answer Key}
[ANSWERS_PLACEHOLDER]

\\end{document}`
    }
};

// Question generators for different subjects and grade levels
const questionGenerators = {
    math: {
        'K': {
            practice: [
                'Count the objects: \\includegraphics[width=2cm]{shapes/circle} \\includegraphics[width=2cm]{shapes/circle} \\includegraphics[width=2cm]{shapes/circle}',
                'What comes next? 1, 2, 3, ___, 5',
                'Color the bigger shape: \\includegraphics[width=1cm]{shapes/small_square} \\includegraphics[width=2cm]{shapes/big_square}'
            ]
        },
        '1-3': {
            practice: [
                'Solve: $5 + 3 = \\underline{\\hspace{1cm}}$',
                'Solve: $12 - 7 = \\underline{\\hspace{1cm}}$',
                'What is the value of $x$ in $x + 4 = 9$?',
                'Draw a rectangle with length 4 units and width 2 units.',
                'Compare: $3 + 5 \\bigcirc 4 + 4$ (use $<$, $>$, or $=$)'
            ]
        },
        '4-5': {
            practice: [
                'Multiply: $23 \\times 4 = \\underline{\\hspace{1cm}}$',
                'Divide: $156 \\div 6 = \\underline{\\hspace{1cm}}$',
                'Add fractions: $\\frac{2}{5} + \\frac{1}{5} = \\underline{\\hspace{1cm}}$',
                'Convert to decimal: $\\frac{3}{4} = \\underline{\\hspace{1cm}}$',
                'Find the area of a rectangle with length 8 cm and width 5 cm.'
            ]
        },
        '6-8': {
            practice: [
                'Solve for $x$: $2x + 5 = 13$',
                'Simplify: $3(x + 4) - 2x$',
                'Find the slope of the line through points $(2, 5)$ and $(4, 9)$',
                'Solve: $\frac{x}{3} - 2 = 5$',
                'Calculate the circumference of a circle with radius 7 cm.'
            ]
        },
        '9-12': {
            practice: [
                'Solve the quadratic equation: $x^2 - 5x + 6 = 0$',
                'Find the derivative of $f(x) = 3x^2 - 2x + 1$',
                'Solve the system: $2x + y = 7$ and $x - y = -1$',
                'Simplify: $\frac{x^2 - 9}{x^2 - 6x + 9}$',
                'Find the area between the curves $y = x^2$ and $y = 2x$.'
            ]
        }
    },
    
    science: {
        'K': {
            practice: [
                'What do plants need to grow? Draw pictures.',
                'Circle the animals that live in water: \\includegraphics[width=1cm]{animals/fish} \\includegraphics[width=1cm]{animals/bird} \\includegraphics[width=1cm]{animals/frog}',
                'What season comes after summer?',
                'Draw yourself wearing clothes for winter.',
                'What happens to water when it gets very cold?'
            ]
        },
        '4-5': {
            practice: [
                'Label the parts of a plant: \\includegraphics[width=5cm]{diagrams/plant}',
                'What is the process by which plants make their own food?',
                'Name the three states of matter and give an example of each.',
                'What causes the water cycle?',
                'Draw and label the food chain with 4 organisms.'
            ]
        },
        '6-8': {
            practice: [
                'What is the difference between an atom and a molecule?',
                'Balance the chemical equation: $H_2 + O_2 \rightarrow H_2O$',
                'Explain the relationship between force, mass, and acceleration.',
                'What are the layers of the Earth? Draw and label them.',
                'Describe the process of photosynthesis using words and symbols.'
            ]
        },
        '9-12': {
            practice: [
                'Calculate the pH of a solution with $[H^+] = 1 \times 10^{-5}$ M.',
                'Explain the difference between covalent and ionic bonds.',
                'Write the equilibrium expression for: $2NO_2(g) \rightleftharpoons N_2O_4(g)$',
                'Calculate the work done by a gas expanding from 2L to 5L at constant pressure of 3 atm.',
                'Explain how natural selection leads to evolution.'
            ]
        }
    },
    
    english: {
        'K': {
            practice: [
                'Trace and write the letter A: \\includegraphics[width=2cm]{letters/trace_a}',
                'Circle the pictures that start with the /b/ sound.',
                'Draw a line from the word to the picture: \\underline{cat} \\includegraphics[width=1cm]{animals/cat}',
                'Write your name on the line: \\underline{\\hspace{5cm}}',
                'Color the rhyming words the same color.'
            ]
        },
        '1-3': {
            practice: [
                'Identify the noun in this sentence: "The cat sat on the mat."',
                'Write 3 words that rhyme with "book".',
                'Put the words in alphabetical order: apple, banana, cherry, date.',
                'Complete the sentence with a describing word: The ___ dog barked loudly.',
                'Draw and label 5 things you can find in your classroom.'
            ]
        },
        '6-8': {
            practice: [
                'Identify the parts of speech in: "The quick brown fox jumps over the lazy dog."',
                'Write a paragraph describing your favorite place using sensory details.',
                'Correct the punctuation: "what time is it asked john"',
                'Find the main idea and supporting details in the paragraph below.',
                'Write a summary of the story in 3-4 sentences.'
            ]
        },
        '9-12': {
            practice: [
                'Analyze the rhetorical devices used in Martin Luther King Jr.\'s "I Have a Dream" speech.',
                'Write a thesis statement for an essay about the importance of education.',
                'Identify and explain the literary devices in the following poem.',
                'Compare and contrast the themes in two novels you have read.',
                'Write a persuasive essay arguing for or against school uniforms.'
            ]
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize animations
    initializeAnimations();
    
    // Initialize particles background
    initializeParticles();
    
    // Initialize carousel
    initializeCarousel();
    
    // Load saved state
    loadWorksheetState();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for URL parameters
    checkURLParameters();
}

function initializeAnimations() {
    // Initialize text splitting for animations
    if (typeof Splitting !== 'undefined') {
        Splitting();
        
        // Animate split text
        anime({
            targets: '.splitting .char',
            translateY: [100, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1400,
            delay: (el, i) => 30 * i
        });
    }
    
    // Animate cards on scroll
    const cards = document.querySelectorAll('.card-hover');
    if (cards.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        translateY: [50, 0],
                        opacity: [0, 1],
                        easing: 'easeOutExpo',
                        duration: 1000,
                        delay: 200
                    });
                }
            });
        });
        
        cards.forEach(card => observer.observe(card));
    }
}

function initializeParticles() {
    // P5.js sketch for background particles
    if (typeof p5 !== 'undefined') {
        new p5((p) => {
            let particles = [];
            
            p.setup = function() {
                const canvas = p.createCanvas(p.windowWidth, 400);
                canvas.parent('particles');
                canvas.style('position', 'absolute');
                canvas.style('top', '0');
                canvas.style('left', '0');
                canvas.style('z-index', '1');
                
                // Create particles
                for (let i = 0; i < 50; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-0.5, 0.5),
                        vy: p.random(-0.5, 0.5),
                        size: p.random(2, 6),
                        opacity: p.random(0.1, 0.3)
                    });
                }
            };
            
            p.draw = function() {
                p.clear();
                
                // Update and draw particles
                particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // Wrap around edges
                    if (particle.x < 0) particle.x = p.width;
                    if (particle.x > p.width) particle.x = 0;
                    if (particle.y < 0) particle.y = p.height;
                    if (particle.y > p.height) particle.y = 0;
                    
                    // Draw particle
                    p.fill(255, 255, 255, particle.opacity * 255);
                    p.noStroke();
                    p.circle(particle.x, particle.y, particle.size);
                });
                
                // Draw connections
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dist = p.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        if (dist < 100) {
                            p.stroke(255, 255, 255, (1 - dist / 100) * 50);
                            p.strokeWeight(1);
                            p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        }
                    }
                }
            };
            
            p.windowResized = function() {
                p.resizeCanvas(p.windowWidth, 400);
            };
        });
    }
}

function initializeCarousel() {
    if (typeof Splide !== 'undefined') {
        const splide = new Splide('#templateCarousel', {
            type: 'loop',
            perPage: 3,
            perMove: 1,
            gap: '2rem',
            autoplay: true,
            interval: 4000,
            breakpoints: {
                768: {
                    perPage: 1,
                },
                1024: {
                    perPage: 2,
                }
            }
        });
        
        splide.mount();
    }
}

function setupEventListeners() {
    // Form input listeners
    const inputs = ['worksheetPrompt', 'gradeLevel', 'subject', 'worksheetType', 'questionCount'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', saveWorksheetState);
            element.addEventListener('input', saveWorksheetState);
        }
    });
    
    // Generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateWorksheet);
    }
}

function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const template = urlParams.get('template');
    const grade = urlParams.get('grade');
    const questions = urlParams.get('questions');
    
    if (template) {
        // Load template-specific data
        loadTemplate(template, grade, questions);
    }
}

function loadTemplate(templateId, grade, questions) {
    // Template loading logic would go here
    // For now, we'll just set the form values
    if (grade) {
        const gradeSelect = document.getElementById('gradeLevel');
        if (gradeSelect) gradeSelect.value = grade;
    }
    
    if (questions) {
        const questionsSelect = document.getElementById('questionCount');
        if (questionsSelect) questionsSelect.value = questions;
    }
    
    // Set a default prompt based on template
    const promptTextarea = document.getElementById('worksheetPrompt');
    if (promptTextarea) {
        promptTextarea.value = `Create a worksheet using the ${templateId} template with ${questions || '15'} questions suitable for ${grade || 'middle school'} students.`;
    }
    
    saveWorksheetState();
}

function saveWorksheetState() {
    const prompt = document.getElementById('worksheetPrompt')?.value || '';
    const gradeLevel = document.getElementById('gradeLevel')?.value || '';
    const subject = document.getElementById('subject')?.value || '';
    const worksheetType = document.getElementById('worksheetType')?.value || '';
    const questionCount = document.getElementById('questionCount')?.value || '';
    
    worksheetState = {
        ...worksheetState,
        prompt,
        gradeLevel,
        subject,
        worksheetType,
        questionCount
    };
    
    // Save to localStorage (excluding LaTeX which is large)
    const stateToSave = {
        ...worksheetState,
        currentLaTeX: null // Don't save LaTeX to localStorage, use sessionStorage instead
    };
    localStorage.setItem('worksheetState', JSON.stringify(stateToSave));
}

function loadWorksheetState() {
    const saved = localStorage.getItem('worksheetState');
    if (saved) {
        worksheetState = JSON.parse(saved);
        
        // Restore form values
        if (worksheetState.prompt) document.getElementById('worksheetPrompt').value = worksheetState.prompt;
        if (worksheetState.gradeLevel) document.getElementById('gradeLevel').value = worksheetState.gradeLevel;
        if (worksheetState.subject) document.getElementById('subject').value = worksheetState.subject;
        if (worksheetState.worksheetType) document.getElementById('worksheetType').value = worksheetState.worksheetType;
        if (worksheetState.questionCount) document.getElementById('questionCount').value = worksheetState.questionCount;
    }
}

function scrollToCreator() {
    const creatorSection = document.getElementById('creator');
    if (creatorSection) {
        creatorSection.scrollIntoView({ behavior: 'smooth' });
    }
}

async function generateWorksheet() {
    // Validate inputs
    if (!validateInputs()) {
        return;
    }
    
    // Update UI state
    setGeneratingState(true);
    
    try {
        // Get form values
        const prompt = document.getElementById('worksheetPrompt')?.value || '';
        const gradeLevel = document.getElementById('gradeLevel')?.value || '';
        const subject = document.getElementById('subject')?.value || '';
        const worksheetType = document.getElementById('worksheetType')?.value || '';
        const questionCount = document.getElementById('questionCount')?.value || '';
        
        // Build the prompt for the API
        const systemPrompt = `You are an expert LaTeX worksheet generator. Generate a complete, valid LaTeX document for a worksheet based on the user's requirements. The LaTeX should be ready to compile and should include:
- Proper document structure with necessary packages
- Professional formatting
- Questions appropriate for the specified grade level
- Answer key section
- Proper mathematical notation using LaTeX math mode

Generate ONLY the LaTeX code, no explanations or markdown formatting. Start with \\documentclass and end with \\end{document}.`;

        const userPrompt = `Create a ${worksheetType} worksheet for ${gradeLevel} grade ${subject} with ${questionCount} questions.

Additional requirements: ${prompt}

Make sure the worksheet is age-appropriate and curriculum-aligned. Include a variety of question types where appropriate.`;

        // Call the API
        const latexContent = await callAPI(systemPrompt, userPrompt);
        
        // Store LaTeX in state
        worksheetState.currentLaTeX = latexContent;
        saveWorksheetState();
        
        // Update preview
        updatePDFPreview(latexContent);
        
        // Enable edit button
        const editBtn = document.getElementById('editBtn');
        if (editBtn) {
            editBtn.disabled = false;
        }
        
        // Show success message
        showNotification('Worksheet generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating worksheet:', error);
        showNotification('Error generating worksheet: ' + (error.message || 'Please try again.'), 'error');
    } finally {
        setGeneratingState(false);
    }
}

// Export to window immediately after definition
window.generateWorksheet = generateWorksheet;

async function callAPI(systemPrompt, userPrompt) {
    try {
        console.log('Calling API with model:', API_MODEL);
        console.log('API Base URL:', API_BASE_URL);
        
        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Worksheet Creator'
            },
            body: JSON.stringify({
                model: API_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        console.log('API Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error?.message || `API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid API response structure:', data);
            throw new Error('Invalid API response format');
        }
        
        let latexContent = data.choices[0].message.content.trim();
        console.log('Received LaTeX content (first 200 chars):', latexContent.substring(0, 200));
        
        // Clean up the response - remove markdown code blocks if present
        latexContent = latexContent.replace(/^```latex\n?/g, '').replace(/^```\n?/g, '').replace(/```$/g, '');
        latexContent = latexContent.replace(/^```tex\n?/g, '').replace(/```$/g, '');
        
        return latexContent;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

function validateInputs() {
    // Get current values from form
    const prompt = document.getElementById('worksheetPrompt')?.value || '';
    const gradeLevel = document.getElementById('gradeLevel')?.value || '';
    const subject = document.getElementById('subject')?.value || '';
    const worksheetType = document.getElementById('worksheetType')?.value || '';
    const questionCount = document.getElementById('questionCount')?.value || '';
    
    if (!prompt.trim()) {
        showNotification('Please enter a worksheet description.', 'error');
        return false;
    }
    
    if (!gradeLevel) {
        showNotification('Please select a grade level.', 'error');
        return false;
    }
    
    if (!subject) {
        showNotification('Please select a subject.', 'error');
        return false;
    }
    
    if (!worksheetType) {
        showNotification('Please select a worksheet type.', 'error');
        return false;
    }
    
    if (!questionCount) {
        showNotification('Please select the number of questions.', 'error');
        return false;
    }
    
    return true;
}

function setGeneratingState(generating) {
    worksheetState.isGenerating = generating;
    const generateBtn = document.getElementById('generateBtn');
    const pdfPreview = document.getElementById('pdfPreview');
    
    if (generateBtn) {
        if (generating) {
            generateBtn.innerHTML = `
                <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
            `;
            generateBtn.disabled = true;
        } else {
            generateBtn.innerHTML = `
                <span>Generate Worksheet</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
            `;
            generateBtn.disabled = false;
        }
    }
    
    if (pdfPreview) {
        if (generating) {
            pdfPreview.classList.add('loading');
        } else {
            pdfPreview.classList.remove('loading');
        }
    }
}

function generateLaTeX() {
    const { subject, worksheetType, gradeLevel, questionCount, prompt } = worksheetState;
    
    // Get appropriate template
    const template = latexTemplates[subject]?.[worksheetType] || latexTemplates.math.practice;
    
    // Generate questions based on subject and grade level
    const questions = generateQuestions(subject, gradeLevel, parseInt(questionCount));
    
    // Generate answers (simplified for demo)
    const answers = generateAnswers(subject, gradeLevel, questions);
    
    // Replace placeholders in template
    let latexContent = template
        .replace('[QUESTIONS_PLACEHOLDER]', questions.join('\n\n'))
        .replace('[ANSWERS_PLACEHOLDER]', answers.join('\n\n'));
    
    return latexContent;
}

function generateQuestions(subject, gradeLevel, count) {
    const generator = questionGenerators[subject]?.[gradeLevel];
    if (!generator) {
        return generateDefaultQuestions(subject, count);
    }
    
    const questions = generator.practice || [];
    const selectedQuestions = [];
    
    for (let i = 0; i < count; i++) {
        const question = questions[i % questions.length];
        selectedQuestions.push(`\\item ${question}`);
    }
    
    return selectedQuestions;
}

function generateDefaultQuestions(subject, count) {
    const questions = [];
    for (let i = 1; i <= count; i++) {
        questions.push(`\\item Solve problem ${i}:`);
    }
    return questions;
}

function generateAnswers(subject, gradeLevel, questions) {
    // Simplified answer generation
    const answers = [];
    questions.forEach((question, index) => {
        answers.push(`${index + 1}. Answer for question ${index + 1}`);
    });
    return answers;
}

async function generatePDF(latexContent) {
    // Simulate PDF generation
    // In a real implementation, this would send the LaTeX to a server for compilation
    await simulateDelay(1500);
    
    // Return a mock PDF URL
    return 'data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeJzzMrBQMzCwMLDQNzDUUSgowIBKU2NjhaIGBgYWhgZKOobGxgolJZlF+Zl5pXaKxgYKxQCOZxQ2CmVuZHN0cmVhbQplbmRvYmoKCjUgMCBvYmoKNQplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDc3IDAwMDAwIG4gCjAwMDAwMDAxNzggMDAwMDAgbiAKMDAwMDAwMDQ1NyAwMDAwMCBuIAowMDAwMDAwNTQyIDAwMDAwIG4gCnRyYWlsZXIKPDwgL1NpemUgNiAvUm9vdCAyIDAgUiA+PgpzdGFydHhyZWYKNTkwCiUlRU9G';
}

function updatePDFPreview(latexContent) {
    const pdfPreview = document.getElementById('pdfPreview');
    if (pdfPreview) {
        // Store LaTeX in sessionStorage for preview page
        sessionStorage.setItem('worksheetLaTeX', latexContent);
        sessionStorage.setItem('worksheetMetadata', JSON.stringify({
            gradeLevel: worksheetState.gradeLevel,
            subject: worksheetState.subject,
            worksheetType: worksheetState.worksheetType,
            questionCount: worksheetState.questionCount,
            prompt: worksheetState.prompt
        }));
        
        // Show preview with LaTeX info
        pdfPreview.innerHTML = `
            <div class="bg-white rounded-lg p-4 h-full flex flex-col justify-center">
                <div class="text-center">
                    <svg class="w-16 h-16 mx-auto mb-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="text-lg font-medium text-slate-900 mb-2">Worksheet Generated!</p>
                    <p class="text-sm text-slate-600 mb-4">LaTeX ready for preview and editing</p>
                    <div class="flex items-center justify-center space-x-2 text-xs text-slate-500 mb-4">
                        <span>📊 ${worksheetState.questionCount} questions</span>
                        <span>•</span>
                        <span>📝 ${worksheetState.subject}</span>
                        <span>•</span>
                        <span>🎓 Grade ${worksheetState.gradeLevel}</span>
                    </div>
                    <div class="text-xs text-slate-400 bg-slate-50 p-2 rounded max-h-32 overflow-auto">
                        <code class="text-xs">${latexContent.substring(0, 200)}...</code>
                    </div>
                </div>
            </div>
        `;
        
        worksheetState.currentLaTeX = latexContent;
    }
}

function openPreview() {
    // Store current LaTeX in sessionStorage if available
    if (worksheetState.currentLaTeX) {
        sessionStorage.setItem('worksheetLaTeX', worksheetState.currentLaTeX);
        sessionStorage.setItem('worksheetMetadata', JSON.stringify({
            gradeLevel: worksheetState.gradeLevel,
            subject: worksheetState.subject,
            worksheetType: worksheetState.worksheetType,
            questionCount: worksheetState.questionCount,
            prompt: worksheetState.prompt
        }));
    }
    // Open the preview page in a new tab or navigate to it
    window.open('preview.html', '_blank');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
    
    // Set notification style based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-emerald-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-amber-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility functions for LaTeX generation
function escapeLaTeX(text) {
    return text.replace(/[&%$#_{}]/g, '\\$&');
}

function formatMathExpression(expr) {
    // Add proper LaTeX math formatting
    if (!expr.includes('$')) {
        return `$${expr}$`;
    }
    return expr;
}

// Export remaining functions for global access
window.scrollToCreator = scrollToCreator;
window.openPreview = openPreview;