// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// API Helper Functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
        console.error('API call failed:', error);
        throw error;
    }
}

// Authentication API
const authAPI = {
    async login(email, password) {
        return await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },
    
    async register(userData) {
        return await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    async logout() {
        return await apiCall('/auth/logout', {
            method: 'POST'
        });
    }
};

// User API
const userAPI = {
    async getProfile() {
        const token = localStorage.getItem('token');
        return await apiCall('/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },
    
    async updateProfile(userData) {
        const token = localStorage.getItem('token');
        return await apiCall('/users/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
    }
};

// Video API
const videoAPI = {
    async analyzeVideo(videoData) {
        const token = localStorage.getItem('token');
        return await apiCall('/videos/analyze', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(videoData)
        });
    },
    
    async getVideos() {
        const token = localStorage.getItem('token');
        return await apiCall('/videos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
};

// Analytics API
const analyticsAPI = {
    async getDashboardStats() {
        const token = localStorage.getItem('token');
        return await apiCall('/analytics/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
};

// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Active navigation highlighting
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
    
    // Handle login form submission
    const loginForm = document.querySelector('.auth-form');
    if (loginForm && loginForm.action && loginForm.action.includes('login.html')) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            console.log('Email:', email, 'Password:', password);
            
            try {
                const result = await authAPI.login(email, password);
                console.log('Login result:', result);
                if (result.success) {
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    window.location.href = 'dashboard.html';
                } else {
                    alert(result.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            }
        });
    }
    
    // Handle register form submission
    const registerForm = document.querySelector('.auth-form');
    if (registerForm && registerForm.action && registerForm.action.includes('register.html')) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Register form submitted');
            
            const userData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };
            console.log('User data:', userData);
            
            try {
                const result = await authAPI.register(userData);
                console.log('Register result:', result);
                if (result.success) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    alert(result.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Register error:', error);
                alert('Registration failed. Please try again.');
            }
        });
    }
    
    // Load dashboard data if on dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboardData();
    }
});

// Load dashboard data
async function loadDashboardData() {
    try {
        const stats = await analyticsAPI.getDashboardStats();
        updateDashboardStats(stats);
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Load mock data if API fails
        loadMockDashboardData();
    }
}

// Update dashboard with real data
function updateDashboardStats(stats) {
    // Update stat cards with real data
    const statCards = document.querySelectorAll('.stat-number');
    if (statCards.length >= 4) {
        statCards[0].textContent = stats.totalViews || '125,432';
        statCards[1].textContent = stats.subscribers || '8,234';
        statCards[2].textContent = stats.avgWatchTime || '4:32';
        statCards[3].textContent = stats.revenue || '$2,456';
    }
}

// Load mock dashboard data for demo
function loadMockDashboardData() {
    console.log('Loading mock dashboard data for demo');
    // Mock data is already in the HTML, so no changes needed
}
