/**
 * Módulo de temas para LightCode Editor
 * Maneja tema claro/oscuro y preferencias del sistema
 */

class ThemeManager {
    constructor() {
        this.theme = this.getSavedTheme() || this.getSystemTheme();
        this.init();
    }
    
    init() {
        this.applyTheme();
        this.setupThemeToggle();
        this.setupSystemThemeListener();
    }
    
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
    
    getSavedTheme() {
        try {
            return localStorage.getItem('lightcode_theme');
        } catch (error) {
            return null;
        }
    }
    
    applyTheme() {
        // Aplicar al documento
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Aplicar al iframe de vista previa
        this.applyThemeToPreview();
        
        // Actualizar ícono del botón
        this.updateThemeButton();
        
        // Guardar preferencia
        this.saveTheme();
    }
    
    applyThemeToPreview() {
        try {
            const previewFrame = document.getElementById('preview-frame');
            if (previewFrame && previewFrame.contentDocument) {
                const iframeDoc = previewFrame.contentDocument;
                iframeDoc.documentElement.setAttribute('data-theme', this.theme);
            }
        } catch (error) {
            // Silenciar errores de cross-origin
        }
    }
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            // Configurar evento click
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
            
            // Configurar atajo de teclado (Alt + T)
            document.addEventListener('keydown', (e) => {
                if (e.altKey && e.key === 't') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
            
            // Actualizar ícono inicial
            this.updateThemeButton();
        }
    }
    
    setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Escuchar cambios en la preferencia del sistema
            mediaQuery.addEventListener('change', (e) => {
                if (!this.getSavedTheme()) { // Solo si no hay preferencia guardada
                    this.theme = e.matches ? 'dark' : 'light';
                    this.applyTheme();
                }
            });
        }
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        
        // Mostrar notificación
        this.showThemeNotification();
    }
    
    updateThemeButton() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = this.theme === 'light' ? '🌙' : '☀️';
            themeToggle.setAttribute('aria-label', 
                this.theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
        }
    }
    
    saveTheme() {
        try {
            localStorage.setItem('lightcode_theme', this.theme);
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }
    
    showThemeNotification() {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-primary);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(150%);
            transition: transform 0.3s ease;
            font-weight: 500;
        `;
        
        notification.textContent = `Modo ${this.theme === 'light' ? 'claro' : 'oscuro'} activado`;
        document.body.appendChild(notification);
        
        // Animar entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Remover después de 2 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(150%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
    
    // Métodos públicos
    getCurrentTheme() {
        return this.theme;
    }
    
    setTheme(theme) {
        if (['light', 'dark'].includes(theme)) {
            this.theme = theme;
            this.applyTheme();
        }
    }
}

// Inicializar tema
let themeManager = null;

document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    window.themeManager = themeManager;
});