// TubeGrow - Simple Working JavaScript

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

    // Auth functions
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

    // Health check
    async health() {
        return this.request('/api/health');
    }
}

// Initialize API
const api = new TubeGrowAPI();

// Login functionality
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const result = await api.login(email, password);
            
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
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!name || !email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const result = await api.register(name, email, password);
            
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

// Navigation active state
function initNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath.split('/').pop()) {
            link.classList.add('active');
        }
    });
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

// Simple modal functionality
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
}

// Test functions for debugging
function initTestFunctions() {
    // Test backend connection
    window.testBackend = async function() {
        try {
            const result = await api.health();
            console.log('Backend test result:', result);
            return result;
        } catch (error) {
            console.error('Backend test failed:', error);
            return null;
        }
    };

    // Test login
    window.testLogin = async function() {
        try {
            const result = await api.login('test@example.com', 'password123');
            console.log('Login test result:', result);
            return result;
        } catch (error) {
            console.error('Login test failed:', error);
            return null;
        }
    };

    // Test register
    window.testRegister = async function() {
        try {
            const result = await api.register('Test User', 'test@example.com', 'password123');
            console.log('Register test result:', result);
            return result;
        } catch (error) {
            console.error('Register test failed:', error);
            return null;
        }
    };
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('TubeGrow initialized');
    
    // Initialize based on current page
    initNavigation();
    initSmoothScroll();
    initModals();
    initTestFunctions();
    
    // Page-specific initialization
    if (document.getElementById('loginForm')) {
        initLogin();
    }
    
    if (document.getElementById('registerForm')) {
        initRegister();
    }
    
    // Add some basic interactivity
    addBasicInteractivity();
});

// Add basic interactive elements
function addBasicInteractivity() {
    // Animate elements on scroll
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('.header');
        
        if (header) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card, .feature-card, .stat-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Export for global access
window.TubeGrowAPI = TubeGrowAPI;
window.api = api;
