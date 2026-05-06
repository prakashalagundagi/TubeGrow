// TubeGrow - Simple Working JavaScript

console.log('TubeGrow script loaded');

// Simple API Service
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
            throw error;
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
    },

    async health() {
        return this.request('/api/health');
    }
};

// Button click handler
function handleButtonClick(event) {
    console.log('Button clicked:', event.target);
    
    const button = event.target.closest('.btn');
    if (!button) return;
    
    const href = button.getAttribute('href');
    const onclick = button.getAttribute('onclick');
    
    console.log('Button details:', { href, onclick });
    
    if (href && href !== '#') {
        console.log('Navigating to:', href);
        window.location.href = href;
    }
    
    if (onclick) {
        console.log('Executing onclick:', onclick);
        try {
            eval(onclick);
        } catch (error) {
            console.error('Error executing onclick:', error);
        }
    }
}

// Initialize all buttons
function initButtons() {
    console.log('Initializing buttons...');
    
    // Add click listeners to all buttons
    const buttons = document.querySelectorAll('.btn');
    console.log('Found buttons:', buttons.length);
    
    buttons.forEach((button, index) => {
        console.log(`Button ${index}:`, button.textContent, button.href);
        
        // Remove any existing listeners
        button.removeEventListener('click', handleButtonClick);
        
        // Add new listener
        button.addEventListener('click', handleButtonClick);
        
        // Add visual feedback
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    console.log('Buttons initialized');
}

// Login form handler
function initLoginForm() {
    const loginForm = document.querySelector('.auth-form');
    if (!loginForm) {
        console.log('No login form found');
        return;
    }
    
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
            console.log('Attempting login...');
            const result = await api.login(email, password);
            console.log('Login result:', result);
            
            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                alert('Login successful!');
                window.location.href = 'dashboard.html';
            } else {
                alert('Login failed: ' + (result.message || 'Invalid credentials'));
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    });
}

// Register form handler
function initRegisterForm() {
    const registerForm = document.querySelector('.auth-form');
    if (!registerForm) {
        console.log('No register form found');
        return;
    }
    
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
            console.log('Attempting registration...');
            const result = await api.register(name, email, password);
            console.log('Register result:', result);
            
            if (result.success) {
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
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
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        }
    });
}

// Modal functions
function openModal(modalId) {
    console.log('Opening modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modal) {
    if (typeof modal === 'string') {
        modal = document.getElementById(modal);
    }
    if (modal) {
        modal.style.display = 'none';
    }
}

// Test functions
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

// Make modal functions global
window.openModal = openModal;
window.closeModal = closeModal;

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing TubeGrow');
    
    // Initialize buttons first
    initButtons();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize forms based on page
    if (window.location.pathname.includes('login.html')) {
        initLoginForm();
    }
    
    if (window.location.pathname.includes('register.html')) {
        initRegisterForm();
    }
    
    // Initialize modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Close buttons
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="block"]');
            openModals.forEach(closeModal);
        }
    });
    
    console.log('TubeGrow fully initialized');
});
