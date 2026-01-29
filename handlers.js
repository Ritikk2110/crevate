/**
 * ========================================
 * FORM HANDLER - Multiple Submission Methods
 * Supports: EmailJS, Formspree, WhatsApp, 
 * Google Sheets, Telegram, Web3Forms
 * ========================================
 */

'use strict';

// ==================== CONFIGURATION ====================
const FormConfig = {
    // Choose your preferred method: 'emailjs', 'formspree', 'web3forms', 'whatsapp', 'telegram', 'googlesheets'
    primaryMethod: 'web3forms',
    
    // Backup method (optional) - sends to both
    backupMethod: 'whatsapp',
    
    // EmailJS Configuration (https://www.emailjs.com - Free: 200 emails/month)
    emailjs: {
        serviceId: 'YOUR_SERVICE_ID',        // Get from EmailJS dashboard
        templateId: 'YOUR_TEMPLATE_ID',      // Get from EmailJS dashboard
        publicKey: 'YOUR_PUBLIC_KEY',        // Get from EmailJS dashboard
        toEmail: 'your-email@gmail.com'      // Your email to receive submissions
    },
    
    // Formspree Configuration (https://formspree.io - Free: 50 submissions/month)
    formspree: {
        formId: 'YOUR_FORM_ID'              // Get from Formspree dashboard (e.g., 'xpznqwer')
    },
    
    // Web3Forms Configuration (https://web3forms.com - Free: 250 submissions/month)
    web3forms: {
        accessKey: 'YOUR_ACCESS_KEY'         // Get from Web3Forms dashboard
    },
    
    // WhatsApp Configuration
    whatsapp: {
        phoneNumber: '919876543210',         // Your WhatsApp number with country code (no + or spaces)
        enableDirectMessage: true            // Send form data as WhatsApp message
    },
    
    // Telegram Configuration (Create bot via @BotFather)
    telegram: {
        botToken: 'YOUR_BOT_TOKEN',          // Get from @BotFather
        chatId: 'YOUR_CHAT_ID'               // Your Telegram user/group ID
    },
    
    // Google Sheets Configuration (via Google Apps Script)
    googleSheets: {
        scriptUrl: 'https://script.google.com/macros/s/AKfycbzIMQ1IkQL2hdyxqHC-vq--yXotv_57cjnmijRNIz6TcWNrcEJbC8QI2ssE5rREKjzzhA/exec'  // Google Apps Script Web App URL
    },
    
    // Owner Details
    owner: {
        name: 'Crevate Technologies',
        email: 'kr2060398@gmail.com',
        phone: '+91 98765 43210'
    }
};

// ==================== FORM HANDLER CLASS ====================
class FormHandler {
    constructor(config) {
        this.config = config;
    }
    
    // Main submission method
    async submit(formData, formType = 'contact') {
        const result = {
            success: false,
            message: '',
            method: this.config.primaryMethod
        };
        
        try {
            // Submit via primary method
            await this.submitViaMethod(this.config.primaryMethod, formData, formType);
            result.success = true;
            result.message = 'Form submitted successfully!';
            
            // Submit via backup method (if configured)
            if (this.config.backupMethod && this.config.backupMethod !== this.config.primaryMethod) {
                try {
                    await this.submitViaMethod(this.config.backupMethod, formData, formType);
                } catch (backupError) {
                    console.warn('Backup submission failed:', backupError);
                }
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            result.success = false;
            result.message = error.message || 'Something went wrong. Please try again.';
        }
        
        return result;
    }
    
    // Route to appropriate submission method
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
                return await this.submitGoogleSheets(formData);
            default:
                throw new Error('Invalid submission method');
        }
    }
    
    // ==================== EMAILJS ====================
    async submitEmailJS(formData, formType) {
        // Load EmailJS SDK if not loaded
        if (typeof emailjs === 'undefined') {
            await this.loadScript('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js');
            emailjs.init(this.config.emailjs.publicKey);
        }
        
        const templateParams = {
            to_email: this.config.emailjs.toEmail,
            from_name: formData.name,
            from_email: formData.email,
            from_phone: formData.phone,
            service: formData.service || 'Not specified',
            message: formData.message || 'No message provided',
            form_type: formType,
            submission_date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };
        
        const response = await emailjs.send(
            this.config.emailjs.serviceId,
            this.config.emailjs.templateId,
            templateParams
        );
        
        if (response.status !== 200) {
            throw new Error('EmailJS submission failed');
        }
        
        return response;
    }
    
    // ==================== FORMSPREE ====================
    async submitFormspree(formData) {
        const response = await fetch(`https://formspree.io/f/${this.config.formspree.formId}`, {
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
    }
    
    // ==================== WEB3FORMS ====================
    async submitWeb3Forms(formData, formType) {
        const payload = {
            access_key: this.config.web3forms.accessKey,
            subject: `New ${formType} Form Submission - ${this.config.owner.name}`,
            from_name: this.config.owner.name,
            ...formData,
            submission_date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
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
    }
    
    // ==================== WHATSAPP ====================
    submitWhatsApp(formData, formType) {
        if (!this.config.whatsapp.enableDirectMessage) return;
        
        const message = this.formatWhatsAppMessage(formData, formType);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${this.config.whatsapp.phoneNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
        
        return { success: true, method: 'whatsapp' };
    }
    
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
        message += `📅 *Date:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`;
        message += `🌐 *Source:* Website Form`;
        
        return message;
    }
    
    // ==================== TELEGRAM ====================
    async submitTelegram(formData, formType) {
        const message = this.formatTelegramMessage(formData, formType);
        
        const response = await fetch(`https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: this.config.telegram.chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const result = await response.json();
        
        if (!result.ok) {
            throw new Error('Telegram submission failed');
        }
        
        return result;
    }
    
    formatTelegramMessage(formData, formType) {
        let message = `🔔 <b>New ${formType.toUpperCase()} Form Submission</b>\n`;
        message += `━━━━━━━━━━━━━━━\n\n`;
        message += `👤 <b>Name:</b> ${this.escapeHtml(formData.name)}\n`;
        message += `📱 <b>Phone:</b> ${this.escapeHtml(formData.phone)}\n`;
        message += `📧 <b>Email:</b> ${this.escapeHtml(formData.email)}\n`;
        
        if (formData.service) {
            message += `💼 <b>Service:</b> ${this.escapeHtml(formData.service)}\n`;
        }
        
        if (formData.message) {
            message += `\n💬 <b>Message:</b>\n${this.escapeHtml(formData.message)}\n`;
        }
        
        message += `\n━━━━━━━━━━━━━━━\n`;
        message += `📅 <b>Date:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`;
        message += `🌐 <b>Source:</b> Website Form`;
        
        return message;
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    // ==================== GOOGLE SHEETS ====================
    async submitGoogleSheets(formData) {
        const payload = {
            ...formData,
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch(this.config.googleSheets.scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        // Note: no-cors mode doesn't return response body
        return { success: true, method: 'googlesheets' };
    }
    
    // ==================== UTILITY ====================
    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// ==================== INITIALIZE FORM HANDLER ====================
const formHandler = new FormHandler(FormConfig);

// Export for use in other files
window.FormHandler = formHandler;
window.FormConfig = FormConfig;