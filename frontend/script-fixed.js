// TubeGrow - Fixed Button Functionality

// Simple API Service
class TubeGrowAPI {
    constructor() {
        this.baseURL = 'http://localhost:5001';
    }

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
            throw error;
        }
    }

    async login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(name, email, password) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }

    async health() {
        return this.request('/api/health');
    }
}

// Initialize API
const api = new TubeGrowAPI();

// Login functionality
function initLogin() {
    const loginForm = document.querySelector('.auth-form');
    if (!loginForm) return;

    console.log('Initializing login form');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Login form submitted');
        
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            console.log('Attempting login with:', email);
            const result = await api.login(email, password);
            console.log('Login result:', result);
            
            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                alert('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                alert('Login failed: ' + (result.message || 'Invalid credentials'));
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    });
}

// Register functionality
function initRegister() {
    const registerForm = document.querySelector('.auth-form');
    if (!registerForm) return;

    console.log('Initializing register form');

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Register form submitted');
        
        const name = document.getElementById('name')?.value;
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        
        if (!name || !email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            console.log('Attempting registration with:', { name, email });
            const result = await api.register(name, email, password);
            console.log('Register result:', result);
            
            if (result.success) {
                alert('Registration successful! Please login.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            } else {
                alert('Registration failed: ' + (result.message || 'Please try again'));
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed: ' + error.message);
        }
    });
}

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname.split('/').pop();
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        }
        
        // Add click handlers
        link.addEventListener('click', function(e) {
            console.log('Navigation clicked:', href);
            // Remove active from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active to clicked link
            this.classList.add('active');
        });
    });
}

// Button functionality
function initButtons() {
    // Hero buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Hero button clicked:', this.textContent);
            const href = this.getAttribute('href');
            if (href) {
                window.location.href = href;
            }
        });
    });

    // CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('CTA button clicked:', this.textContent);
            const href = this.getAttribute('href');
            if (href) {
                window.location.href = href;
            }
        });
    });

    // Tool buttons
    const toolButtons = document.querySelectorAll('.tool-card .btn');
    toolButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Tool button clicked:', this.textContent);
            const modalId = this.getAttribute('onclick');
            if (modalId && modalId.includes('Modal')) {
                const modalName = modalId.match(/'([^']+)'/)[1];
                openModal(modalName);
            }
        });
    });
}

// Modal functionality
function initModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Close modals with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });

    // Close button functionality
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Open modal function
function openModal(modalId) {
    console.log('Opening modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Test functions
function initTestFunctions() {
    window.testBackend = async function() {
        try {
            const result = await api.health();
            console.log('Backend test result:', result);
            alert('Backend connection: ' + (result ? 'SUCCESS' : 'FAILED'));
            return result;
        } catch (error) {
            console.error('Backend test failed:', error);
            alert('Backend connection: FAILED - ' + error.message);
            return null;
        }
    };

    window.testLogin = async function() {
        try {
            const result = await api.login('test@example.com', 'password123');
            console.log('Login test result:', result);
            alert('Login test: ' + (result.success ? 'SUCCESS' : 'FAILED'));
            return result;
        } catch (error) {
            console.error('Login test failed:', error);
            alert('Login test: FAILED - ' + error.message);
            return null;
        }
    };

    window.testRegister = async function() {
        try {
            const result = await api.register('Test User', 'test@example.com', 'password123');
            console.log('Register test result:', result);
            alert('Register test: ' + (result.success ? 'SUCCESS' : 'FAILED'));
            return result;
        } catch (error) {
            console.error('Register test failed:', error);
            alert('Register test: FAILED - ' + error.message);
            return null;
        }
    };
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add hover effects to cards
function initCardEffects() {
    const cards = document.querySelectorAll('.card, .feature-card, .stat-card, .tool-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('TubeGrow initialized - buttons working');
    
    // Initialize all functionality
    initNavigation();
    initButtons();
    initModals();
    initSmoothScroll();
    initCardEffects();
    initTestFunctions();
    
    // Page-specific initialization
    if (window.location.pathname.includes('login.html')) {
        initLogin();
    }
    
    if (window.location.pathname.includes('register.html')) {
        initRegister();
    }
    
    console.log('All buttons initialized and ready');
});

// Make functions globally available
window.openModal = openModal;
window.testBackend = testBackend;
window.testLogin = testLogin;
window.testRegister = testRegister;
