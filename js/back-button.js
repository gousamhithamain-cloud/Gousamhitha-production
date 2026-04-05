// Universal Back Button Functionality
class BackButton {
    constructor() {
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.createBackButton();
            });
        } else {
            this.createBackButton();
        }
    }
    
    createBackButton() {
        // Don't show back button on homepage
        if (this.isHomePage()) {
            return;
        }
        
        // Remove existing back button if any
        const existingButton = document.querySelector('.back-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Create back button element
        const backButton = document.createElement('button');
        backButton.className = 'back-button show';
        backButton.setAttribute('aria-label', 'Back to Home');
        backButton.setAttribute('title', 'Back to Home');
        
        // Add click event listener
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.goToHome();
        });
        
        // Add keyboard support
        backButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.goToHome();
            }
        });
        
        // Insert into document
        document.body.appendChild(backButton);
        
        // Add smooth entrance animation
        setTimeout(() => {
            backButton.classList.add('show');
        }, 100);
    }
    
    isHomePage() {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop();
        
        // Check if we're on homepage
        return (
            currentPath === '/' ||
            currentFile === '' ||
            currentFile === 'index.html' ||
            currentPath.endsWith('/index.html')
        );
    }
    
    goToHome() {
        // Add loading state
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.style.opacity = '0.6';
            backButton.style.pointerEvents = 'none';
        }
        
        // Navigate to home with smooth transition
        this.navigateToHome();
    }
    
    navigateToHome() {
        // Determine home URL based on current location
        const currentPath = window.location.pathname;
        let homeUrl = 'index.html';
        
        // If we're in a subdirectory, adjust the path
        if (currentPath.includes('/')) {
            const pathParts = currentPath.split('/');
            pathParts.pop(); // Remove current file
            const basePath = pathParts.join('/');
            homeUrl = basePath + (basePath.endsWith('/') ? '' : '/') + 'index.html';
        }
        
        // Navigate to home
        window.location.href = homeUrl;
    }
    
    // Method to manually show/hide back button
    show() {
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.style.display = 'flex';
            backButton.classList.add('show');
        }
    }
    
    hide() {
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.style.display = 'none';
            backButton.classList.remove('show');
        }
    }
    
    // Method to change back button style
    setStyle(style) {
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            // Remove existing style classes
            backButton.classList.remove('arrow-style', 'home-style');
            
            // Add new style class
            if (style === 'arrow') {
                backButton.classList.add('arrow-style');
            } else if (style === 'home') {
                backButton.classList.add('home-style');
            }
        }
    }
}

// Initialize back button globally
window.backButton = new BackButton();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackButton;
}