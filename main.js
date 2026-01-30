
// ============================================
// 1. CONFIGURATION
// ============================================
const CONFIG = {
  // General Settings
  app: {
    name: 'Crevate Technologies',
    version: '3.0.0',
    
    debug: true
  },

  // Animation Settings
  animation: {
    duration: 800,
    easing: 'ease-out-cubic',
    offset: 50,
    disableOnMobile: true
  },

  // Scroll Settings
  scroll: {
    headerOffset: 80,
    backToTopThreshold: 500,
    throttleLimit: 100
  },

  // Slider Settings
  slider: {
    autoplayInterval: 5000,
    swipeThreshold: 50,
    gap: 24
  },

  // Popup Settings
  popup: {
    showDelay: 5000,
    dontShowForDays: 1,
    dontShowAfterSubmitDays: 30,
    enableExitIntent: true,
    showFloatingCTAAfter: 500,
    storageName: 'crevate_popup_status'
  },

  // Form Submission Settings
  form: {
    // Primary method: 'emailjs', 'formspree', 'web3forms', 'whatsapp', 'telegram', 'googlesheets'
    primaryMethod: 'googlesheets',
    backupMethod: 'whatsapp',

    // Service Configurations
    emailjs: {
      serviceId: 'YOUR_SERVICE_ID',
      templateId: 'YOUR_TEMPLATE_ID',
      publicKey: 'YOUR_PUBLIC_KEY',
      toEmail: 'your-email@gmail.com'
    },

    formspree: {
      formId: 'YOUR_FORM_ID'
    },

    web3forms: {
      accessKey: 'YOUR_ACCESS_KEY'
    },

    whatsapp: {
      phoneNumber: '916388110321',
      enableDirectMessage: true
    },

    telegram: {
      botToken: 'YOUR_BOT_TOKEN',
      chatId: 'YOUR_CHAT_ID'
    },

    googleSheets: {
      scriptUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
    }
  },

  // Owner Details
  owner: {
    name: 'Crevate Technologies',
    email: 'crevatetechnologies@gmail.com',
    phone: '+91 6388110321'
  },

  // Particles Settings
  particles: {
    count: 30,
    createInterval: 500,
    lifetime: 20000
  }
};

// ============================================
// 2. UTILITY FUNCTIONS
// ============================================
const Utils = {
  /**
   * Debounce function - delays execution until after wait period
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function - limits execution to once per limit period
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit time in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Check if element is in viewport
   * @param {HTMLElement} element - Element to check
   * @param {number} offset - Offset from viewport edges
   * @returns {boolean} Is element in viewport
   */
  isInViewport(element, offset = 0) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= -offset &&
      rect.left >= -offset &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
  },

  /**
   * Get current scroll position
   * @returns {number} Scroll position in pixels
   */
  getScrollPosition() {
    return window.pageYOffset || document.documentElement.scrollTop;
  },

  /**
   * Smooth scroll to element
   * @param {string} target - CSS selector for target element
   * @param {number} offset - Offset from top
   */
  scrollTo(target, offset = CONFIG.scroll.headerOffset) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  },

  /**
   * Animate counter from 0 to target
   * @param {HTMLElement} element - Element to update
   * @param {number} target - Target number
   * @param {number} duration - Animation duration in ms
   */
  animateCounter(element, target, duration = 2000) {
    if (!element || isNaN(target)) return;

    const start = performance.now();
    const initialValue = 0;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(initialValue + (target - initialValue) * easeOut);

      element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(updateCounter);
  },

  /**
   * Format date to Indian locale
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date = new Date()) {
    return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  },

  /**
   * Escape HTML characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  },

  /**
   * Load external script dynamically
   * @param {string} src - Script URL
   * @returns {Promise} Resolves when script loads
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  },

  /**
   * Generate unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  generateId(prefix = 'crevate') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Check if device is mobile
   * @returns {boolean} Is mobile device
   */
  isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * Check for reduced motion preference
   * @returns {boolean} Prefers reduced motion
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Log debug messages (only in debug mode)
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (CONFIG.app.debug) {
      console.log(`[${CONFIG.app.name}]`, ...args);
    }
  },

  /**
   * Log errors
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    console.error(`[${CONFIG.app.name}]`, ...args);
  }
};

// ============================================
// 3. DOM MANAGER
// ============================================
const DOM = {
  // Cache for DOM elements
  _cache: new Map(),

  /**
   * Get element by ID with caching
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Element or null
   */
  getById(id) {
    if (!this._cache.has(id)) {
      this._cache.set(id, document.getElementById(id));
    }
    return this._cache.get(id);
  },

  /**
   * Get elements by selector
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element
   * @returns {NodeList} Elements
   */
  getAll(selector, parent = document) {
    return parent.querySelectorAll(selector);
  },

  /**
   * Get single element by selector
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element
   * @returns {HTMLElement|null} Element or null
   */
  get(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * Add event listener with delegation support
   * @param {HTMLElement|string} target - Element or selector
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  on(target, event, handler, options = {}) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.addEventListener(event, handler, options);
    }
  },

  /**
   * Remove event listener
   * @param {HTMLElement|string} target - Element or selector
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  off(target, event, handler) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.removeEventListener(event, handler);
    }
  },

  /**
   * Create element with attributes
   * @param {string} tag - Tag name
   * @param {Object} attrs - Attributes
   * @param {string|HTMLElement} content - Inner content
   * @returns {HTMLElement} Created element
   */
  create(tag, attrs = {}, content = '') {
    const element = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });

    if (typeof content === 'string') {
      element.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      element.appendChild(content);
    }

    return element;
  },

  /**
   * Clear element cache
   */
  clearCache() {
    this._cache.clear();
  },

  // Commonly used elements (lazy loaded)
  get preloader() { return this.getById('preloader'); },
  get header() { return this.getById('header'); },
  get navMenu() { return this.getById('navMenu'); },
  get mobileMenuBtn() { return this.getById('mobileMenuBtn'); },
  get offersSlider() { return this.getById('offersSlider'); },
  get sliderPrev() { return this.getById('sliderPrev'); },
  get sliderNext() { return this.getById('sliderNext'); },
  get sliderDots() { return this.getById('sliderDots'); },
  get contactForm() { return this.getById('contactForm'); },
  get backToTop() { return this.getById('backToTop'); },
  get particles() { return this.getById('particles'); },
  get welcomePopup() { return this.getById('welcomePopup'); },
  get popupClose() { return this.getById('popupClose'); },
  get popupForm() { return this.getById('popupQuoteForm'); },
  get popupFormContent() { return this.getById('popupFormContent'); },
  get popupSuccess() { return this.getById('popupSuccess'); },
  get popupSkip() { return this.getById('popupSkip'); },
  get popupSubmitBtn() { return this.getById('popupSubmitBtn'); },
  get popupExplore() { return this.getById('popupExplore'); },
  get floatingCTA() { return this.getById('floatingCTA'); },
  get floatingCTABtn() { return this.getById('floatingCTABtn'); },
  get whatsappWidget() { return this.getById('whatsappWidget'); },
  get waToggle() { return this.getById('waToggle'); }
};

// ============================================
// 4. PRELOADER MODULE
// ============================================
const Preloader = {
  _initialized: false,

  init() {
    if (this._initialized || !DOM.preloader) return;
    this._initialized = true;

    // Hide preloader when page loads
    if (document.readyState === 'complete') {
      this.hide();
    } else {
      window.addEventListener('load', () => this.hide());
    }

    // Fallback: hide after 5 seconds max
    setTimeout(() => this.hide(), 5000);
  },

  hide() {
    if (!DOM.preloader) return;

    setTimeout(() => {
      DOM.preloader.classList.add('loaded');
      document.body.style.overflow = '';

      // Initialize AOS after preloader
      this.initAOS();

      // Start hero animations
      this.startHeroAnimations();

      Utils.log('Preloader hidden');
    }, 500);
  },

  initAOS() {
    if (typeof AOS !== 'undefined' && !Utils.prefersReducedMotion()) {
      AOS.init({
        duration: CONFIG.animation.duration,
        easing: CONFIG.animation.easing,
        once: true,
        offset: CONFIG.animation.offset,
        disable: CONFIG.animation.disableOnMobile ? 'mobile' : false
      });
    }
  },

  startHeroAnimations() {
    // Animate stat counters
    DOM.getAll('.stat-number[data-count]').forEach((stat) => {
      const target = parseInt(stat.getAttribute('data-count'), 10);
      if (!isNaN(target)) {
        // Use Intersection Observer for better performance
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                Utils.animateCounter(stat, target);
                observer.unobserve(stat);
              }
            });
          },
          { threshold: 0.5 }
        );
        observer.observe(stat);
      }
    });

    // Initialize particles
    Particles.init();
  }
};

// ============================================
// 5. NAVIGATION MODULE
// ============================================
const Navigation = {
  _initialized: false,
  _isMenuOpen: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    this.bindScrollHandler();
    this.bindMobileMenu();
    this.bindNavLinks();
    this.bindScrollSpy();

    Utils.log('Navigation initialized');
  },

  bindScrollHandler() {
    const scrollHandler = Utils.throttle(() => {
      const scrollPosition = Utils.getScrollPosition();

      // Toggle header scrolled state
      if (DOM.header) {
        DOM.header.classList.toggle('scrolled', scrollPosition > 100);
      }

      // Toggle back to top button
      if (DOM.backToTop) {
        DOM.backToTop.classList.toggle('visible', scrollPosition > CONFIG.scroll.backToTopThreshold);
      }

      // Toggle floating CTA
      if (DOM.floatingCTA) {
        DOM.floatingCTA.classList.toggle('visible', scrollPosition > CONFIG.popup.showFloatingCTAAfter);
      }
    }, CONFIG.scroll.throttleLimit);

    window.addEventListener('scroll', scrollHandler, { passive: true });
  },

  bindMobileMenu() {
    if (!DOM.mobileMenuBtn || !DOM.navMenu) return;

    DOM.mobileMenuBtn.addEventListener('click', () => this.toggleMenu());

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isMenuOpen) {
        this.closeMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this._isMenuOpen && !DOM.navMenu.contains(e.target) && !DOM.mobileMenuBtn.contains(e.target)) {
        this.closeMenu();
      }
    });
  },

  toggleMenu() {
    this._isMenuOpen = !this._isMenuOpen;
    DOM.mobileMenuBtn?.classList.toggle('active', this._isMenuOpen);
    DOM.navMenu?.classList.toggle('active', this._isMenuOpen);
    DOM.mobileMenuBtn?.setAttribute('aria-expanded', this._isMenuOpen);
    document.body.style.overflow = this._isMenuOpen ? 'hidden' : '';
    document.body.classList.toggle('menu-open', this._isMenuOpen);
  },

  closeMenu() {
    this._isMenuOpen = false;
    DOM.mobileMenuBtn?.classList.remove('active');
    DOM.navMenu?.classList.remove('active');
    DOM.mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
  },

  bindNavLinks() {
    DOM.getAll('.nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');

        this.closeMenu();
        Utils.scrollTo(target);
        this.setActiveLink(link);
      });
    });
  },

  bindScrollSpy() {
    const sections = DOM.getAll('section[id]');
    const navLinks = DOM.getAll('.nav-link');

    const scrollSpyHandler = Utils.throttle(() => {
      const scrollPosition = Utils.getScrollPosition() + 150;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
          });
        }
      });
    }, CONFIG.scroll.throttleLimit);

    window.addEventListener('scroll', scrollSpyHandler, { passive: true });
  },

  setActiveLink(activeLink) {
    DOM.getAll('.nav-link').forEach((link) => link.classList.remove('active'));
    activeLink.classList.add('active');
  }
};

// ============================================
// 6. SCROLL EFFECTS MODULE
// ============================================
const ScrollEffects = {
  _initialized: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    this.bindBackToTop();
    this.bindSmoothScroll();

    Utils.log('Scroll effects initialized');
  },

  bindBackToTop() {
    if (!DOM.backToTop) return;

    DOM.backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  bindSmoothScroll() {
    DOM.getAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Skip if just "#" or already handled by nav
        if (href === '#' || this.classList.contains('nav-link')) return;

        e.preventDefault();
        Utils.scrollTo(href);
      });
    });
  }
};

// ============================================
// 7. OFFERS SLIDER MODULE
// ============================================
const OffersSlider = {
  _initialized: false,
  currentSlide: 0,
  slidesPerView: 3,
  totalSlides: 0,
  slideWidth: 0,
  autoplayInterval: null,

  init() {
    if (this._initialized || !DOM.offersSlider) return;
    this._initialized = true;

    this.calculateSlides();
    this.createDots();
    this.bindEvents();
    this.startAutoplay();

    // Recalculate on resize
    window.addEventListener('resize', Utils.debounce(() => {
      this.calculateSlides();
      this.goToSlide(0);
      this.createDots();
    }, 250));

    Utils.log('Offers slider initialized');
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

    this.slideWidth = (cards[0]?.offsetWidth || 320) + CONFIG.slider.gap;
  },

  createDots() {
    if (!DOM.sliderDots) return;

    DOM.sliderDots.innerHTML = '';
    const dotsCount = Math.ceil(this.totalSlides / this.slidesPerView);

    for (let i = 0; i < dotsCount; i++) {
      const dot = DOM.create('button', {
        className: `dot ${i === 0 ? 'active' : ''}`,
        'aria-label': `Go to slide ${i + 1}`,
        'aria-selected': i === 0 ? 'true' : 'false',
        role: 'tab',
        onClick: () => this.goToSlide(i)
      });
      DOM.sliderDots.appendChild(dot);
    }
  },

  bindEvents() {
    // Navigation buttons
    DOM.sliderPrev?.addEventListener('click', () => this.prevSlide());
    DOM.sliderNext?.addEventListener('click', () => this.nextSlide());

    // Touch events
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

    // Keyboard navigation
    DOM.offersSlider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
  },

  handleSwipe(startX, endX) {
    const diff = startX - endX;

    if (Math.abs(diff) > CONFIG.slider.swipeThreshold) {
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
    DOM.offersSlider.scrollTo({ left: offset, behavior: 'smooth' });

    this.updateDots();
  },

  nextSlide() {
    const maxIndex = Math.ceil(this.totalSlides / this.slidesPerView) - 1;
    this.goToSlide(this.currentSlide < maxIndex ? this.currentSlide + 1 : 0);
  },

  prevSlide() {
    const maxIndex = Math.ceil(this.totalSlides / this.slidesPerView) - 1;
    this.goToSlide(this.currentSlide > 0 ? this.currentSlide - 1 : maxIndex);
  },

  updateDots() {
    DOM.sliderDots?.querySelectorAll('.dot').forEach((dot, index) => {
      const isActive = index === this.currentSlide;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  },

  startAutoplay() {
    this.stopAutoplay();
    if (!Utils.prefersReducedMotion()) {
      this.autoplayInterval = setInterval(() => this.nextSlide(), CONFIG.slider.autoplayInterval);
    }
  },

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
};

// ============================================
// 8. PORTFOLIO FILTER MODULE
// ============================================
const PortfolioFilter = {
  _initialized: false,

  init() {
    const filterBtns = DOM.getAll('.filter-btn');
    if (this._initialized || !filterBtns.length) return;
    this._initialized = true;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        this.filterItems(filter);
        this.setActiveFilter(btn);
      });
    });

    Utils.log('Portfolio filter initialized');
  },

  filterItems(filter) {
    DOM.getAll('.portfolio-item').forEach((item) => {
      const category = item.getAttribute('data-category');
      const shouldShow = filter === 'all' || category === filter;

      item.classList.toggle('hidden', !shouldShow);
      item.style.display = shouldShow ? '' : 'none';

      if (shouldShow) {
        item.style.animation = 'fadeInUp 0.5s ease forwards';
      }
    });

    // Refresh AOS
    if (typeof AOS !== 'undefined') {
      setTimeout(() => AOS.refresh(), 100);
    }
  },

  setActiveFilter(activeBtn) {
    DOM.getAll('.filter-btn').forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-pressed', 'true');
  }
};

// ============================================
// 9. FORM HANDLER MODULE (Multi-channel)
// ============================================
const FormHandler = {
  /**
   * Submit form data via configured method
   * @param {Object} formData - Form data object
   * @param {string} formType - Type of form (contact, quote, etc.)
   * @returns {Promise<Object>} Submission result
   */
  async submit(formData, formType = 'contact') {
    const result = {
      success: false,
      message: '',
      method: CONFIG.form.primaryMethod
    };

    try {
      // Submit via primary method
      await this.submitViaMethod(CONFIG.form.primaryMethod, formData, formType);
      result.success = true;
      result.message = 'Form submitted successfully!';

      // Submit via backup method
      if (CONFIG.form.backupMethod && CONFIG.form.backupMethod !== CONFIG.form.primaryMethod) {
        try {
          await this.submitViaMethod(CONFIG.form.backupMethod, formData, formType);
        } catch (backupError) {
          Utils.log('Backup submission failed:', backupError);
        }
      }
    } catch (error) {
      Utils.error('Form submission error:', error);
      result.success = false;
      result.message = error.message || 'Something went wrong. Please try again.';
    }

    return result;
  },

  /**
   * Route to appropriate submission method
   */
  async submitViaMethod(method, formData, formType) {
    switch (method) {
      case 'emailjs':
        return await this.submitEmailJS(formData, formType);
      case 'formspree':
        return await this.submitFormspree(formData);
      case 'web3forms':
        return await this.submitWeb3Forms(formData, formType);
      case 'whatsapp':
        return this.submitWhatsApp(formData, formType);
      case 'telegram':
        return await this.submitTelegram(formData, formType);
      case 'googlesheets':
        return await this.submitGoogleSheets(formData, formType);
      default:
        throw new Error(`Invalid submission method: ${method}`);
    }
  },

  // EmailJS Submission
  async submitEmailJS(formData, formType) {
    if (typeof emailjs === 'undefined') {
      await Utils.loadScript('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js');
      emailjs.init(CONFIG.form.emailjs.publicKey);
    }

    const templateParams = {
      to_email: CONFIG.form.emailjs.toEmail,
      from_name: formData.name,
      from_email: formData.email,
      from_phone: formData.phone,
      service: formData.service || 'Not specified',
      message: formData.message || 'No message provided',
      form_type: formType,
      submission_date: Utils.formatDate()
    };

    const response = await emailjs.send(
      CONFIG.form.emailjs.serviceId,
      CONFIG.form.emailjs.templateId,
      templateParams
    );

    if (response.status !== 200) {
      throw new Error('EmailJS submission failed');
    }

    return response;
  },

  // Formspree Submission
  async submitFormspree(formData) {
    const response = await fetch(`https://formspree.io/f/${CONFIG.form.formspree.formId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Formspree submission failed');
    }

    return await response.json();
  },

  // Web3Forms Submission
  async submitWeb3Forms(formData, formType) {
    const payload = {
      access_key: CONFIG.form.web3forms.accessKey,
      subject: `New ${formType} Form Submission - ${CONFIG.owner.name}`,
      from_name: CONFIG.owner.name,
      ...formData,
      submission_date: Utils.formatDate()
    };

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Web3Forms submission failed');
    }

    return result;
  },

  // WhatsApp Submission
  submitWhatsApp(formData, formType) {
    if (!CONFIG.form.whatsapp.enableDirectMessage) return { success: true };

    const message = this.formatWhatsAppMessage(formData, formType);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.form.whatsapp.phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    return { success: true, method: 'whatsapp' };
  },

  formatWhatsAppMessage(formData, formType) {
    const divider = '━━━━━━━━━━━━━━━';
    let message = `🔔 *New ${formType.toUpperCase()} Form Submission*\n`;
    message += `${divider}\n\n`;
    message += `👤 *Name:* ${formData.name}\n`;
    message += `📱 *Phone:* ${formData.phone}\n`;
    message += `📧 *Email:* ${formData.email}\n`;

    if (formData.service) {
      message += `💼 *Service:* ${formData.service}\n`;
    }

    if (formData.message) {
      message += `\n💬 *Message:*\n${formData.message}\n`;
    }

    message += `\n${divider}\n`;
    message += `📅 *Date:* ${Utils.formatDate()}\n`;
    message += `🌐 *Source:* Website Form`;

    return message;
  },

  // Telegram Submission
  async submitTelegram(formData, formType) {
    const message = this.formatTelegramMessage(formData, formType);

    const response = await fetch(
      `https://api.telegram.org/bot${CONFIG.form.telegram.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CONFIG.form.telegram.chatId,
          text: message,
          parse_mode: 'HTML'
        })
      }
    );

    const result = await response.json();

    if (!result.ok) {
      throw new Error('Telegram submission failed');
    }

    return result;
  },

  formatTelegramMessage(formData, formType) {
    let message = `🔔 <b>New ${formType.toUpperCase()} Form Submission</b>\n`;
    message += `━━━━━━━━━━━━━━━\n\n`;
    message += `👤 <b>Name:</b> ${Utils.escapeHtml(formData.name)}\n`;
    message += `📱 <b>Phone:</b> ${Utils.escapeHtml(formData.phone)}\n`;
    message += `📧 <b>Email:</b> ${Utils.escapeHtml(formData.email)}\n`;

    if (formData.service) {
      message += `💼 <b>Service:</b> ${Utils.escapeHtml(formData.service)}\n`;
    }

    if (formData.message) {
      message += `\n💬 <b>Message:</b>\n${Utils.escapeHtml(formData.message)}\n`;
    }

    message += `\n━━━━━━━━━━━━━━━\n`;
    message += `📅 <b>Date:</b> ${Utils.formatDate()}\n`;
    message += `🌐 <b>Source:</b> Website Form`;

    return message;
  },

  // Google Sheets Submission
  async submitGoogleSheets(formData, formType) {
    const payload = {
      ...formData,
      formType,
      timestamp: new Date().toISOString(),
      submissionDate: Utils.formatDate()
    };

    try {
      await fetch(CONFIG.form.googleSheets.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return { success: true, method: 'googlesheets' };
    } catch (error) {
      // no-cors mode may not return proper response
      return { success: true, method: 'googlesheets' };
    }
  }
};

// ============================================
// 10. CONTACT FORM MODULE
// ============================================
const ContactForm = {
  _initialized: false,

  init() {
    if (this._initialized || !DOM.contactForm) return;
    this._initialized = true;

    DOM.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));

    // Real-time validation
    DOM.getAll('input, textarea, select', DOM.contactForm).forEach((input) => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });

    Utils.log('Contact form initialized');
  },

  async handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Validate all fields
    let isValid = true;
    DOM.getAll('input[required], textarea[required]', form).forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      Toast.show('error', 'Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    // Get form data
    const formData = {
      name: form.querySelector('#name')?.value.trim(),
      phone: form.querySelector('#phone')?.value.trim(),
      email: form.querySelector('#email')?.value.trim(),
      service: form.querySelector('#service')?.value,
      message: form.querySelector('#message')?.value.trim()
    };

    // Show loading state
    submitBtn?.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const result = await FormHandler.submit(formData, 'Contact Form');

      if (result.success) {
        this.showSuccess();
        form.reset();
        this.clearAllValidation(form);
        Toast.show('success', 'Message Sent!', "We'll get back to you within 24 hours.");
      } else {
        Toast.show('error', 'Submission Failed', result.message);
      }
    } catch (error) {
      Utils.error('Contact form error:', error);
      Toast.show('error', 'Error', 'Something went wrong. Please try again.');
    } finally {
      submitBtn?.classList.remove('loading');
      submitBtn.disabled = false;
    }
  },

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

    // Name validation
    if (name === 'name' && value && value.length < 2) {
      isValid = false;
      errorMessage = 'Name must be at least 2 characters';
    }

    // Message validation
    if (name === 'message' && value && value.length < 10) {
      isValid = false;
      errorMessage = 'Message must be at least 10 characters';
    }

    // Update UI
    const formGroup = input.closest('.form-group');
    if (formGroup) {
      formGroup.classList.toggle('error', !isValid);
      formGroup.classList.toggle('success', isValid && value);

      if (!isValid) {
        this.showFieldError(formGroup, errorMessage);
      } else {
        this.removeFieldError(formGroup);
      }
    }

    return isValid;
  },

  showFieldError(formGroup, message) {
    this.removeFieldError(formGroup);
    const errorEl = DOM.create('span', { className: 'error-message' }, message);
    formGroup.appendChild(errorEl);
  },

  removeFieldError(formGroup) {
    const existingError = formGroup.querySelector('.error-message');
    existingError?.remove();
  },

  clearError(input) {
    const formGroup = input.closest('.form-group');
    if (formGroup && input.value.trim()) {
      formGroup.classList.remove('error');
      this.removeFieldError(formGroup);
    }
  },

  clearAllValidation(form) {
    DOM.getAll('.form-group', form).forEach((group) => {
      group.classList.remove('error', 'success');
      this.removeFieldError(group);
    });
  },

  showSuccess() {
    const formContainer = DOM.get('.contact-form-container');
    if (!formContainer) return;

    const originalContent = formContainer.innerHTML;

    formContainer.innerHTML = `
      <div class="form-success" style="text-align: center; padding: 60px 20px;">
        <div class="form-success-icon" style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.2)); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-check" style="font-size: 2rem; color: #10B981;"></i>
        </div>
        <h3 style="font-size: 1.5rem; margin-bottom: 10px; color: #1F2937;">Thank You!</h3>
        <p style="color: #6B7280;">Your message has been sent successfully. We'll get back to you soon!</p>
      </div>
    `;

    // Restore form after 5 seconds
    setTimeout(() => {
      formContainer.innerHTML = originalContent;
      this.init(); // Re-initialize form
    }, 5000);
  }
};

// ============================================
// 11. POPUP HANDLER MODULE
// ============================================
const PopupHandler = {
  _initialized: false,
  _hasShown: false,

  init() {
    if (this._initialized || !DOM.welcomePopup) return;
    this._initialized = true;

    // Check if popup should be shown
    if (this.shouldShowPopup()) {
      // Show popup after delay
      setTimeout(() => {
        if (!this._hasShown) {
          this.show();
        }
      }, CONFIG.popup.showDelay);

      // Exit intent detection (desktop only)
      if (CONFIG.popup.enableExitIntent && !Utils.isMobile()) {
        this.initExitIntent();
      }
    }

    this.bindEvents();
    this.initFloatingCTA();

    Utils.log('Popup handler initialized');
  },

  shouldShowPopup() {
    const status = this.getStorageData();
    if (!status) return true;

    const now = Date.now();
    const lastAction = status.timestamp || 0;
    const daysToWait = status.submitted
      ? CONFIG.popup.dontShowAfterSubmitDays
      : CONFIG.popup.dontShowForDays;
    const waitTime = daysToWait * 24 * 60 * 60 * 1000;

    return now - lastAction > waitTime;
  },

  getStorageData() {
    try {
      const data = localStorage.getItem(CONFIG.popup.storageName);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setStorageData(submitted = false) {
    try {
      localStorage.setItem(
        CONFIG.popup.storageName,
        JSON.stringify({
          timestamp: Date.now(),
          submitted
        })
      );
    } catch (e) {
      Utils.log('Could not save popup status');
    }
  },

  show() {
    if (!DOM.welcomePopup) return;
    this._hasShown = true;

    // Reset form state
    if (DOM.popupFormContent) DOM.popupFormContent.style.display = '';
    if (DOM.popupSuccess) DOM.popupSuccess.classList.remove('show');
    DOM.popupForm?.reset();

    DOM.welcomePopup.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first input
    setTimeout(() => {
      DOM.get('input:not([type="hidden"])', DOM.welcomePopup)?.focus();
    }, 300);

    Utils.log('Popup shown');
  },

  hide() {
    if (!DOM.welcomePopup) return;

    DOM.welcomePopup.classList.remove('active');
    document.body.style.overflow = '';
    this.setStorageData(false);

    Utils.log('Popup hidden');
  },

  bindEvents() {
    // Close button
    DOM.popupClose?.addEventListener('click', () => this.hide());

    // Skip button
    DOM.popupSkip?.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });

    // Click outside to close
    DOM.welcomePopup?.addEventListener('click', (e) => {
      if (e.target === DOM.welcomePopup) {
        this.hide();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.welcomePopup?.classList.contains('active')) {
        this.hide();
      }
    });

    // Form submission
    DOM.popupForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Explore button after success
    DOM.popupExplore?.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
      const target = DOM.popupExplore.getAttribute('href');
      if (target) Utils.scrollTo(target);
    });
  },

  async handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
      name: DOM.getById('popupName')?.value.trim(),
      phone: DOM.getById('popupPhone')?.value.trim(),
      email: DOM.getById('popupEmail')?.value.trim(),
      service: DOM.getById('popupService')?.value
    };

    // Validate
    if (!this.validateForm(formData)) return;

    // Show loading state
    if (DOM.popupSubmitBtn) {
      DOM.popupSubmitBtn.classList.add('loading');
      DOM.popupSubmitBtn.disabled = true;
    }

    try {
      const result = await FormHandler.submit(formData, 'Quote Request');

      if (result.success) {
        this.showSuccess();
        this.setStorageData(true);
      } else {
        Toast.show('error', 'Submission Failed', result.message);
      }
    } catch (error) {
      Utils.error('Popup form error:', error);
      Toast.show('error', 'Error', 'Something went wrong. Please try again.');
    } finally {
      if (DOM.popupSubmitBtn) {
        DOM.popupSubmitBtn.classList.remove('loading');
        DOM.popupSubmitBtn.disabled = false;
      }
    }
  },

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
  },

  showFieldError(fieldId, message) {
    const field = DOM.getById(fieldId);
    if (field) {
      field.style.borderColor = '#ef4444';
      field.focus();
      Toast.show('error', 'Validation Error', message);

      setTimeout(() => {
        field.style.borderColor = '';
      }, 3000);
    }
  },

  showSuccess() {
    if (DOM.popupFormContent && DOM.popupSuccess) {
      DOM.popupFormContent.style.display = 'none';
      DOM.popupSuccess.classList.add('show');
    }

    // Auto close after 5 seconds
    setTimeout(() => this.hide(), 5000);
  },

  initExitIntent() {
    let triggered = false;

    document.addEventListener('mouseout', (e) => {
      if (triggered || this._hasShown || !this.shouldShowPopup()) return;
      if (DOM.welcomePopup?.classList.contains('active')) return;

      // Check if cursor left from top of window
      if (e.clientY < 10 && e.relatedTarget === null) {
        triggered = true;
        this.show();
      }
    });
  },

  initFloatingCTA() {
    DOM.floatingCTABtn?.addEventListener('click', () => {
      // Reset form if previously submitted
      if (DOM.popupSuccess?.classList.contains('show')) {
        if (DOM.popupFormContent) DOM.popupFormContent.style.display = '';
        DOM.popupSuccess.classList.remove('show');
        DOM.popupForm?.reset();
      }
      this.show();
    });
  }
};

// ============================================
// 12. WHATSAPP WIDGET MODULE
// ============================================
const WhatsAppWidget = {
  _initialized: false,
  _isOpen: false,

  init() {
    if (this._initialized || !DOM.whatsappWidget) return;
    this._initialized = true;

    DOM.waToggle?.addEventListener('click', () => this.toggle());

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this._isOpen && !DOM.whatsappWidget.contains(e.target)) {
        this.close();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isOpen) {
        this.close();
      }
    });

    Utils.log('WhatsApp widget initialized');
  },

  toggle() {
    this._isOpen = !this._isOpen;
    DOM.whatsappWidget?.classList.toggle('active', this._isOpen);
    DOM.waToggle?.setAttribute('aria-expanded', this._isOpen);
  },

  close() {
    this._isOpen = false;
    DOM.whatsappWidget?.classList.remove('active');
    DOM.waToggle?.setAttribute('aria-expanded', 'false');
  }
};

// ============================================
// 13. TOAST NOTIFICATION MODULE
// ============================================
const Toast = {
  container: null,

  getContainer() {
    if (!this.container) {
      this.container = DOM.get('.toast-container');
      if (!this.container) {
        this.container = DOM.create('div', {
          className: 'toast-container',
          'aria-live': 'polite',
          'aria-atomic': 'true'
        });
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  },

  show(type, title, message, duration = 5000) {
    const container = this.getContainer();

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    const toast = DOM.create(
      'div',
      {
        className: `toast ${type}`,
        role: 'alert'
      },
      `
      <div class="toast-icon">
        <i class="fas ${icons[type] || icons.info}" aria-hidden="true"></i>
      </div>
      <div class="toast-content">
        <span class="toast-title">${Utils.escapeHtml(title)}</span>
        <span class="toast-message">${Utils.escapeHtml(message)}</span>
      </div>
      <button class="toast-close" aria-label="Close notification">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    `
    );

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Close button
    toast.querySelector('.toast-close')?.addEventListener('click', () => this.remove(toast));

    // Auto remove
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  },

  remove(toast) {
    toast.classList.add('exit');
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }
};

// ============================================
// 14. PARTICLES MODULE
// ============================================
const Particles = {
  _initialized: false,
  _interval: null,

  init() {
    if (this._initialized || !DOM.particles || Utils.prefersReducedMotion()) return;
    this._initialized = true;

    // Create initial particles
    for (let i = 0; i < CONFIG.particles.count; i++) {
      setTimeout(() => this.create(), i * 100);
    }

    // Continue creating particles
    this._interval = setInterval(() => this.create(), CONFIG.particles.createInterval);

    Utils.log('Particles initialized');
  },

  create() {
    if (!DOM.particles) return;

    const particle = DOM.create('div', {
      className: 'particle',
      style: `
        left: ${Math.random() * 100}%;
        animation-duration: ${Math.random() * 10 + 10}s;
        animation-delay: ${Math.random() * 5}s;
      `
    });

    DOM.particles.appendChild(particle);

    // Remove particle after lifetime
    setTimeout(() => particle.remove(), CONFIG.particles.lifetime);
  },

  destroy() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._initialized = false;
  }
};

// ============================================
// 15. LAZY LOADING MODULE
// ============================================
const LazyLoad = {
  _initialized: false,

  init() {
    if (this._initialized || !('IntersectionObserver' in window)) return;
    this._initialized = true;

    // Lazy load images
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.add('loaded');
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px 0px' }
    );

    DOM.getAll('img[data-src]').forEach((img) => imageObserver.observe(img));

    // Lazy load background images
    const bgObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.dataset.bg) {
              el.style.backgroundImage = `url(${el.dataset.bg})`;
              el.removeAttribute('data-bg');
              el.classList.add('bg-loaded');
            }
            observer.unobserve(el);
          }
        });
      },
      { rootMargin: '100px 0px' }
    );

    DOM.getAll('[data-bg]').forEach((el) => bgObserver.observe(el));

    Utils.log('Lazy loading initialized');
  }
};

// ============================================
// 16. ANALYTICS MODULE
// ============================================
const Analytics = {
  _initialized: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    this.trackOutboundLinks();
    this.trackCTAClicks();

    Utils.log('Analytics initialized');
  },

  trackEvent(eventName, eventData = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventData);
    }

    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', eventName, eventData);
    }

    Utils.log('Track event:', eventName, eventData);
  },

  trackOutboundLinks() {
    DOM.getAll('a[href^="http"]').forEach((link) => {
      if (!link.href.includes(window.location.hostname)) {
        link.addEventListener('click', () => {
          this.trackEvent('outbound_link', {
            url: link.href,
            text: link.textContent.trim()
          });
        });
      }
    });
  },

  trackCTAClicks() {
    DOM.getAll('.btn-primary, .btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.trackEvent('cta_click', {
          text: btn.textContent.trim(),
          location: btn.closest('section')?.id || 'unknown'
        });
      });
    });
  }
};

// ============================================
// 17. INITIALIZATION
// ============================================
const App = {
  init() {
    Utils.log(`Initializing ${CONFIG.app.name} v${CONFIG.app.version}`);

    // Core modules
    Preloader.init();
    Navigation.init();
    ScrollEffects.init();
    OffersSlider.init();
    PortfolioFilter.init();
    ContactForm.init();
    PopupHandler.init();
    WhatsAppWidget.init();
    LazyLoad.init();
    Analytics.init();

    // Update copyright year
    const yearEl = DOM.getById('currentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    Utils.log('🚀 Application initialized successfully!');
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// ============================================
// GLOBAL EXPORTS (Continued)
// ============================================
window.CrevateApp = {
  // Modules
  Utils,
  DOM,
  Navigation,
  OffersSlider,
  PortfolioFilter,
  ContactForm,
  FormHandler,
  PopupHandler,
  WhatsAppWidget,
  Toast,
  Analytics,

  // Config
  CONFIG,

  // Utility shortcuts
  showToast: Toast.show.bind(Toast),
  scrollTo: Utils.scrollTo,
  trackEvent: Analytics.trackEvent.bind(Analytics)
};

// Legacy support for FormHandler
window.FormHandler = FormHandler;
window.FormConfig = CONFIG.form;

// ============================================
// ERROR HANDLING
// ============================================
const ErrorHandler = {
  init() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(event.error, event.filename, event.lineno);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Promise', 0);
    });

    Utils.log('Error handler initialized');
  },

  handleError(error, source, line) {
    const errorInfo = {
      message: error?.message || String(error),
      source: source || 'Unknown',
      line: line || 0,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    Utils.error('Application Error:', errorInfo);

    // Track error in analytics
    if (Analytics._initialized) {
      Analytics.trackEvent('js_error', {
        error_message: errorInfo.message,
        error_source: errorInfo.source
      });
    }

    // Show user-friendly error message (only in production)
    if (!CONFIG.app.debug) {
      // Don't show toast for minor errors
      if (error?.message?.includes('Script error')) return;
      if (error?.message?.includes('ResizeObserver')) return;
    }
  }
};

// Initialize error handler
ErrorHandler.init();

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================
const ServiceWorkerManager = {
  init() {
    if (!('serviceWorker' in navigator)) {
      Utils.log('Service Worker not supported');
      return;
    }

    window.addEventListener('load', () => {
      this.register();
    });
  },

  async register() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      Utils.log('Service Worker registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            this.showUpdateNotification();
          }
        });
      });

    } catch (error) {
      Utils.error('Service Worker registration failed:', error);
    }
  },

  showUpdateNotification() {
    Toast.show(
      'info',
      'Update Available',
      'A new version is available. Refresh to update.',
      10000
    );
  },

  async unregister() {
    if (!('serviceWorker' in navigator)) return;

    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    Utils.log('Service Worker unregistered');
  }
};

// Initialize Service Worker (uncomment in production)
 ServiceWorkerManager.init();

// ============================================
// PERFORMANCE MONITORING
// ============================================
const PerformanceMonitor = {
  init() {
    if (!('performance' in window)) return;

    window.addEventListener('load', () => {
      // Wait for all resources to load
      setTimeout(() => this.logMetrics(), 1000);
    });
  },

  logMetrics() {
    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0];

    const metrics = {
      // Page load time
      pageLoad: timing.loadEventEnd - timing.navigationStart,
      
      // DOM Content Loaded
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      
      // First Paint (if available)
      firstPaint: this.getFirstPaint(),
      
      // Time to First Byte
      ttfb: timing.responseStart - timing.navigationStart,
      
      // DOM Interactive
      domInteractive: timing.domInteractive - timing.navigationStart
    };

    Utils.log('Performance Metrics:', metrics);

    // Track in analytics
    if (Analytics._initialized) {
      Analytics.trackEvent('performance_metrics', metrics);
    }
  },

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstPaint ? Math.round(firstPaint.startTime) : null;
  }
};

// Initialize performance monitoring
PerformanceMonitor.init();

// ============================================
// KEYBOARD NAVIGATION ENHANCEMENTS
// ============================================
const KeyboardNav = {
  init() {
    // Skip to main content
    this.initSkipLink();
    
    // Focus trap for modals
    this.initFocusTrap();
    
    // Roving tabindex for sliders/tabs
    this.initRovingTabindex();

    Utils.log('Keyboard navigation initialized');
  },

  initSkipLink() {
    const skipLink = DOM.get('.skip-link');
    if (!skipLink) return;

    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = DOM.get(skipLink.getAttribute('href'));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  },

  initFocusTrap() {
    const modals = DOM.getAll('[role="dialog"]');

    modals.forEach(modal => {
      modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;

        const focusable = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          lastEl.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          firstEl.focus();
          e.preventDefault();
        }
      });
    });
  },

  initRovingTabindex() {
    const tabGroups = DOM.getAll('[role="tablist"]');

    tabGroups.forEach(group => {
      const tabs = group.querySelectorAll('[role="tab"]');

      tabs.forEach((tab, index) => {
        tab.addEventListener('keydown', (e) => {
          let newIndex;

          switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
              newIndex = (index + 1) % tabs.length;
              break;
            case 'ArrowLeft':
            case 'ArrowUp':
              newIndex = (index - 1 + tabs.length) % tabs.length;
              break;
            case 'Home':
              newIndex = 0;
              break;
            case 'End':
              newIndex = tabs.length - 1;
              break;
            default:
              return;
          }

          e.preventDefault();
          tabs[newIndex].focus();
          tabs[newIndex].click();
        });
      });
    });
  }
};

// Initialize keyboard navigation
KeyboardNav.init();

// ============================================
// FORM ENHANCEMENTS
// ============================================
const FormEnhancements = {
  init() {
    this.autoResizeTextareas();
    this.formatPhoneInputs();
    this.preventDoubleSubmit();

    Utils.log('Form enhancements initialized');
  },

  autoResizeTextareas() {
    DOM.getAll('textarea').forEach(textarea => {
      textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 300) + 'px';
      });
    });
  },

  formatPhoneInputs() {
    DOM.getAll('input[type="tel"]').forEach(input => {
      input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Limit to 10 digits (Indian mobile)
        if (value.length > 10) {
          value = value.slice(0, 10);
        }

        // Format as: XXXXX XXXXX
        if (value.length > 5) {
          value = value.slice(0, 5) + ' ' + value.slice(5);
        }

        e.target.value = value;
      });
    });
  },

  preventDoubleSubmit() {
    DOM.getAll('form').forEach(form => {
      let isSubmitting = false;

      form.addEventListener('submit', (e) => {
        if (isSubmitting) {
          e.preventDefault();
          return;
        }

        isSubmitting = true;

        // Reset after 5 seconds (in case submission fails)
        setTimeout(() => {
          isSubmitting = false;
        }, 5000);
      });
    });
  }
};

// Initialize form enhancements
FormEnhancements.init();

// ============================================
// INTERSECTION OBSERVER ANIMATIONS
// ============================================
const ScrollAnimations = {
  init() {
    if (Utils.prefersReducedMotion()) return;

    const animatedElements = DOM.getAll('[data-animate]');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const animation = el.dataset.animate || 'fadeInUp';
            const delay = el.dataset.animateDelay || 0;

            setTimeout(() => {
              el.classList.add('animated', animation);
            }, parseInt(delay));

            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    animatedElements.forEach(el => observer.observe(el));

    Utils.log('Scroll animations initialized');
  }
};

// Initialize scroll animations
ScrollAnimations.init();

// ============================================
// COPY TO CLIPBOARD UTILITY
// ============================================
const Clipboard = {
  async copy(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      Toast.show('success', 'Copied!', 'Text copied to clipboard');
      return true;
    } catch (err) {
      Utils.error('Copy failed:', err);
      Toast.show('error', 'Copy Failed', 'Could not copy text');
      return false;
    }
  }
};

// Add to global exports
window.CrevateApp.Clipboard = Clipboard;

// ============================================
// THEME MANAGER (Optional Dark Mode)
// ============================================
const ThemeManager = {
  _storageKey: 'crevate_theme',

  init() {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem(this._storageKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (systemPrefersDark) {
      this.setTheme('dark');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this._storageKey)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });

    // Bind theme toggle button (if exists)
    const themeToggle = DOM.get('[data-theme-toggle]');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggle());
    }

    Utils.log('Theme manager initialized');
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem(this._storageKey, theme);
  },

  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    this.setTheme(currentTheme === 'light' ? 'dark' : 'light');
  },

  getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
};

// Initialize theme manager (uncomment if needed)
// ThemeManager.init();
window.CrevateApp.ThemeManager = ThemeManager;

// ============================================
// DYNAMIC STYLES INJECTION
// ============================================
const DynamicStyles = {
  inject() {
    const styles = `
      /* Particle Animation */
      @keyframes floatParticle {
        0%, 100% {
          transform: translate(0, 0) scale(1);
          opacity: 0.3;
        }
        25% {
          transform: translate(20px, -30px) scale(1.1);
          opacity: 0.6;
        }
        50% {
          transform: translate(-10px, -50px) scale(0.9);
          opacity: 0.4;
        }
        75% {
          transform: translate(15px, -20px) scale(1.05);
          opacity: 0.5;
        }
      }

      .particle {
        position: absolute;
        width: 6px;
        height: 6px;
        background: rgba(79, 70, 229, 0.4);
        border-radius: 50%;
        animation: floatParticle linear infinite;
        pointer-events: none;
      }

      /* Toast Animation */
      .toast {
        transform: translateX(120%);
        transition: transform 0.3s ease, opacity 0.3s ease;
      }

      .toast.show {
        transform: translateX(0);
      }

      .toast.exit {
        transform: translateX(120%);
        opacity: 0;
      }

      /* Form Validation States */
      .form-group.error input,
      .form-group.error select,
      .form-group.error textarea {
        border-color: #ef4444 !important;
      }

      .form-group.success input,
      .form-group.success select,
      .form-group.success textarea {
        border-color: #10b981 !important;
      }

      .error-message {
        display: block;
        font-size: 0.75rem;
        color: #ef4444;
        margin-top: 0.25rem;
      }

      /* Animation Classes */
      .animated {
        animation-duration: 0.8s;
        animation-fill-mode: both;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .fadeInUp {
        animation-name: fadeInUp;
      }

      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .fadeInDown {
        animation-name: fadeInDown;
      }

      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .fadeInLeft {
        animation-name: fadeInLeft;
      }

      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .fadeInRight {
        animation-name: fadeInRight;
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .scaleIn {
        animation-name: scaleIn;
      }

      /* Portfolio Filter Animation */
      .portfolio-item.hidden {
        display: none !important;
      }

      /* Slider Dot Active State Enhancement */
      .slider-dots .dot {
        transition: all 0.3s ease;
      }

      .slider-dots .dot.active {
        width: 30px;
        border-radius: 10px;
      }

      /* Loading Button State */
      .btn.loading,
      .popup-submit.loading {
        pointer-events: none;
        position: relative;
      }

      .btn.loading .btn-text,
      .btn.loading .btn-icon,
      .popup-submit.loading .btn-text,
      .popup-submit.loading .btn-icon {
        visibility: hidden;
        opacity: 0;
      }

      .btn.loading .btn-loader,
      .popup-submit.loading .btn-loader {
        display: flex !important;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      /* Form Success Animation */
      .form-success {
        animation: scaleIn 0.5s ease forwards;
      }

      .form-success-icon {
        animation: pulse 2s ease-in-out infinite;
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        .particle {
          display: none;
        }
      }
    `;

    // Check if styles already injected
    if (DOM.get('#crevate-dynamic-styles')) return;

    const styleSheet = DOM.create('style', {
      id: 'crevate-dynamic-styles',
      type: 'text/css'
    }, styles);

    document.head.appendChild(styleSheet);

    Utils.log('Dynamic styles injected');
  }
};

// Inject dynamic styles
DynamicStyles.inject();

// ============================================
// PRINT HANDLER
// ============================================
const PrintHandler = {
  init() {
    window.addEventListener('beforeprint', () => this.beforePrint());
    window.addEventListener('afterprint', () => this.afterPrint());
  },

  beforePrint() {
    // Expand all collapsed sections
    DOM.getAll('[data-collapsed]').forEach(el => {
      el.dataset.wasCollapsed = 'true';
      el.style.height = 'auto';
    });

    // Show all lazy-loaded images
    DOM.getAll('img[data-src]').forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });

    Utils.log('Print mode activated');
  },

  afterPrint() {
    // Restore collapsed sections
    DOM.getAll('[data-was-collapsed]').forEach(el => {
      delete el.dataset.wasCollapsed;
    });

    Utils.log('Print mode deactivated');
  }
};

// Initialize print handler
PrintHandler.init();

// ============================================
// BROWSER COMPATIBILITY CHECKS
// ============================================
const BrowserCompat = {
  check() {
    const warnings = [];

    // Check for ES6 support
    try {
      new Function('(a = 0) => a');
    } catch (e) {
      warnings.push('ES6 arrow functions not supported');
    }

    // Check for Fetch API
    if (!window.fetch) {
      warnings.push('Fetch API not supported');
    }

    // Check for IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      warnings.push('IntersectionObserver not supported');
    }

    // Check for CSS Grid
    if (!CSS.supports('display', 'grid')) {
      warnings.push('CSS Grid not supported');
    }

    // Log warnings
    if (warnings.length > 0) {
      Utils.log('Browser compatibility warnings:', warnings);
    }

    return warnings.length === 0;
  }
};

// Run compatibility check
BrowserCompat.check();

// ============================================
// FINAL INITIALIZATION LOG
// ============================================
Utils.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║   ${CONFIG.app.name}                ║
║   Version: ${CONFIG.app.version}                        ║
║   Status: Ready                           ║
║                                           ║
║   Modules Loaded:                         ║
║   ✓ Preloader                             ║
║   ✓ Navigation                            ║
║   ✓ Scroll Effects                        ║
║   ✓ Offers Slider                         ║
║   ✓ Portfolio Filter                      ║
║   ✓ Contact Form                          ║
║   ✓ Form Handler (Multi-channel)          ║
║   ✓ Popup Handler                         ║
║   ✓ WhatsApp Widget                       ║
║   ✓ Toast Notifications                   ║
║   ✓ Particles                             ║
║   ✓ Lazy Loading                          ║
║   ✓ Analytics                             ║
║   ✓ Error Handling                        ║
║   ✓ Keyboard Navigation                   ║
║   ✓ Form Enhancements                     ║
║   ✓ Scroll Animations                     ║
║                                           ║
╚═══════════════════════════════════════════╝
`);

// ============================================
// MODULE EXPORTS (For ES6 Module Support)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIG,
    Utils,
    DOM,
    Navigation,
    OffersSlider,
    PortfolioFilter,
    ContactForm,
    FormHandler,
    PopupHandler,
    WhatsAppWidget,
    Toast,
    Particles,
    LazyLoad,
    Analytics,
    ThemeManager,
    Clipboard
  };
}

// ============================================
// END OF MAIN.JS
// ============================================