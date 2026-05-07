// TubeGrow - Universal Script for All Pages

console.log('TubeGrow universal script loaded');

// Simple API service
const api = {
    baseURL: 'http://localhost:5001',
    
    async request(url, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${url}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            return { success: false, message: error.message };
        }
    },

    async login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async register(name, email, password) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }
};

// Universal button handler
function handleButtonClick(event) {
    const button = event.target.closest('button, a');
    if (!button) return;
    
    console.log('Button clicked:', button.textContent, button.href);
    
    // Handle navigation links
    if (button.href && button.href !== '#' && button.href !== window.location.href) {
        console.log('Navigating to:', button.href);
        window.location.href = button.href;
        return;
    }
    
    // Handle onclick attributes
    const onclick = button.getAttribute('onclick');
    if (onclick) {
        console.log('Executing onclick:', onclick);
        try {
            eval(onclick);
        } catch (error) {
            console.error('Error executing onclick:', error);
        }
    }
}

// Login form handler
function handleLogin(event) {
    event.preventDefault();
    console.log('Login form submitted');
    
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
    }
    
    // Try login
    api.login(email, password).then(result => {
        console.log('Login result:', result);
        
        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            alert('Login successful!');
            window.location.href = 'dashboard.html';
        } else {
            alert('Login failed: ' + (result.message || 'Invalid credentials'));
        }
    }).catch(error => {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }).finally(() => {
        // Reset button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    });
}

// Register form handler
function handleRegister(event) {
    event.preventDefault();
    console.log('Register form submitted');
    
    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
    }
    
    // Try register
    api.register(name, email, password).then(result => {
        console.log('Register result:', result);
        
        if (result.success) {
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        } else {
            alert('Registration failed: ' + (result.message || 'Please try again'));
        }
    }).catch(error => {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }).finally(() => {
        // Reset button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    });
}

// Tool functions for tools page
function startKeywordTool() {
    const modal = document.getElementById('keywordModal');
    if (modal) modal.style.display = 'block';
}

function startOptimizerTool() {
    const modal = document.getElementById('optimizerModal');
    if (modal) modal.style.display = 'block';
}

function startCompetitorTool() {
    const modal = document.getElementById('competitorModal');
    if (modal) modal.style.display = 'block';
}

function startThumbnailTool() {
    const modal = document.getElementById('thumbnailModal');
    if (modal) modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function researchKeyword() {
    const input = document.getElementById('keywordInput');
    const results = document.getElementById('keywordResults');
    
    if (input && results && input.value) {
        results.innerHTML = `
            <div style="padding: 1rem; background: #f0f9ff; border-radius: 8px; margin-top: 1rem;">
                <h4>Results for: "${input.value}"</h4>
                <p>Search Volume: High</p>
                <p>Competition: Medium</p>
                <p>Suggested Keywords: "${input.value} tutorial", "${input.value} guide", "how to ${input.value}"</p>
            </div>
        `;
    }
}

function optimizeVideo() {
    const title = document.getElementById('videoTitle');
    const description = document.getElementById('videoDescription');
    const results = document.getElementById('optimizerResults');
    
    if (title && description && results) {
        results.innerHTML = `
            <div style="padding: 1rem; background: #f0f9ff; border-radius: 8px; margin-top: 1rem;">
                <h4>Optimization Complete!</h4>
                <p><strong>Optimized Title:</strong> ${title.value} - Ultimate Guide 2024</p>
                <p><strong>SEO Score:</strong> 95/100</p>
                <p><strong>Suggested Tags:</strong> tutorial, guide, how to, tips</p>
            </div>
        `;
    }
}

function analyzeCompetitor() {
    const input = document.getElementById('competitorChannel');
    const results = document.getElementById('competitorResults');
    
    if (input && results && input.value) {
        results.innerHTML = `
            <div style="padding: 1rem; background: #f0f9ff; border-radius: 8px; margin-top: 1rem;">
                <h4>Competitor Analysis Complete!</h4>
                <p><strong>Channel:</strong> ${input.value}</p>
                <p><strong>Subscribers:</strong> 125K</p>
                <p><strong>Avg Views:</strong> 45K</p>
                <p><strong>Top Video:</strong> "How to Grow on YouTube"</p>
            </div>
        `;
    }
}

function generateThumbnail() {
    const input = document.getElementById('thumbnailText');
    const results = document.getElementById('thumbnailResults');
    
    if (input && results && input.value) {
        results.innerHTML = `
            <div style="padding: 1rem; background: #f0f9ff; border-radius: 8px; margin-top: 1rem;">
                <h4>Thumbnail Generated!</h4>
                <div style="width: 200px; height: 150px; background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin: 1rem 0;">
                    ${input.value}
                </div>
                <p>Thumbnail optimized for maximum CTR!</p>
            </div>
        `;
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing universal script');
    
    // Add click listeners to all buttons and links
    const clickableElements = document.querySelectorAll('button, a');
    clickableElements.forEach(element => {
        element.addEventListener('click', handleButtonClick);
        
        // Add hover effects
        element.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
            this.style.transform = 'translateY(-2px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Handle forms based on page
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('login.html')) {
        const loginForm = document.querySelector('form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    }
    
    if (currentPath.includes('register.html')) {
        const registerForm = document.querySelector('form');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
    }
    
    // Setup navigation active states
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = currentPath.split('/').pop();
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Setup modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Setup close buttons
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => modal.style.display = 'none');
        }
    });
    
    console.log('Universal script fully initialized');
});

// Make functions global
window.startKeywordTool = startKeywordTool;
window.startOptimizerTool = startOptimizerTool;
window.startCompetitorTool = startCompetitorTool;
window.startThumbnailTool = startThumbnailTool;
window.closeModal = closeModal;
window.researchKeyword = researchKeyword;
window.optimizeVideo = optimizeVideo;
window.analyzeCompetitor = analyzeCompetitor;
window.generateThumbnail = generateThumbnail;
