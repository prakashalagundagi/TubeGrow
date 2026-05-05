// Scalable TubeGrow JavaScript Architecture
// Performance Optimized and Modular

// Global Configuration
const TUBEGROW_CONFIG = {
    api: {
        baseUrl: 'http://localhost:5001',
        timeout: 10000,
        retries: 3
    },
    performance: {
        enableMonitoring: false,
        enableLazyLoading: true,
        enableCaching: true
    },
    ui: {
        enableAnimations: true,
        enableTransitions: true,
        theme: 'light'
    }
};

// Performance Monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            renderTime: 0,
            apiCalls: 0,
            errors: 0
        };
        this.startTime = performance.now();
    }

    start() {
        if (!TUBEGROW_CONFIG.performance.enableMonitoring) return;
        
        // Monitor page load
        window.addEventListener('load', () => {
            this.metrics.pageLoadTime = performance.now() - this.startTime;
            this.logMetrics();
        });

        // Monitor API calls
        this.interceptFetch();

        // Monitor errors
        window.addEventListener('error', (e) => {
            this.metrics.errors++;
            this.logError(e);
        });
    }

    interceptFetch() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            this.metrics.apiCalls++;
            const start = performance.now();
            
            try {
                const response = await originalFetch(...args);
                const duration = performance.now() - start;
                this.logApiCall(args[0], response.status, duration);
                return response;
            } catch (error) {
                this.logError(error);
                throw error;
            }
        };
    }

    logMetrics() {
        console.log('🚀 TubeGrow Performance Metrics:', this.metrics);
    }

    logApiCall(url, status, duration) {
        if (duration > 1000) {
            console.warn(`⚠️ Slow API call: ${url} (${duration.toFixed(2)}ms)`);
        }
    }

    logError(error) {
        console.error('❌ TubeGrow Error:', error);
    }
}

// Module System
class ModuleManager {
    constructor() {
        this.modules = new Map();
        this.loaded = new Set();
    }

    register(name, module) {
        this.modules.set(name, module);
    }

    async load(name) {
        if (this.loaded.has(name)) return this.modules.get(name);
        
        const module = this.modules.get(name);
        if (module && typeof module.init === 'function') {
            await module.init();
            this.loaded.add(name);
        }
        
        return module;
    }

    async loadAll() {
        for (const [name, module] of this.modules) {
            await this.load(name);
        }
    }
}

// API Service - Scalable
class ApiService {
    constructor() {
        this.baseURL = TUBEGROW_CONFIG.api.baseUrl;
        this.cache = new Map();
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const cacheKey = `${url}_${JSON.stringify(options)}`;

        // Check cache
        if (TUBEGROW_CONFIG.performance.enableCaching && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(url, {
                timeout: TUBEGROW_CONFIG.api.timeout,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache response
            if (TUBEGROW_CONFIG.performance.enableCaching) {
                this.cache.set(cacheKey, data);
                setTimeout(() => this.cache.delete(cacheKey), 300000); // 5 minutes
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(userData) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Analytics endpoints
    async getChannelStats() {
        return this.request('/api/analytics/channel');
    }

    async getVideoStats(videoId) {
        return this.request(`/api/analytics/video/${videoId}`);
    }

    // Tools endpoints
    async researchKeywords(keyword) {
        return this.request('/api/tools/keywords', {
            method: 'POST',
            body: JSON.stringify({ keyword })
        });
    }

    async optimizeVideo(videoData) {
        return this.request('/api/tools/optimize', {
            method: 'POST',
            body: JSON.stringify(videoData)
        });
    }
}

// UI Components - Scalable
class ComponentManager {
    constructor() {
        this.components = new Map();
        this.observers = new Map();
    }

    register(selector, component) {
        this.components.set(selector, component);
    }

    init() {
        this.components.forEach((component, selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                component.init(element);
            });
        });
    }

    // Lazy loading for components
    observe(selector, callback) {
        if (!this.observers.has(selector)) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        callback(entry.target);
                    }
                });
            });

            this.observers.set(selector, observer);
        }

        document.querySelectorAll(selector).forEach(element => {
            this.observers.get(selector).observe(element);
        });
    }
}

// Navigation Module
const NavigationModule = {
    init() {
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupActiveStates();
    },

    setupMobileMenu() {
        const menuButton = document.querySelector('.mobile-menu-button');
        const menu = document.querySelector('.nav-menu');
        
        if (menuButton && menu) {
            menuButton.addEventListener('click', () => {
                menu.classList.toggle('active');
                menuButton.classList.toggle('active');
            });
        }
    },

    setupScrollEffects() {
        let lastScroll = 0;
        const header = document.querySelector('.header');
        
        if (!header) return;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    },

    setupActiveStates() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }
};

// Analytics Module
const AnalyticsModule = {
    init() {
        this.setupCharts();
        this.setupMetrics();
        this.setupRealTimeUpdates();
    },

    setupCharts() {
        // Initialize charts with performance optimizations
        const chartElements = document.querySelectorAll('[data-chart]');
        
        chartElements.forEach(element => {
            this.createChart(element);
        });
    },

    createChart(element) {
        const type = element.dataset.chart;
        const data = JSON.parse(element.dataset.chartData || '{}');
        
        // Use requestAnimationFrame for smooth animations
        requestAnimationFrame(() => {
            this.renderChart(element, type, data);
        });
    },

    renderChart(element, type, data) {
        // Optimized chart rendering
        const canvas = document.createElement('canvas');
        element.appendChild(canvas);
        
        // Simple chart implementation (replace with charting library)
        this.drawSimpleChart(canvas, type, data);
    },

    drawSimpleChart(canvas, type, data) {
        const ctx = canvas.getContext('2d');
        // Basic chart drawing logic
        ctx.fillStyle = '#2563eb';
        // ... chart implementation
    },

    setupMetrics() {
        // Setup metric cards with animations
        const metricCards = document.querySelectorAll('.metric-card');
        
        metricCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'fadeInUp 0.5s ease';
            }, index * 100);
        });
    },

    setupRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            this.updateMetrics();
        }, 30000); // Update every 30 seconds
    },

    updateMetrics() {
        // Update metrics with smooth transitions
        const metrics = document.querySelectorAll('.metric-value');
        
        metrics.forEach(metric => {
            const currentValue = parseInt(metric.textContent.replace(/[^0-9]/g, ''));
            const newValue = currentValue + Math.floor(Math.random() * 10);
            
            this.animateValue(metric, currentValue, newValue, 1000);
        });
    },

    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = this.formatNumber(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
};

// Tools Module
const ToolsModule = {
    init() {
        this.setupModals();
        this.setupForms();
        this.setupLazyLoading();
    },

    setupModals() {
        const modalTriggers = document.querySelectorAll('[data-modal]');
        
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modalId = trigger.dataset.modal;
                this.openModal(modalId);
            });
        });

        // Close modals
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    },

    setupForms() {
        const forms = document.querySelectorAll('.tool-form');
        
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleFormSubmit(form);
            });
        });
    },

    async handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            // Show loading state
            this.showLoading(form);
            
            // API call
            const result = await window.tubegrow.api.request(form.dataset.endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            // Show results
            this.showResults(form, result);
            
        } catch (error) {
            this.showError(form, error);
        } finally {
            this.hideLoading(form);
        }
    },

    showLoading(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }
    },

    hideLoading(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    },

    showResults(form, results) {
        const resultsContainer = form.querySelector('.results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.formatResults(results);
            resultsContainer.style.display = 'block';
        }
    },

    showError(form, error) {
        const errorContainer = form.querySelector('.error-container');
        if (errorContainer) {
            errorContainer.textContent = error.message;
            errorContainer.style.display = 'block';
        }
    },

    formatResults(results) {
        return `<div class="results">${JSON.stringify(results, null, 2)}</div>`;
    },

    setupLazyLoading() {
        if (!TUBEGROW_CONFIG.performance.enableLazyLoading) return;
        
        const lazyElements = document.querySelectorAll('.lazy');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyElements.forEach(img => imageObserver.observe(img));
        }
    }
};

// Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('tubegrow-theme') || 'light';
        this.applyTheme(this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('tubegrow-theme', theme);
    }

    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }
}

// Main Application
class TubeGrowApp {
    constructor() {
        this.performanceMonitor = new PerformanceMonitor();
        this.moduleManager = new ModuleManager();
        this.componentManager = new ComponentManager();
        this.apiService = new ApiService();
        this.themeManager = new ThemeManager();
    }

    async init() {
        // Start performance monitoring
        this.performanceMonitor.start();

        // Register modules
        this.moduleManager.register('navigation', NavigationModule);
        this.moduleManager.register('analytics', AnalyticsModule);
        this.moduleManager.register('tools', ToolsModule);

        // Initialize global API service
        window.tubegrow = {
            api: this.apiService,
            theme: this.themeManager,
            config: TUBEGROW_CONFIG
        };

        // Load all modules
        await this.moduleManager.loadAll();

        // Initialize components
        this.componentManager.init();

        // Setup service worker for PWA
        this.setupServiceWorker();

        console.log('🚀 TubeGrow App Initialized');
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered');
                })
                .catch(error => {
                    console.log('❌ Service Worker registration failed:', error);
                });
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new TubeGrowApp();
    app.init();
});

// Export for external use
window.TubeGrowApp = TubeGrowApp;
window.TUBEGROW_CONFIG = TUBEGROW_CONFIG;
