/**
 * ========================================
 * POPUP / MODAL HANDLER
 * Welcome popup with quote form
 * ========================================
 */

'use strict';

// ==================== POPUP CONFIGURATION ====================
const PopupConfig = {
    // Show popup after this many seconds (0 = immediate)
    showDelay: 5,
    
    // Don't show popup again for this many days (after closing)
    dontShowForDays: 1,
    
    // Don't show popup again for this many days (after form submission)
    dontShowAfterSubmitDays: 30,
    
    // Show popup when user tries to leave (exit intent)
    enableExitIntent: true,
    
    // Show floating CTA button after scrolling this many pixels
    showFloatingCTAAfter: 500,
    
    // Cookie/Storage name
    storageName: 'crevate_popup_status'
};

// ==================== POPUP HANDLER CLASS ====================
class PopupHandler {
    constructor(config) {
        this.config = config;
        this.popup = document.getElementById('welcomePopup');
        this.closeBtn = document.getElementById('popupClose');
        this.skipBtn = document.getElementById('popupSkip');
        this.form = document.getElementById('popupQuoteForm');
        this.submitBtn = document.getElementById('popupSubmitBtn');
        this.formContent = document.getElementById('popupFormContent');
        this.successContent = document.getElementById('popupSuccess');
        this.exploreBtn = document.getElementById('popupExplore');
        this.floatingCTA = document.getElementById('floatingCTA');
        this.floatingCTABtn = document.getElementById('floatingCTABtn');
        
        this.init();
    }
    
    init() {
        // Check if popup should be shown
        if (this.shouldShowPopup()) {
            // Show popup after delay
            setTimeout(() => {
                this.showPopup();
            }, this.config.showDelay * 1000);
            
            // Exit intent detection
            if (this.config.enableExitIntent) {
                this.initExitIntent();
            }
        }
        
        // Bind events
        this.bindEvents();
        
        // Initialize floating CTA
        this.initFloatingCTA();
    }
    
    shouldShowPopup() {
        const status = this.getStorageData();
        
        if (!status) return true;
        
        const now = new Date().getTime();
        const lastAction = status.timestamp || 0;
        const daysToWait = status.submitted ? 
            this.config.dontShowAfterSubmitDays : 
            this.config.dontShowForDays;
        const waitTime = daysToWait * 24 * 60 * 60 * 1000;
        
        return (now - lastAction) > waitTime;
    }
    
    getStorageData() {
        try {
            const data = localStorage.getItem(this.config.storageName);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }
    
    setStorageData(submitted = false) {
        try {
            const data = {
                timestamp: new Date().getTime(),
                submitted: submitted
            };
            localStorage.setItem(this.config.storageName, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save popup status');
        }
    }
    
    showPopup() {
        if (this.popup) {
            this.popup.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hidePopup() {
        if (this.popup) {
            this.popup.classList.remove('active');
            document.body.style.overflow = '';
            this.setStorageData(false);
        }
    }
    
    bindEvents() {
        // Close button
        this.closeBtn?.addEventListener('click', () => this.hidePopup());
        
        // Skip button
        this.skipBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hidePopup();
        });
        
        // Click outside to close
        this.popup?.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.hidePopup();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popup?.classList.contains('active')) {
                this.hidePopup();
            }
        });
        
        // Form submission
        this.form?.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Explore button after success
        this.exploreBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hidePopup();
            const target = this.exploreBtn.getAttribute('href');
            if (target) {
                document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('popupName').value.trim(),
            phone: document.getElementById('popupPhone').value.trim(),
            email: document.getElementById('popupEmail').value.trim(),
            service: document.getElementById('popupService').value
        };
        
        // Validate
        if (!this.validateForm(formData)) {
            return;
        }
        
        // Show loading state
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;
        
        try {
            // Submit form using FormHandler
            const result = await window.FormHandler.submit(formData, 'Quote Request');
            
            if (result.success) {
                this.showSuccess();
                this.setStorageData(true);
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('Something went wrong. Please try again or contact us directly.');
        } finally {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }
    
    validateForm(formData) {
        // Name validation
        if (!formData.name || formData.name.length < 2) {
            this.showFieldError('popupName', 'Please enter your name');
            return false;
        }
        
        // Phone validation
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            this.showFieldError('popupPhone', 'Please enter a valid phone number');
            return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            this.showFieldError('popupEmail', 'Please enter a valid email address');
            return false;
        }
        
        // Service validation
        if (!formData.service) {
            this.showFieldError('popupService', 'Please select a service');
            return false;
        }
        
        return true;
    }
    
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '#ef4444';
            field.focus();
            
            // Show toast notification
            this.showToast('error', 'Validation Error', message);
            
            // Reset border after 3 seconds
            setTimeout(() => {
                field.style.borderColor = '';
            }, 3000);
        }
    }
    
    showSuccess() {
        if (this.formContent && this.successContent) {
            this.formContent.style.display = 'none';
            this.successContent.classList.add('show');
        }
    }
    
    showError(message) {
        this.showToast('error', 'Submission Failed', message);
    }
    
    showToast(type, title, message) {
        // Use existing toast system from main.js or create simple one
        if (window.contactForm && window.contactForm.showToast) {
            window.contactForm.showToast(type, title, message);
        } else {
            alert(`${title}: ${message}`);
        }
    }
    
    // Exit Intent Detection
    initExitIntent() {
        let shown = false;
        
        document.addEventListener('mouseout', (e) => {
            if (shown) return;
            if (this.popup?.classList.contains('active')) return;
            if (!this.shouldShowPopup()) return;
            
            // Check if cursor left the window from the top
            if (e.clientY < 10 && e.relatedTarget === null) {
                shown = true;
                this.showPopup();
            }
        });
    }
    
    // Floating CTA Button
    initFloatingCTA() {
        if (!this.floatingCTA || !this.floatingCTABtn) return;
        
        // Show/hide based on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > this.config.showFloatingCTAAfter) {
                this.floatingCTA.classList.add('visible');
            } else {
                this.floatingCTA.classList.remove('visible');
            }
        });
        
        // Open popup on click
        this.floatingCTABtn.addEventListener('click', () => {
            // Reset form if previously submitted
            if (this.successContent?.classList.contains('show')) {
                this.formContent.style.display = '';
                this.successContent.classList.remove('show');
                this.form?.reset();
            }
            this.showPopup();
        });
    }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    window.popupHandler = new PopupHandler(PopupConfig);
});