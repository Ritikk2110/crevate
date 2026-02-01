/**
 * ============================================
 * CREVATE TECHNOLOGIES - Main JavaScript
 * Version: 2.1.0 (PWA Enhanced)
 * Clean, Modular, Production-Ready
 * ============================================
 */

(function() {
    'use strict';

    /* ==========================================
       CONFIGURATION
       ========================================== */
    const CONFIG = {
        // Form submission APIs
        web3formsKey: 'a869c4b9-2650-401b-90fa-6173b7c5ea83',
        emailjsServiceId: 'YOUR_EMAILJS_SERVICE_ID',
        emailjsTemplateId: 'YOUR_EMAILJS_TEMPLATE_ID',
        emailjsPublicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
        
        // Telegram Bot (optional backup)
        telegramBotToken: 'YOUR_TELEGRAM_BOT_TOKEN',
        telegramChatId: 'YOUR_TELEGRAM_CHAT_ID',
        
        // UI Settings
        scrollOffset: 80,
        animationDuration: 300,
        popupDelay: 20000,
        counterDuration: 2000,
        toastDuration: 5000,
        welcomePopupDelay: 3000,
        
        // Storage keys
        storageKeys: {
            popupShown: 'crevate_popup_shown',
            welcomeShown: 'crevate_welcome_shown',
            pwaInstallDismissed: 'crevate_pwa_dismissed',
            pwaInstalled: 'crevate_pwa_installed'
        }
    };

    /* ==========================================
       UTILITY FUNCTIONS
       ========================================== */
    const Utils = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        exists(selector) {
            return document.querySelector(selector) !== null;
        },

        $(selector) {
            return document.querySelector(selector);
        },

        $$(selector) {
            return document.querySelectorAll(selector);
        },

        scrollTo(target, offset = CONFIG.scrollOffset) {
            const element = typeof target === 'string' ? document.querySelector(target) : target;
            if (element) {
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        },

        formatDate(date = new Date()) {
            return new Intl.DateTimeFormat('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Asia/Kolkata'
            }).format(date);
        },

        generateId() {
            return 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        getPageInfo() {
            return {
                url: window.location.href,
                page: document.title,
                referrer: document.referrer || 'Direct',
                userAgent: navigator.userAgent,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                timestamp: Utils.formatDate()
            };
        },

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
                    console.warn('SessionStorage not available');
                }
            }
        },

        storage: {
            get(key) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                } catch (e) {
                    return null;
                }
            },
            set(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    console.warn('LocalStorage not available');
                }
            },
            remove(key) {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    console.warn('LocalStorage not available');
                }
            }
        },

        // Check if running as PWA
        isPWA() {
            return window.matchMedia('(display-mode: standalone)').matches ||
                   window.navigator.standalone === true ||
                   document.referrer.includes('android-app://');
        },

        // Check if mobile device
        isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        // Check if iOS
        isIOS() {
            return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        }
    };

    /* ==========================================
       TOAST NOTIFICATIONS
       ========================================== */
    const Toast = {
        container: null,

        init() {
            this.createContainer();
        },

        createContainer() {
            if (Utils.$('.toast-container')) return;
            
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        },

        show(message, type = 'info', duration = CONFIG.toastDuration) {
            if (!this.container) this.createContainer();

            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <span class="toast-icon">${icons[type]}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" aria-label="Close">×</button>
            `;

            this.container.appendChild(toast);

            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            toast.querySelector('.toast-close').addEventListener('click', () => {
                this.hide(toast);
            });

            setTimeout(() => this.hide(toast), duration);

            return toast;
        },

        hide(toast) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        },

        success(message) { return this.show(message, 'success'); },
        error(message) { return this.show(message, 'error'); },
        warning(message) { return this.show(message, 'warning'); },
        info(message) { return this.show(message, 'info'); }
    };

    /* ==========================================
       PWA INSTALLATION HANDLER
       ========================================== */
    /* ==========================================
   PWA HANDLER - Auto Update Support
   ========================================== */
const PWAInstall = {
    deferredPrompt: null,
    installButton: null,
    installBanner: null,
    isInstalled: false,
    registration: null,

    init() {
        this.isInstalled = Utils.isPWA() || Utils.storage.get(CONFIG.storageKeys.pwaInstalled);
        this.installButton = Utils.$('#pwaInstallBtn');
        this.installBanner = Utils.$('#pwaInstallBanner');
        
        this.registerServiceWorker();
        this.bindInstallEvents();
        this.listenForUpdates();
    },

    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;

        try {
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                updateViaCache: 'none' // Important: bypass HTTP cache for SW
            });
            
            console.log('✅ Service Worker registered');

            // Check for updates on page load
            this.registration.update();

            // Check for updates every 30 minutes
            setInterval(() => {
                this.registration.update();
            }, 30 * 60 * 1000);

            // Handle new SW found
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateBanner();
                    }
                });
            });

            // Auto-reload when new SW takes control
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing) return;
                refreshing = true;
                window.location.reload();
            });

        } catch (error) {
            console.error('❌ SW registration failed:', error);
        }
    },

    listenForUpdates() {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'CACHE_UPDATED') {
                console.log('📢 Cache updated to version:', event.data.version);
                // Page will auto-reload due to controllerchange event
            }
        });
    },

    showUpdateBanner() {
        // Remove existing banner if any
        Utils.$('#swUpdateBanner')?.remove();

        const banner = document.createElement('div');
        banner.id = 'swUpdateBanner';
        banner.innerHTML = `
            <div class="sw-update-banner">
                <span>🔄 New version available!</span>
                <button id="swUpdateBtn">Update Now</button>
                <button id="swDismissBtn">×</button>
            </div>
        `;
        document.body.appendChild(banner);

        // Add styles inline for simplicity
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            animation: slideUp 0.3s ease;
        `;

        const innerBanner = banner.querySelector('.sw-update-banner');
        innerBanner.style.cssText = `
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 20px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            font-family: inherit;
        `;

        Utils.$('#swUpdateBtn').style.cssText = `
            background: white;
            color: #667eea;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
        `;

        Utils.$('#swDismissBtn').style.cssText = `
            background: transparent;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0 5px;
        `;

        // Update button
        Utils.$('#swUpdateBtn').addEventListener('click', () => {
            if (this.registration?.waiting) {
                this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        });

        // Dismiss button
        Utils.$('#swDismissBtn').addEventListener('click', () => {
            banner.remove();
        });
    },

    bindInstallEvents() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallOption();
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.isInstalled = true;
            Utils.storage.set(CONFIG.storageKeys.pwaInstalled, true);
            this.hideInstallOption();
            Toast.success('App installed! 🎉');
        });

        this.installButton?.addEventListener('click', () => this.promptInstall());
        Utils.$('#bannerInstallBtn')?.addEventListener('click', () => this.promptInstall());
        Utils.$('#bannerCloseBtn')?.addEventListener('click', () => this.dismissBanner());
    },

    showInstallOption() {
        const dismissed = Utils.storage.get(CONFIG.storageKeys.pwaInstallDismissed);
        if (dismissed) {
            const days = (Date.now() - new Date(dismissed).getTime()) / (1000 * 60 * 60 * 24);
            if (days < 7) return;
        }

        this.installButton?.classList.add('visible');
        
        setTimeout(() => {
            if (this.installBanner && !this.isInstalled) {
                this.installBanner.classList.add('visible');
            }
        }, 10000);

        if (Utils.isIOS()) this.showIOSInstructions();
    },

    hideInstallOption() {
        this.installButton?.classList.remove('visible');
        this.installBanner?.classList.remove('visible');
    },

    async promptInstall() {
        if (!this.deferredPrompt) {
            if (Utils.isIOS()) {
                this.showIOSInstructions();
            } else {
                Toast.info('Install option not available');
            }
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            Toast.success('Installing...');
        }
        
        this.deferredPrompt = null;
        this.hideInstallOption();
    },

    dismissBanner() {
        this.installBanner?.classList.remove('visible');
        Utils.storage.set(CONFIG.storageKeys.pwaInstallDismissed, new Date().toISOString());
    },

    showIOSInstructions() {
        // Your existing iOS instructions code
        const modal = document.createElement('div');
        modal.className = 'ios-install-modal';
        modal.innerHTML = `
            <div class="ios-install-content">
                <button class="ios-install-close">×</button>
                <div class="ios-install-icon">📲</div>
                <h3>Install Crevate App</h3>
                <p>Install on your iPhone:</p>
                <ol>
                    <li>Tap <strong>Share</strong> ⬆️</li>
                    <li>Tap <strong>"Add to Home Screen"</strong></li>
                    <li>Tap <strong>"Add"</strong></li>
                </ol>
                <button class="btn btn-primary ios-got-it">Got it!</button>
            </div>
        `;
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('active'));

        const close = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector('.ios-install-close').onclick = close;
        modal.querySelector('.ios-got-it').onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };
    },

    initNetworkStatus() {
        const update = () => {
            if (navigator.onLine) {
                document.body.classList.remove('offline');
                if (document.body.dataset.wasOffline === 'true') {
                    Toast.success('Back online!');
                    this.registration?.update();
                }
                document.body.dataset.wasOffline = 'false';
            } else {
                document.body.classList.add('offline');
                document.body.dataset.wasOffline = 'true';
                Toast.warning('You\'re offline');
            }
        };

        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        if (!navigator.onLine) document.body.classList.add('offline');
    }
};
    /* ==========================================
       FORM SUBMISSION SERVICE
       ========================================== */
    const FormService = {
        async submit(formData, formType = 'contact') {
            const leadId = Utils.generateId();
            const pageInfo = Utils.getPageInfo();
            
            const payload = {
                ...formData,
                leadId,
                formType,
                ...pageInfo
            };

            console.log('📧 Submitting form:', payload);

            // Try Web3Forms first
            try {
                const result = await this.submitToWeb3Forms(payload);
                if (result.success) {
                    this.saveLeadLocally(payload);
                    this.sendTelegramNotification(payload);
                    return { success: true, method: 'web3forms', leadId };
                }
            } catch (error) {
                console.warn('Web3Forms failed:', error);
            }

            // Fallback to EmailJS
            try {
                const result = await this.submitToEmailJS(payload);
                if (result.success) {
                    this.saveLeadLocally(payload);
                    this.sendTelegramNotification(payload);
                    return { success: true, method: 'emailjs', leadId };
                }
            } catch (error) {
                console.warn('EmailJS failed:', error);
            }

            // Final fallback
            try {
                this.saveLeadLocally(payload);
                await this.sendTelegramNotification(payload);
                return { success: true, method: 'telegram', leadId };
            } catch (error) {
                console.error('All submission methods failed:', error);
            }

            this.saveLeadLocally(payload);
            return { success: false, method: 'local_only', leadId };
        },

        async submitToWeb3Forms(data) {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: CONFIG.web3formsKey,
                    subject: `New Lead: ${data.formType} - ${data.name}`,
                    from_name: 'Crevate Technologies Website',
                    ...data
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Web3Forms submission failed');
            }

            return result;
        },

        async submitToEmailJS(data) {
            if (!window.emailjs) {
                await this.loadEmailJS();
            }

            const result = await emailjs.send(
                CONFIG.emailjsServiceId,
                CONFIG.emailjsTemplateId,
                {
                    to_email: 'crevatetechnologies@gmail.com',
                    from_name: data.name,
                    from_email: data.email,
                    phone: data.phone,
                    service: data.service || 'Not specified',
                    message: data.message || 'Consultation request',
                    lead_id: data.leadId,
                    page_url: data.url,
                    timestamp: data.timestamp
                },
                CONFIG.emailjsPublicKey
            );

            return { success: true, result };
        },

        loadEmailJS() {
            return new Promise((resolve, reject) => {
                if (window.emailjs) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
                script.onload = () => {
                    emailjs.init(CONFIG.emailjsPublicKey);
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        },

        async sendTelegramNotification(data) {
            if (!CONFIG.telegramBotToken || !CONFIG.telegramChatId) {
                return { success: false, reason: 'Telegram not configured' };
            }

            const message = `
🔔 *New Lead Received!*

📋 *Lead ID:* ${data.leadId}
📝 *Form:* ${data.formType}

👤 *Name:* ${data.name}
📧 *Email:* ${data.email}
📱 *Phone:* ${data.phone}
🛠 *Service:* ${data.service || 'Not specified'}

💬 *Message:* ${data.message || 'N/A'}

🌐 *Page:* ${data.page}
🔗 *URL:* ${data.url}
📍 *Referrer:* ${data.referrer}
🕐 *Time:* ${data.timestamp}
            `.trim();

            const response = await fetch(`https://api.telegram.org/bot${CONFIG.telegramBotToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CONFIG.telegramChatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            return response.json();
        },

        saveLeadLocally(data) {
            const leads = Utils.storage.get('crevate_leads') || [];
            leads.push({
                ...data,
                savedAt: new Date().toISOString()
            });
            
            if (leads.length > 50) {
                leads.shift();
            }
            
            Utils.storage.set('crevate_leads', leads);
            console.log('💾 Lead saved locally:', data.leadId);
        },

        getLocalLeads() {
            return Utils.storage.get('crevate_leads') || [];
        },

        exportLeadsCSV() {
            const leads = this.getLocalLeads();
            if (leads.length === 0) {
                Toast.warning('No leads to export');
                return;
            }

            const headers = ['Lead ID', 'Name', 'Email', 'Phone', 'Service', 'Message', 'Page', 'Timestamp'];
            const rows = leads.map(lead => [
                lead.leadId,
                lead.name,
                lead.email,
                lead.phone,
                lead.service || '',
                lead.message || '',
                lead.page,
                lead.timestamp
            ]);

            const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `crevate_leads_${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            Toast.success('Leads exported successfully');
        }
    };

    /* ==========================================
       MOBILE NAVIGATION
       ========================================== */
    const Navigation = {
        header: null,
        navToggle: null,
        navMenu: null,
        isOpen: false,
        isScrolled: false,

        init() {
            this.header = Utils.$('#header');
            this.navToggle = Utils.$('#navToggle');
            this.navMenu = Utils.$('#navMenu');

            if (!this.header) return;

            this.bindEvents();
            this.handleScroll();
        },

        bindEvents() {
            window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 100));

            if (this.navToggle) {
                this.navToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggle();
                });
            }

            Utils.$$('.nav-link').forEach(link => {
                link.addEventListener('click', () => this.close());
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            document.addEventListener('click', (e) => {
                if (this.isOpen && !e.target.closest('.nav')) {
                    this.close();
                }
            });

            window.addEventListener('resize', Utils.debounce(() => {
                if (window.innerWidth > 991 && this.isOpen) {
                    this.close();
                }
            }, 200));
        },

        handleScroll() {
            const scrollY = window.scrollY;
            
            if (scrollY > 50 && !this.isScrolled) {
                this.header.classList.add('scrolled');
                this.isScrolled = true;
            } else if (scrollY <= 50 && this.isScrolled) {
                this.header.classList.remove('scrolled');
                this.isScrolled = false;
            }
        },

        toggle() {
            this.isOpen ? this.close() : this.open();
        },

        open() {
            this.navToggle?.classList.add('active');
            this.navMenu?.classList.add('active');
            document.body.classList.add('menu-open');
            this.isOpen = true;
        },

        close() {
            this.navToggle?.classList.remove('active');
            this.navMenu?.classList.remove('active');
            document.body.classList.remove('menu-open');
            this.isOpen = false;
        }
    };

    /* ==========================================
       BACK TO TOP
       ========================================== */
    const BackToTop = {
        button: null,

        init() {
            this.button = Utils.$('#backToTop');
            if (!this.button) return;

            this.bindEvents();
            this.handleScroll();
        },

        bindEvents() {
            window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 100));
            this.button.addEventListener('click', () => this.scrollToTop());
        },

        handleScroll() {
            if (window.scrollY > 400) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        },

        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    /* ==========================================
       WHATSAPP WIDGET
       ========================================== */
    const WhatsAppWidget = {
        widget: null,
        toggle: null,
        isOpen: false,

        init() {
            this.widget = Utils.$('#whatsappWidget');
            this.toggle = Utils.$('#waToggle');

            if (!this.widget || !this.toggle) return;

            this.bindEvents();
        },

        bindEvents() {
            this.toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleWidget();
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.whatsapp-widget') && this.isOpen) {
                    this.close();
                }
            });
        },

        toggleWidget() {
            this.widget.classList.toggle('active');
            this.isOpen = this.widget.classList.contains('active');
        },

        close() {
            this.widget.classList.remove('active');
            this.isOpen = false;
        }
    };

    /* ==========================================
       COUNTER ANIMATION
       ========================================== */
    const Counter = {
        init() {
            const counters = Utils.$$('[data-count]');
            if (counters.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                        this.animate(entry.target);
                        entry.target.classList.add('counted');
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));
        },

        animate(element) {
            const target = parseInt(element.getAttribute('data-count'));
            const duration = CONFIG.counterDuration;
            const step = target / (duration / 16);
            let current = 0;

            const update = () => {
                current += step;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(update);
                } else {
                    element.textContent = target;
                }
            };

            update();
        }
    };

    /* ==========================================
       SMOOTH SCROLL
       ========================================== */
    const SmoothScroll = {
        init() {
            Utils.$$('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href === '#' || href === '#!') return;

                    e.preventDefault();
                    Utils.scrollTo(href);
                });
            });
        }
    };

    /* ==========================================
       FORM HANDLER
       ========================================== */
    const FormHandler = {
        init() {
            this.bindForm('#contactForm', 'contact');
            this.bindForm('#popupForm', 'popup_consultation');
            this.bindForm('#welcomePopupForm', 'welcome_popup');
        },

        bindForm(selector, formType) {
            const form = Utils.$(selector);
            if (!form) return;

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSubmit(form, formType);
            });
        },

        async handleSubmit(form, formType) {
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            if (!this.validate(form)) {
                Toast.error('Please fill all required fields correctly');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Sending...';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const result = await FormService.submit(data, formType);

                if (result.success) {
                    Toast.success('Thank you! We\'ll contact you soon.');
                    form.reset();
                    this.showSuccess(form);
                } else {
                    Toast.warning('Saved locally. We\'ll process your request soon.');
                    form.reset();
                }
            } catch (error) {
                console.error('Form submission error:', error);
                Toast.error('Something went wrong. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        },

        validate(form) {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

            inputs.forEach(input => {
                input.classList.remove('error');
                
                if (!input.value.trim()) {
                    input.classList.add('error');
                    isValid = false;
                }

                if (input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        input.classList.add('error');
                        isValid = false;
                    }
                }

                if (input.type === 'tel' && input.value) {
                    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
                    if (!phoneRegex.test(input.value.replace(/\s/g, ''))) {
                        input.classList.add('error');
                        isValid = false;
                    }
                }
            });

            return isValid;
        },

        showSuccess(form) {
            const popup = form.closest('.popup, .welcome-popup');
            if (popup) {
                const content = popup.querySelector('.popup-content, .welcome-popup-content');
                const success = popup.querySelector('.popup-success, .welcome-popup-success');
                
                if (content && success) {
                    content.classList.add('hide');
                    success.classList.add('show');
                }
            }
        }
    };

    /* ==========================================
       WELCOME POPUP
       ========================================== */
    const WelcomePopup = {
        popup: null,
        isShown: false,

        init() {
            this.popup = Utils.$('#welcomePopup');
            if (!this.popup) return;

            this.bindEvents();
            this.scheduleShow();
        },

        bindEvents() {
            Utils.$('#welcomePopupClose')?.addEventListener('click', () => this.close());
            Utils.$('#welcomePopupSkip')?.addEventListener('click', () => this.close());
            Utils.$('#welcomeSuccessClose')?.addEventListener('click', () => this.close());

            this.popup.addEventListener('click', (e) => {
                if (e.target === this.popup) this.close();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.popup.classList.contains('active')) {
                    this.close();
                }
            });
        },

        scheduleShow() {
            if (Utils.session.get(CONFIG.storageKeys.welcomeShown)) return;

            setTimeout(() => {
                if (!this.isShown) this.show();
            }, CONFIG.welcomePopupDelay);
        },

        show() {
            this.popup.classList.add('active');
            document.body.classList.add('popup-open');
            this.isShown = true;
        },

        close() {
            this.popup.classList.remove('active');
            document.body.classList.remove('popup-open');
            Utils.session.set(CONFIG.storageKeys.welcomeShown, 'true');
            
            setTimeout(() => {
                const content = this.popup.querySelector('.welcome-popup-content');
                const success = this.popup.querySelector('.welcome-popup-success');
                if (content) content.classList.remove('hide');
                if (success) success.classList.remove('show');
            }, 300);
        }
    };

    /* ==========================================
       CONSULTATION POPUP (Free Quote)
       ========================================== */
    const ConsultPopup = {
        popup: null,

        init() {
            this.popup = Utils.$('#consultPopup');
            if (!this.popup) return;

            this.bindEvents();
        },

        bindEvents() {
            // Free quote button trigger (left side button)
            Utils.$('#freeQuoteBtn')?.addEventListener('click', () => this.open());
            
            // Any element with data-open-popup attribute
            Utils.$$('[data-open-popup="quote"]').forEach(el => {
                el.addEventListener('click', () => this.open());
            });
            
            // Close buttons
            Utils.$('#popupClose')?.addEventListener('click', () => this.close());
            Utils.$('#popupSkip')?.addEventListener('click', () => this.close());
            Utils.$('#popupSuccessClose')?.addEventListener('click', () => this.close());

            this.popup.addEventListener('click', (e) => {
                if (e.target === this.popup) this.close();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.popup.classList.contains('active')) {
                    this.close();
                }
            });
        },

        open() {
            this.popup.classList.add('active');
            document.body.classList.add('popup-open');
        },

        close() {
            this.popup.classList.remove('active');
            document.body.classList.remove('popup-open');
            
            setTimeout(() => {
                const content = this.popup.querySelector('.popup-content');
                const success = this.popup.querySelector('.popup-success');
                if (content) content.classList.remove('hide');
                if (success) success.classList.remove('show');
            }, 300);
        }
    };

    /* ==========================================
       PORTFOLIO FILTER
       ========================================== */
    const PortfolioFilter = {
        init() {
            const filterBtns = Utils.$$('.filter-btn');
            const items = Utils.$$('.portfolio-item');

            if (filterBtns.length === 0) return;

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const filter = btn.getAttribute('data-filter');
                    
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    items.forEach(item => {
                        const category = item.getAttribute('data-category');
                        
                        if (filter === 'all' || category === filter) {
                            item.style.display = '';
                            item.style.opacity = '1';
                        } else {
                            item.style.opacity = '0';
                            setTimeout(() => {
                                item.style.display = 'none';
                            }, 300);
                        }
                    });
                });
            });
        }
    };

    /* ==========================================
       OFFERS SLIDER
       ========================================== */
    const OffersSlider = {
        track: null,
        currentIndex: 0,
        autoplayInterval: null,

        init() {
            this.track = Utils.$('.offers-track');
            if (!this.track) return;

            this.cards = this.track.querySelectorAll('.offer-card');
            this.dotsContainer = Utils.$('.slider-dots');

            if (this.cards.length === 0) return;

            this.createDots();
            this.bindEvents();
            this.startAutoplay();
        },

        createDots() {
            if (!this.dotsContainer) return;

            this.cards.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = `slider-dot${i === 0 ? ' active' : ''}`;
                dot.addEventListener('click', () => this.goTo(i));
                this.dotsContainer.appendChild(dot);
            });
        },

        bindEvents() {
            Utils.$('.slider-btn.prev')?.addEventListener('click', () => this.prev());
            Utils.$('.slider-btn.next')?.addEventListener('click', () => this.next());

            this.track.addEventListener('mouseenter', () => this.stopAutoplay());
            this.track.addEventListener('mouseleave', () => this.startAutoplay());

            let startX = 0;
            this.track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            }, { passive: true });

            this.track.addEventListener('touchend', (e) => {
                const diff = startX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                    diff > 0 ? this.next() : this.prev();
                }
            }, { passive: true });
        },

        goTo(index) {
            this.currentIndex = index;
            const cardWidth = this.cards[0].offsetWidth + 16;
            this.track.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
            this.updateDots();
        },

        next() {
            this.goTo((this.currentIndex + 1) % this.cards.length);
        },

        prev() {
            this.goTo((this.currentIndex - 1 + this.cards.length) % this.cards.length);
        },

        updateDots() {
            this.dotsContainer?.querySelectorAll('.slider-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === this.currentIndex);
            });
        },

        startAutoplay() {
            this.stopAutoplay();
            this.autoplayInterval = setInterval(() => this.next(), 5000);
        },

        stopAutoplay() {
            if (this.autoplayInterval) clearInterval(this.autoplayInterval);
        }
    };

    /* ==========================================
       LAZY LOAD IMAGES
       ========================================== */
    const LazyLoad = {
        init() {
            const images = Utils.$$('img[data-src]');
            if (images.length === 0) return;

            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.getAttribute('data-src');
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    });
                }, { rootMargin: '50px' });

                images.forEach(img => observer.observe(img));
            } else {
                images.forEach(img => {
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                });
            }
        }
    };

    /* ==========================================
       ADMIN CONSOLE
       ========================================== */
    const AdminConsole = {
        init() {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                    e.preventDefault();
                    this.showLeads();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                    e.preventDefault();
                    FormService.exportLeadsCSV();
                }
            });
        },

        showLeads() {
            const leads = FormService.getLocalLeads();
            
            if (leads.length === 0) {
                console.log('📭 No leads saved locally');
                Toast.info('No leads saved locally');
                return;
            }

            console.log('📋 Local Leads:', leads);
            console.table(leads.map(l => ({
                ID: l.leadId,
                Name: l.name,
                Email: l.email,
                Phone: l.phone,
                Service: l.service,
                Time: l.timestamp
            })));

            Toast.info(`Found ${leads.length} leads. Check console (F12)`);
        }
    };

    /* ==========================================
       APPLICATION INIT
       ========================================== */
    const App = {
        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.bootstrap());
            } else {
                this.bootstrap();
            }
        },

        bootstrap() {
            // Core
            Toast.init();
            Navigation.init();
            BackToTop.init();
            WhatsAppWidget.init();
            SmoothScroll.init();
            
            // PWA
            PWAInstall.init();
            PWAInstall.initNetworkStatus();
            
            // Features
            Counter.init();
            FormHandler.init();
            WelcomePopup.init();
            ConsultPopup.init();
            PortfolioFilter.init();
            OffersSlider.init();
            LazyLoad.init();
            
            // Admin
            AdminConsole.init();

            // Logs
            console.log('✅ Crevate Technologies - All systems ready');
            console.log('📱 PWA Status:', Utils.isPWA() ? 'Running as PWA' : 'Running in browser');
            console.log('💡 Press Ctrl+Shift+L to view local leads');
            console.log('💡 Press Ctrl+Shift+E to export leads as CSV');
        }
    };

    // Start
    App.init();

    // Expose for debugging
    window.CrevateApp = {
        FormService,
        Toast,
        Utils,
        PWAInstall
    };

})();

        document.addEventListener('DOMContentLoaded', function() {
            const yearSpan = document.getElementById('currentYear');
            const currentYear = new Date().getFullYear();
            yearSpan.textContent = currentYear;
        });
    

    