class I18n {
    constructor() {
        this.translations = {};
        this.currentLang = localStorage.getItem('language') || 'de';
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.updateActiveFlag();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const flags = document.querySelectorAll('.flag');
        flags.forEach(flag => {
            flag.addEventListener('click', () => {
                const lang = flag.getAttribute('data-lang');
                if (lang) {
                    this.changeLanguage(lang);
                }
            });
        });
    }

    async loadTranslations() {
        try {
            const response = await fetch(`translations/${this.currentLang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            this.updatePage();
            this.updateActiveFlag();
        } catch (error) {
            console.error(`Failed to load translations for ${this.currentLang}:`, error);
            // Fallback to default language if loading fails
            if (this.currentLang !== 'de') {
                console.log('Falling back to default language (de)');
                this.currentLang = 'de';
                localStorage.setItem('language', 'de');
                await this.loadTranslations();
            }
        }
    }

    async changeLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        await this.loadTranslations();
    }

    updatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    updateActiveFlag() {
        const flags = document.querySelectorAll('.flag');
        flags.forEach(flag => {
            if (flag.getAttribute('data-lang') === this.currentLang) {
                flag.classList.add('active');
            } else {
                flag.classList.remove('active');
            }
        });
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return null;
            }
        }
        
        return value;
    }
}

// Инициализация и экспорт
document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
}); 