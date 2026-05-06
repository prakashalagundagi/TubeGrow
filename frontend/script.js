// TubeGrow - Direct Button Fix

console.log('TubeGrow script loading...');

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - fixing buttons');
    
    // Fix all button clicks immediately
    const allButtons = document.querySelectorAll('a, button');
    console.log('Found elements to fix:', allButtons.length);
    
    allButtons.forEach((element, index) => {
        console.log(`Fixing element ${index}:`, element.textContent, element.href);
        
        // Remove any existing onclick
        element.removeAttribute('onclick');
        
        // Add click event that actually works
        element.addEventListener('click', function(e) {
            console.log('Clicked:', this.textContent, this.href);
            
            // Handle navigation links
            if (this.href && this.href !== '#' && this.href !== window.location.href) {
                console.log('Navigating to:', this.href);
                window.location.href = this.href;
                return;
            }
            
            // Handle hash links
            if (this.href && this.href.includes('#')) {
                e.preventDefault();
                const targetId = this.href.split('#')[1];
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }
        });
        
        // Add hover effect
        element.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
            this.style.transform = 'translateY(-2px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Fix forms specifically
    const forms = document.querySelectorAll('form');
    console.log('Found forms:', forms.length);
    
    forms.forEach((form, index) => {
        console.log(`Fixing form ${index}:`, form.action || form.id);
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted:', this);
            
            // Handle login form
            if (this.action && this.action.includes('login')) {
                const email = this.querySelector('input[type="email"], input[name="email"]')?.value;
                const password = this.querySelector('input[type="password"]')?.value;
                
                if (email && password) {
                    console.log('Login attempt:', email);
                    alert('Login functionality would connect to backend');
                    // For demo, just redirect
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
                return;
            }
            
            // Handle register form
            if (this.action && this.action.includes('register')) {
                const name = this.querySelector('input[name="name"]')?.value;
                const email = this.querySelector('input[type="email"], input[name="email"]')?.value;
                const password = this.querySelector('input[type="password"]')?.value;
                
                if (name && email && password) {
                    console.log('Register attempt:', { name, email });
                    alert('Registration successful! Redirecting to login...');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                }
                return;
            }
        });
    });
    
    // Fix navigation active state
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        }
    });
    
    // Simple test functions
    window.testButtons = function() {
        console.log('Testing buttons...');
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach((btn, i) => {
            console.log(`Button ${i}:`, btn.textContent, btn.href);
            btn.click();
        });
    };
    
    window.testNavigation = function() {
        console.log('Testing navigation...');
        window.location.href = 'dashboard.html';
    };
    
    console.log('All buttons fixed and ready!');
});
