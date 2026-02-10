/**
 * ============================================
 * POPUP FUNCTIONALITY - popup.js
 * Crevate Technologies
 * Version: 2.0.0
 * ============================================
 */

(function() {
    'use strict';

    /* ==========================================
       CONFIGURATION
       ========================================== */
    const POPUP_CONFIG = {
        // Web3Forms API Key (Get from web3forms.com - FREE)
        web3formsKey: 'a869c4b9-2650-401b-90fa-6173b7c5ea83',
        
        // Timing
        welcomePopupDelay: 3000, // 3 seconds
        
        // Storage keys
        storageKeys: {
            welcomeShown: 'crevate_welcome_popup',
            consultShown: 'crevate_consult_popup'
        },
        
        // WhatsApp number (with country code, no + or spaces)
        whatsappNumber: '917839333200',
        
        // Company email for fallback
        companyEmail: 'crevatetechnologies@gmail.com'
    };

    /* ==========================================
       UTILITY FUNCTIONS
       ========================================== */
    const PopupUtils = {
        $(selector) {
            return document.querySelector(selector);
        },
        
        $$(selector) {
            return document.querySelectorAll(selector);
        },
        
        // Session storage
        session: {
            get(key) {
                try {
                    return sessionStorage.getItem(key);
                } catch (e) {
                    return null;
                }
            },
            set(key, value) {
                try {
                    sessionStorage.setItem(key, value);
                } catch (e) {
                    console.warn('Session storage not available');
                }
            }
        },
        
        // Format current date/time
        formatDateTime() {
            return new Intl.DateTimeFormat('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Asia/Kolkata'
            }).format(new Date());
        },
        
        // Generate lead ID
        generateLeadId() {
            return 'LEAD_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
        },
        
        // Get page info
        getPageInfo() {
            return {
                page: document.title,
                url: window.location.href,
                referrer: document.referrer || 'Direct',
                timestamp: this.formatDateTime()
            };
        }
    };

    /* ==========================================
       FORM SUBMISSION SERVICE
       ========================================== */
    const PopupFormService = {
        /**
         * Submit form data
         */
        async submit(formData, formType) {
            const leadId = PopupUtils.generateLeadId();
            const pageInfo = PopupUtils.getPageInfo();
            
            const payload = {
                ...formData,
                leadId,
                formType,
                ...pageInfo
            };
            
            console.log('📧 Submitting lead:', payload);
            
            // Try Web3Forms
            try {
                const result = await this.submitToWeb3Forms(payload);
                if (result.success) {
                    console.log('✅ Form submitted via Web3Forms');
                    this.saveLeadLocally(payload);
                    return { success: true, method: 'web3forms', leadId };
                }
            } catch (error) {
                console.warn('⚠️ Web3Forms failed:', error.message);
            }
            
            // Fallback - Save locally
            this.saveLeadLocally(payload);
            console.log('💾 Lead saved locally as fallback');
            
            return { success: true, method: 'local', leadId };
        },
        
        /**
         * Submit to Web3Forms
         */
        async submitToWeb3Forms(data) {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: POPUP_CONFIG.web3formsKey,
                    subject: `🔔 New Lead: ${data.formType} - ${data.name}`,
                    from_name: 'Crevate Website',
                    to: POPUP_CONFIG.companyEmail,
                    // Form data
                    'Lead ID': data.leadId,
                    'Name': data.name,
                    'Email': data.email,
                    'Phone': data.phone,
                    'Service': data.service || 'Not specified',
                    'Message': data.message || 'N/A',
                    // Meta
                    'Form Type': data.formType,
                    'Page': data.page,
                    'URL': data.url,
                    'Referrer': data.referrer,
                    'Submitted At': data.timestamp
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Submission failed');
            }
            
            return result;
        },
        
        /**
         * Save lead locally (backup)
         */
        saveLeadLocally(data) {
            try {
                const leads = JSON.parse(localStorage.getItem('crevate_popup_leads') || '[]');
                leads.push({
                    ...data,
                    savedAt: new Date().toISOString()
                });
                
                // Keep last 30 leads
                if (leads.length > 30) leads.shift();
                
                localStorage.setItem('crevate_popup_leads', JSON.stringify(leads));
            } catch (e) {
                console.warn('Could not save lead locally');
            }
        },
        
        /**
         * Get local leads (for admin)
         */
        getLocalLeads() {
            try {
                return JSON.parse(localStorage.getItem('crevate_popup_leads') || '[]');
            } catch (e) {
                return [];
            }
        }
    };

    /* ==========================================
       WELCOME POPUP
       ========================================== */
    const WelcomePopup = {
        overlay: null,
        popup: null,
        form: null,
        content: null,
        success: null,
        
        init() {
            this.overlay = PopupUtils.$('#welcomePopup');
            if (!this.overlay) return;
            
            this.popup = this.overlay.querySelector('.welcome-popup');
            this.form = PopupUtils.$('#welcomePopupForm');
            this.content = PopupUtils.$('#welcomePopupContent');
            this.success = PopupUtils.$('#welcomePopupSuccess');
            
            this.bindEvents();
            this.scheduleShow();
        },
        
        bindEvents() {
            // Close button
            PopupUtils.$('#welcomePopupClose')?.addEventListener('click', () => this.close());
            
            // Skip button
            PopupUtils.$('#welcomePopupSkip')?.addEventListener('click', () => this.close());
            
            // Success close button
            PopupUtils.$('#welcomeSuccessClose')?.addEventListener('click', () => this.close());
            
            // Overlay click
            this.overlay?.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });
            
            // Form submit
            this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.overlay?.classList.contains('active')) {
                    this.close();
                }
            });
        },
        
        scheduleShow() {
            // Check if already shown this session
            if (PopupUtils.session.get(POPUP_CONFIG.storageKeys.welcomeShown)) {
                return;
            }
            
            setTimeout(() => this.show(), POPUP_CONFIG.welcomePopupDelay);
        },
        
        show() {
            if (!this.overlay) return;
            this.overlay.classList.add('active');
            document.body.classList.add('popup-open');
        },
        
        close() {
            if (!this.overlay) return;
            this.overlay.classList.remove('active');
            document.body.classList.remove('popup-open');
            PopupUtils.session.set(POPUP_CONFIG.storageKeys.welcomeShown, 'true');
            
            // Reset after animation
            setTimeout(() => {
                if (this.content) this.content.classList.remove('hide');
                if (this.success) this.success.classList.remove('show');
            }, 350);
        },
        
        async handleSubmit(e) {
            e.preventDefault();
            
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnSpinner = submitBtn.querySelector('.btn-spinner');
            
            // Validate
            if (!this.validate(form)) return;
            
            // Get data
            const formData = new FormData(form);
            const data = {
                name: formData.get('name')?.trim(),
                email: formData.get('email')?.trim(),
                phone: formData.get('phone')?.trim(),
                service: formData.get('service') || ''
            };
            
            // Loading state
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            if (btnText) btnText.textContent = 'Sending...';
            
            try {
                const result = await PopupFormService.submit(data, 'Welcome Popup');
                
                // Success
                if (this.content) this.content.classList.add('hide');
                if (this.success) this.success.classList.add('show');
                form.reset();
                
                console.log('✅ Welcome popup submitted:', result.leadId);
                
            } catch (error) {
                console.error('Form error:', error);
                alert('Something went wrong. Please try again or contact us directly.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                if (btnText) btnText.textContent = 'Get Free Quote Now';
            }
        },
        
        validate(form) {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                input.classList.remove('error');
                const value = input.value.trim();
                
                if (!value) {
                    input.classList.add('error');
                    isValid = false;
                    return;
                }
                
                // Email validation
                if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        input.classList.add('error');
                        isValid = false;
                    }
                }
                
                // Phone validation
                if (input.type === 'tel') {
                    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
                    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                        input.classList.add('error');
                        isValid = false;
                    }
                }
            });
            
            return isValid;
        }
    };

    /* ==========================================
       CONSULTATION POPUP (Free Quote Button)
       ========================================== */
    const ConsultPopup = {
        overlay: null,
        popup: null,
        form: null,
        content: null,
        success: null,
        
        init() {
            this.overlay = PopupUtils.$('#consultPopup');
            if (!this.overlay) return;
            
            this.popup = this.overlay.querySelector('.popup');
            this.form = PopupUtils.$('#popupForm');
            this.content = PopupUtils.$('#popupContent');
            this.success = PopupUtils.$('#popupSuccess');
            
            this.bindEvents();
        },
        
        bindEvents() {
            // Trigger button (Free Quote)
            PopupUtils.$('#freeQuoteBtn')?.addEventListener('click', () => this.open());
            
            // Close buttons
            PopupUtils.$('#popupClose')?.addEventListener('click', () => this.close());
            PopupUtils.$('#popupSkip')?.addEventListener('click', () => this.close());
            PopupUtils.$('#popupSuccessClose')?.addEventListener('click', () => this.close());
            
            // Overlay click
            this.overlay?.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });
            
            // Form submit
            this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.overlay?.classList.contains('active')) {
                    this.close();
                }
            });
        },
        
        open() {
            if (!this.overlay) return;
            this.overlay.classList.add('active');
            document.body.classList.add('popup-open');
        },
        
        close() {
            if (!this.overlay) return;
            this.overlay.classList.remove('active');
            document.body.classList.remove('popup-open');
            
            // Reset after animation
            setTimeout(() => {
                if (this.content) this.content.classList.remove('hide');
                if (this.success) this.success.classList.remove('show');
            }, 350);
        },
        
        async handleSubmit(e) {
            e.preventDefault();
            
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Validate
            if (!this.validate(form)) return;
            
            // Get data
            const formData = new FormData(form);
            const data = {
                name: formData.get('name')?.trim(),
                email: formData.get('email')?.trim(),
                phone: formData.get('phone')?.trim(),
                service: formData.get('service') || ''
            };
            
            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-spinner"></span> Sending...';
            
            try {
                const result = await PopupFormService.submit(data, 'Free Quote Popup');
                
                // Success
                if (this.content) this.content.classList.add('hide');
                if (this.success) this.success.classList.add('show');
                form.reset();
                
                console.log('✅ Consult popup submitted:', result.leadId);
                
            } catch (error) {
                console.error('Form error:', error);
                alert('Something went wrong. Please try again or contact us directly.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        },
        
        validate(form) {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                input.classList.remove('error');
                const value = input.value.trim();
                
                if (!value) {
                    input.classList.add('error');
                    isValid = false;
                    return;
                }
                
                if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        input.classList.add('error');
                        isValid = false;
                    }
                }
                
                if (input.type === 'tel') {
                    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
                    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                        input.classList.add('error');
                        isValid = false;
                    }
                }
            });
            
            return isValid;
        }
    };

    /* ==========================================
       REAL-TIME INPUT VALIDATION
       ========================================== */
    const InputValidation = {
        init() {
            const inputs = PopupUtils.$$('.popup-form input, .welcome-popup-form input');
            
            inputs.forEach(input => {
                // Remove error on input
                input.addEventListener('input', () => {
                    input.classList.remove('error');
                });
                
                // Validate on blur
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        },
        
        validateField(input) {
            const value = input.value.trim();
            
            if (input.required && !value) {
                input.classList.add('error');
                return false;
            }
            
            if (input.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    input.classList.add('error');
                    return false;
                }
            }
            
            if (input.type === 'tel' && value) {
                const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
                if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                    input.classList.add('error');
                    return false;
                }
            }
            
            input.classList.remove('error');
            return true;
        }
    };

    /* ==========================================
       ADMIN HELPER (View Local Leads)
       ========================================== */
    const PopupAdmin = {
        init() {
            // Keyboard shortcut: Ctrl + Shift + P
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                    e.preventDefault();
                    this.showLeads();
                }
            });
        },
        
        showLeads() {
            const leads = PopupFormService.getLocalLeads();
            
            if (leads.length === 0) {
                console.log('📭 No popup leads saved locally');
                return;
            }
            
            console.log('📋 Popup Leads (' + leads.length + '):');
            console.table(leads.map(l => ({
                ID: l.leadId,
                Name: l.name,
                Email: l.email,
                Phone: l.phone,
                Service: l.service,
                Form: l.formType,
                Time: l.timestamp
            })));
        }
    };

    /* ==========================================
       INITIALIZE
       ========================================== */
    function init() {
        WelcomePopup.init();
        ConsultPopup.init();
        InputValidation.init();
        PopupAdmin.init();
        
        console.log('✅ Popup system initialized');
        console.log('💡 Press Ctrl+Shift+P to view local popup leads');
    }

    // Run when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for debugging
    window.CrevatePopups = {
        WelcomePopup,
        ConsultPopup,
        FormService: PopupFormService
    };

})();