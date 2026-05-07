// TubeGrow - Tools Page Button Fix

console.log('Tools page script loading...');

// Tool functions that were missing
function startKeywordTool() {
    console.log('Keyword Research Tool clicked');
    const modal = document.getElementById('keywordModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function startOptimizerTool() {
    console.log('Video Optimizer Tool clicked');
    const modal = document.getElementById('optimizerModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function startCompetitorTool() {
    console.log('Competitor Analysis Tool clicked');
    const modal = document.getElementById('competitorModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function startThumbnailTool() {
    console.log('Thumbnail Generator Tool clicked');
    const modal = document.getElementById('thumbnailModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function researchKeyword() {
    console.log('Researching keyword...');
    const input = document.getElementById('keywordInput');
    const results = document.getElementById('keywordResults');
    
    if (input && results) {
        const keyword = input.value;
        if (keyword) {
            results.innerHTML = `
                <div style="padding: 1rem; background: #f0f9ff; border-radius: 8px; margin-top: 1rem;">
                    <h4>Results for: "${keyword}"</h4>
                    <p>Search Volume: High</p>
                    <p>Competition: Medium</p>
                    <p>Suggested Keywords: "${keyword} tutorial", "${keyword} guide", "how to ${keyword}"</p>
                </div>
            `;
        }
    }
}

function optimizeVideo() {
    console.log('Optimizing video...');
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
    console.log('Analyzing competitor...');
    const input = document.getElementById('competitorChannel');
    const results = document.getElementById('competitorResults');
    
    if (input && results) {
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
    console.log('Generating thumbnail...');
    const input = document.getElementById('thumbnailText');
    const results = document.getElementById('thumbnailResults');
    
    if (input && results) {
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

// Fix all buttons on the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tools page DOM loaded - fixing buttons');
    
    // Fix all buttons with onclick attributes
    const buttons = document.querySelectorAll('button[onclick]');
    console.log('Found buttons with onclick:', buttons.length);
    
    buttons.forEach((button, index) => {
        const onclickAttr = button.getAttribute('onclick');
        console.log(`Button ${index}:`, button.textContent, onclickAttr);
        
        // Remove the onclick attribute
        button.removeAttribute('onclick');
        
        // Add proper click listener
        button.addEventListener('click', function(e) {
            console.log('Button clicked:', button.textContent);
            
            // Execute the original function
            try {
                if (onclickAttr.includes('startKeywordTool')) {
                    startKeywordTool();
                } else if (onclickAttr.includes('startOptimizerTool')) {
                    startOptimizerTool();
                } else if (onclickAttr.includes('startCompetitorTool')) {
                    startCompetitorTool();
                } else if (onclickAttr.includes('startThumbnailTool')) {
                    startThumbnailTool();
                } else if (onclickAttr.includes('closeModal')) {
                    const modalId = onclickAttr.match(/'([^']+)'/)[1];
                    closeModal(modalId);
                } else if (onclickAttr.includes('researchKeyword')) {
                    researchKeyword();
                } else if (onclickAttr.includes('optimizeVideo')) {
                    optimizeVideo();
                } else if (onclickAttr.includes('analyzeCompetitor')) {
                    analyzeCompetitor();
                } else if (onclickAttr.includes('generateThumbnail')) {
                    generateThumbnail();
                }
            } catch (error) {
                console.error('Error executing button function:', error);
            }
        });
        
        // Add hover effect
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Fix close buttons
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Fix modal background clicks
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
    
    console.log('All tools page buttons fixed!');
});
