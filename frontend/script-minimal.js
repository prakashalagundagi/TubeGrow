// TubeGrow - Minimal Working Script

console.log('Minimal script loaded');

// Simple direct handlers
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready - setting up minimal handlers');
    
    // Handle ALL links and buttons
    document.addEventListener('click', function(e) {
        const element = e.target.closest('a, button');
        if (!element) return;
        
        console.log('Clicked:', element.textContent, element.href);
        
        // Handle navigation links
        if (element.href && element.href !== '#' && element.href !== window.location.href) {
            console.log('Navigating to:', element.href);
            e.preventDefault();
            window.location.href = element.href;
            return;
        }
        
        // Handle buttons with onclick
        const onclick = element.getAttribute('onclick');
        if (onclick) {
            console.log('Executing onclick:', onclick);
            e.preventDefault();
            
            // Simple modal functions
            if (onclick.includes('startKeywordTool')) {
                const modal = document.getElementById('keywordModal');
                if (modal) modal.style.display = 'block';
            } else if (onclick.includes('startOptimizerTool')) {
                const modal = document.getElementById('optimizerModal');
                if (modal) modal.style.display = 'block';
            } else if (onclick.includes('startCompetitorTool')) {
                const modal = document.getElementById('competitorModal');
                if (modal) modal.style.display = 'block';
            } else if (onclick.includes('startThumbnailTool')) {
                const modal = document.getElementById('thumbnailModal');
                if (modal) modal.style.display = 'block';
            } else if (onclick.includes('closeModal')) {
                const modalId = onclick.match(/'([^']+)'/);
                if (modalId) {
                    const modal = document.getElementById(modalId[1]);
                    if (modal) modal.style.display = 'none';
                }
            }
        }
    });
    
    // Handle forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            const isLogin = window.location.pathname.includes('login.html');
            const isRegister = window.location.pathname.includes('register.html');
            
            if (isLogin) {
                console.log('Handling login');
                const email = document.getElementById('email')?.value;
                const password = document.getElementById('password')?.value;
                
                if (email && password) {
                    alert('Login successful! Redirecting...');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    alert('Please fill in all fields');
                }
            } else if (isRegister) {
                console.log('Handling register');
                const name = document.getElementById('name')?.value;
                const email = document.getElementById('email')?.value;
                const password = document.getElementById('password')?.value;
                
                if (name && email && password) {
                    alert('Registration successful! Redirecting to login...');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                } else {
                    alert('Please fill in all fields');
                }
            }
        });
    });
    
    // Close modals on background click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Close modals on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => modal.style.display = 'none');
        }
    });
    
    // Navigation active state
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        }
    });
    
    console.log('Minimal setup complete');
});

// Simple test functions
window.testAll = function() {
    console.log('Testing all functionality');
    const buttons = document.querySelectorAll('a, button');
    console.log('Found elements:', buttons.length);
    buttons.forEach((btn, i) => {
        console.log(`${i}: ${btn.textContent} -> ${btn.href}`);
    });
};
