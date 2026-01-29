/**
 * ========================================
 * CREVATE TECHNOLOGIES - MAIN JAVASCRIPT
 * Modern, Creative & Professional Website
 * ========================================
 */

'use strict';

// ==================== DOM ELEMENTS ====================
const DOM = {
    // Preloader
    preloader: document.getElementById('preloader'),
    
    // Header & Navigation
    header: document.getElementById('header'),
    navMenu: document.getElementById('navMenu'),
    navLinks: document.querySelectorAll('.nav-link'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    
    // Hero
    heroStats: document.querySelectorAll('.stat-number'),
    particles: document.getElementById('particles'),
    
    // Offers Slider
    offersSlider: document.getElementById('offersSlider'),
    sliderPrev: document.getElementById('sliderPrev'),
    sliderNext: document.getElementById('sliderNext'),
    sliderDots: document.getElementById('sliderDots'),
    
    // Portfolio
    filterBtns: document.querySelectorAll('.filter-btn'),
    portfolioItems: document.querySelectorAll('.portfolio-item'),
    
    // Contact Form
    contactForm: document.getElementById('contactForm'),
    
    // Back to Top
    backToTop: document.getElementById('backToTop'),
    
    // Sections for scroll spy
    sections: document.querySelectorAll('section[id]')
};

// ==================== UTILITY FUNCTIONS ====================
const utils = {
    // Debounce function
    debounce(func, wait = 100) {
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
    
    // Throttle function
    throttle(func, limit = 100) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Get scroll position
    getScrollPosition() {
        return window.pageYOffset || document.documentElement.scrollTop;
    },
    
    // Smooth scroll to element
    scrollTo(target, offset = 80) {
        const element = document.querySelector(target);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    },
    
    // Animate counter
    animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        const updateCounter = () => {
            start += increment;
            if (start < target) {
                element.textContent = Math.ceil(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    },
    
    // Create particles
    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 20000);
    }
};

// ==================== PRELOADER ====================
const preloader = {
    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                DOM.preloader.classList.add('loaded');
                document.body.style.overflow = 'visible';
                
                // Initialize AOS after preloader
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        duration: 800,
                        easing: 'ease-out-cubic',
                        once: true,
                        offset: 50,
                        disable: 'mobile'
                    });
                }
                
                // Start hero animations
                this.startHeroAnimations();
            }, 500);
        });
    },
    
    startHeroAnimations() {
        // Animate stats counters
        DOM.heroStats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            if (target) {
                utils.animateCounter(stat, target);
            }
        });
        
        // Create particles
        if (DOM.particles) {
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    utils.createParticle(DOM.particles);
                }, i * 200);
            }
            
            // Continue creating particles
            setInterval(() => {
                utils.createParticle(DOM.particles);
            }, 500);
        }
    }
};

// ==================== HEADER & NAVIGATION ====================
const navigation = {
    init() {
        this.handleScroll();
        this.handleMobileMenu();
        this.handleNavLinks();
        this.handleScrollSpy();
    },
    
    handleScroll() {
        const scrollHandler = utils.throttle(() => {
            const scrollPosition = utils.getScrollPosition();
            
            // Header background
            if (scrollPosition > 100) {
                DOM.header.classList.add('scrolled');
            } else {
                DOM.header.classList.remove('scrolled');
            }
            
            // Back to top button
            if (scrollPosition > 500) {
                DOM.backToTop.classList.add('visible');
            } else {
                DOM.backToTop.classList.remove('visible');
            }
        }, 100);
        
        window.addEventListener('scroll', scrollHandler);
    },
    
    handleMobileMenu() {
        if (DOM.mobileMenuBtn) {
            DOM.mobileMenuBtn.addEventListener('click', () => {
                DOM.mobileMenuBtn.classList.toggle('active');
                DOM.navMenu.classList.toggle('active');
                document.body.style.overflow = DOM.navMenu.classList.contains('active') ? 'hidden' : '';
            });
        }
    },
    
    handleNavLinks() {
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                
                // Close mobile menu
                DOM.mobileMenuBtn?.classList.remove('active');
                DOM.navMenu?.classList.remove('active');
                document.body.style.overflow = '';
                
                // Smooth scroll
                utils.scrollTo(target);
                
                // Update active state
                this.setActiveLink(link);
            });
        });
    },
    
    handleScrollSpy() {
        const scrollSpyHandler = utils.throttle(() => {
            const scrollPosition = utils.getScrollPosition() + 150;
            
            DOM.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    DOM.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, 100);
        
        window.addEventListener('scroll', scrollSpyHandler);
    },
    
    setActiveLink(activeLink) {
        DOM.navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }
};

// ==================== OFFERS SLIDER ====================
const offersSlider = {
    currentSlide: 0,
    slidesPerView: 3,
    totalSlides: 0,
    slideWidth: 0,
    autoplayInterval: null,
    
    init() {
        if (!DOM.offersSlider) return;
        
        this.calculateSlides();
        this.createDots();
        this.bindEvents();
        this.startAutoplay();
        
        // Recalculate on resize
        window.addEventListener('resize', utils.debounce(() => {
            this.calculateSlides();
            this.goToSlide(0);
        }, 250));
    },
    
    calculateSlides() {
        const cards = DOM.offersSlider.querySelectorAll('.offer-card');
        this.totalSlides = cards.length;
        
        // Responsive slides per view
        if (window.innerWidth <= 576) {
            this.slidesPerView = 1;
        } else if (window.innerWidth <= 992) {
            this.slidesPerView = 2;
        } else {
            this.slidesPerView = 3;
        }
        
        this.slideWidth = cards[0]?.offsetWidth + 24 || 344; // card width + gap
    },
    
    createDots() {
        if (!DOM.sliderDots) return;
        
        DOM.sliderDots.innerHTML = '';
        const dotsCount = Math.ceil(this.totalSlides / this.slidesPerView);
        
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(i));
            DOM.sliderDots.appendChild(dot);
        }
    },
    
    bindEvents() {
        DOM.sliderPrev?.addEventListener('click', () => this.prevSlide());
        DOM.sliderNext?.addEventListener('click', () => this.nextSlide());
        
        // Touch events for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        DOM.offersSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            this.stopAutoplay();
        }, { passive: true });
        
        DOM.offersSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
            this.startAutoplay();
        }, { passive: true });
        
        // Pause on hover
        DOM.offersSlider.addEventListener('mouseenter', () => this.stopAutoplay());
        DOM.offersSlider.addEventListener('mouseleave', () => this.startAutoplay());
    },
    
    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    },
    
    goToSlide(index) {
        const maxIndex = Math.ceil(this.totalSlides / this.slidesPerView) - 1;
        this.currentSlide = Math.max(0, Math.min(index, maxIndex));
        
        const offset = this.currentSlide * this.slideWidth * this.slidesPerView;
        DOM.offersSlider.scrollTo({
            left: offset,
            behavior: 'smooth'
        });
        
        this.updateDots();
    },
    
    nextSlide() {
        const maxIndex = Math.ceil(this.totalSlides / this.slidesPerView) - 1;
        if (this.currentSlide < maxIndex) {
            this.goToSlide(this.currentSlide + 1);
        } else {
            this.goToSlide(0);
        }
    },
    
    prevSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        } else {
            const maxIndex = Math.ceil(this.totalSlides / this.slidesPerView) - 1;
            this.goToSlide(maxIndex);
        }
    },
    
    updateDots() {
        const dots = DOM.sliderDots?.querySelectorAll('.slider-dot');
        dots?.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    },
    
    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    },
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
};

// ==================== PORTFOLIO FILTER ====================
const portfolioFilter = {
    init() {
        if (!DOM.filterBtns.length) return;
        
        DOM.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filterItems(filter);
                this.setActiveFilter(btn);
            });
        });
    },
    
    filterItems(filter) {
        DOM.portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                item.classList.remove('hidden');
                item.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                item.classList.add('hidden');
            }
        });
    },
    
    setActiveFilter(activeBtn) {
        DOM.filterBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }
};

// ==================== CONTACT FORM ====================

const contactForm = {
    init() {
        if (!DOM.contactForm) return;
        
        DOM.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = DOM.contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    },
    
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(DOM.contactForm);
        const data = Object.fromEntries(formData);
        
        // Validate all fields
        let isValid = true;
        const inputs = DOM.contactForm.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showToast('error', 'Validation Error', 'Please fill all required fields correctly.');
            return;
        }
        
        // Show loading state
        const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            // Show success message
            this.showSuccess();
            
            // Reset form
            DOM.contactForm.reset();
            
            // Show toast
            this.showToast('success', 'Message Sent!', 'We\'ll get back to you within 24 hours.');
        }, 2000);
    },
    
   // ==================== CONTACT FORM (UPDATED) ====================
    /*
const contactForm = {
    init() {
        if (!DOM.contactForm) return;
        
        DOM.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = DOM.contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            service: document.getElementById('service').value,
            message: document.getElementById('message').value.trim()
        };
        
        // Validate all fields
        let isValid = true;
        const inputs = DOM.contactForm.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showToast('error', 'Validation Error', 'Please fill all required fields correctly.');
            return;
        }
        
        // Show loading state
        const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Use FormHandler for submission
            const result = await window.FormHandler.submit(formData, 'Contact Form');
            
            if (result.success) {
                this.showSuccess();
                DOM.contactForm.reset();
                this.showToast('success', 'Message Sent!', 'We\'ll get back to you within 24 hours.');
            } else {
                this.showToast('error', 'Submission Failed', result.message);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showToast('error', 'Error', 'Something went wrong. Please try again.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    },
*/
    validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const name = input.name;
        let isValid = true;
        let errorMessage = '';
        
        // Required check
        if (input.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        // Name validation (minimum 2 characters)
        if (name === 'name' && value && value.length < 2) {
            isValid = false;
            errorMessage = 'Name must be at least 2 characters';
        }
        
        // Message validation (minimum 10 characters)
        if (name === 'message' && value && value.length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters';
        }
        
        // Show/hide error
        const formGroup = input.closest('.form-group');
        if (!isValid) {
            formGroup.classList.add('error');
            formGroup.classList.remove('success');
            this.showError(formGroup, errorMessage);
        } else if (value) {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
            this.removeError(formGroup);
        }
        
        return isValid;
    },
    
    showError(formGroup, message) {
        this.removeError(formGroup);
        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        formGroup.appendChild(errorEl);
    },
    
    removeError(formGroup) {
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    },
    
    clearError(input) {
        const formGroup = input.closest('.form-group');
        if (input.value.trim()) {
            formGroup.classList.remove('error');
            this.removeError(formGroup);
        }
    },
    
    showSuccess() {
        const formContainer = document.querySelector('.contact-form-container');
        const originalContent = formContainer.innerHTML;
        
        formContainer.innerHTML = `
            <div class="form-success">
                <div class="form-success-icon">
                    <i class="fas fa-check"></i>
                </div>
                <h3>Thank You!</h3>
                <p>Your message has been sent successfully. We'll get back to you soon!</p>
            </div>
        `;
        
        // Restore form after 5 seconds
        setTimeout(() => {
            formContainer.innerHTML = originalContent;
            this.init(); // Re-initialize form
        }, 5000);
    },
    
    showToast(type, title, message) {
        // Create toast container if not exists
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            </div>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeToast(toast);
        }, 5000);
    },
    
    removeToast(toast) {
        toast.classList.add('exit');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
};

// ==================== BACK TO TOP ====================
const backToTop = {
    init() {
        if (!DOM.backToTop) return;
        
        DOM.backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
};

// ==================== SMOOTH SCROLL FOR ALL ANCHOR LINKS ====================
const smoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if it's just "#" or if it's a nav link (already handled)
                if (href === '#' || this.classList.contains('nav-link')) return;
                
                e.preventDefault();
                utils.scrollTo(href);
            });
        });
    }
};

// ==================== LAZY LOADING IMAGES ====================
const lazyLoad = {
    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
};

// ==================== TYPING EFFECT (Optional for Hero) ====================
const typingEffect = {
    init(element, texts, speed = 100, delay = 2000) {
        if (!element) return;
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const type = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                element.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                element.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = speed;
            
            if (isDeleting) {
                typeSpeed /= 2;
            }
            
            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = delay;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
            }
            
            setTimeout(type, typeSpeed);
        };
        
        type();
    }
};

// ==================== PARALLAX EFFECT (Optional) ====================
const parallax = {
    init() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (!parallaxElements.length) return;
        
        window.addEventListener('scroll', utils.throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.5;
                const offset = scrolled * speed;
                el.style.transform = `translateY(${offset}px)`;
            });
        }, 16));
    }
};

// ==================== CURSOR EFFECT (Optional) ====================
const customCursor = {
    init() {
        // Only enable on desktop
        if (window.innerWidth <= 1024) return;
        
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-outline"></div>';
        document.body.appendChild(cursor);
        
        const dot = cursor.querySelector('.cursor-dot');
        const outline = cursor.querySelector('.cursor-outline');
        
        let cursorX = 0, cursorY = 0;
        let outlineX = 0, outlineY = 0;
        
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            dot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        });
        
        // Smooth outline follow
        const animateOutline = () => {
            outlineX += (cursorX - outlineX) * 0.15;
            outlineY += (cursorY - outlineY) * 0.15;
            outline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
            requestAnimationFrame(animateOutline);
        };
        animateOutline();
        
        // Hover effects
        const interactiveElements = document.querySelectorAll('a, button, .service-card, .portfolio-item');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        });
    }
};

// ==================== INITIALIZE ALL MODULES ====================
document.addEventListener('DOMContentLoaded', () => {
    // Core modules
    preloader.init();
    navigation.init();
    offersSlider.init();
    portfolioFilter.init();
    contactForm.init();
    backToTop.init();
    smoothScroll.init();
    lazyLoad.init();
    
    // Optional modules (uncomment to enable)
    // parallax.init();
    // customCursor.init();
    
    console.log('🚀 Crevate Technologies website initialized successfully!');
});

// ==================== SERVICE WORKER REGISTRATION (Optional) ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

// ==================== EXPORT FOR MODULE USE ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        utils,
        navigation,
        offersSlider,
        portfolioFilter,
        contactForm
    };
}

// WhatsApp Widget Toggle
document.getElementById('waToggle')?.addEventListener('click', function() {
    document.getElementById('whatsappWidget').classList.toggle('active');
});

// Close when clicking outside
document.addEventListener('click', function(e) {
    const widget = document.getElementById('whatsappWidget');
    if (widget && !widget.contains(e.target)) {
        widget.classList.remove('active');
    }
});