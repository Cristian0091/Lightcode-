/**
 * LightCode - Aplicación principal
 * Arquitectura modular para máximo rendimiento
 */

// Configuración global
const CONFIG = {
    APP_NAME: 'LightCode',
    VERSION: '1.0.0',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    AUTO_SAVE_INTERVAL: 3000, // 3 segundos
    DEBOUNCE_DELAY: 500,
};

// Estado global de la aplicación
const AppState = {
    currentFile: 'index.html',
    files: {
        'index.html': `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Página Web</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>¡Hola Mundo!</h1>
        <p>Bienvenido a LightCode Editor</p>
    </header>
    
    <main>
        <section>
            <h2>Características</h2>
            <ul>
                <li>Editor ligero y rápido</li>
                <li>Vista previa en tiempo real</li>
                <li>Sin necesidad de backend</li>
            </ul>
        </section>
        
        <button onclick="showAlert()">Haz clic aquí</button>
    </main>
    
    <footer>
        <p>Creado con LightCode Editor</p>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>`,
        'style.css': `/* Estilos principales */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

header {
    background: linear-gradient(135deg, #4361ee, #3a0ca3);
    color: white;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 2rem;
    text-align: center;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

h2 {
    color: #4361ee;
    margin: 1.5rem 0 1rem 0;
    border-bottom: 2px solid #4361ee;
    padding-bottom: 0.5rem;
}

main {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

ul {
    margin: 1rem 0;
    padding-left: 2rem;
}

li {
    margin: 0.5rem 0;
}

button {
    background-color: #4361ee;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    margin: 1rem 0;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #3a0ca3;
}

footer {
    text-align: center;
    margin-top: 2rem;
    padding: 1rem;
    color: #666;
    border-top: 1px solid #ddd;
}`,
        'script.js': `// Código JavaScript de ejemplo
function showAlert() {
    alert('¡Hola desde LightCode Editor!');
    console.log('Botón clickeado');
}

// Ejemplo de manipulación del DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada');
    
    // Cambiar color del header al hacer clic
    const header = document.querySelector('header');
    if (header) {
        header.addEventListener('click', function() {
            const colors = ['#4361ee', '#3a0ca3', '#7209b7', '#f72585'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            this.style.background = \`linear-gradient(135deg, \${randomColor}, \${randomColor}99)\`;
        });
    }
    
    // Contador de clics
    let clickCount = 0;
    const button = document.querySelector('button');
    if (button) {
        button.addEventListener('click', function() {
            clickCount++;
            console.log(\`Clics totales: \${clickCount}\`);
        });
    }
});

// Función de utilidad para formatear fecha
function formatDate(date) {
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

console.log('Script cargado correctamente');`
    },
    autoSaveEnabled: true,
    powerSaverMode: false,
    theme: 'light'
};

// Inicialización de la aplicación
class LightCodeApp {
    constructor() {
        this.initializeApp = this.initializeApp.bind(this);
        this.measurePerformance = this.measurePerformance.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        
        // Iniciar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initializeApp);
        } else {
            this.initializeApp();
        }
    }
    
    initializeApp() {
        console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} iniciando...`);
        
        // Medir rendimiento
        this.measurePerformance();
        
        // Configurar listeners
        this.setupEventListeners();
        
        // Inicializar componentes
        this.initNavigation();
        this.initFileTabs();
        this.initEditor();
        this.loadSavedData();
        
        console.log('Aplicación inicializada correctamente');
    }
    
    measurePerformance() {
        // Medir tiempo de carga
        const loadTime = performance.timing.domContentLoadedEventEnd - 
                        performance.timing.navigationStart;
        
        // Actualizar UI con métricas
        requestIdleCallback(() => {
            const loadTimeEl = document.getElementById('load-time');
            if (loadTimeEl) {
                loadTimeEl.textContent = `Carga: ${loadTime}ms`;
            }
            
            // Medir uso de memoria (si está disponible)
            if (performance.memory) {
                const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
                const memoryEl = document.getElementById('memory-usage');
                if (memoryEl) {
                    memoryEl.textContent = `Memoria: ${memoryUsage.toFixed(1)}MB`;
                }
            }
        });
    }
    
    setupEventListeners() {
        // Navegación suave
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Botón CTA
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                this.scrollToEditor();
            });
        }
        
        // Manejo de modo ahorro
        const powerSaverToggle = document.getElementById('power-saver-toggle');
        if (powerSaverToggle) {
            powerSaverToggle.addEventListener('click', () => {
                this.togglePowerSaverMode();
            });
        }
        
        const disablePowerSaver = document.getElementById('disable-power-saver');
        if (disablePowerSaver) {
            disablePowerSaver.addEventListener('click', () => {
                this.togglePowerSaverMode(false);
            });
        }
        
        // Cerrar modo ahorro al hacer clic fuera
        document.addEventListener('click', (e) => {
            const powerSaver = document.getElementById('power-saver');
            const toggleBtn = document.getElementById('power-saver-toggle');
            
            if (powerSaver && !powerSaver.contains(e.target) && 
                toggleBtn && !toggleBtn.contains(e.target) && 
                !powerSaver.classList.contains('hidden')) {
                powerSaver.classList.add('hidden');
            }
        });
    }
    
    initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.setAttribute('aria-expanded', 
                    navMenu.classList.contains('active').toString());
            });
            
            // Cerrar menú al hacer clic en un enlace
            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }
    
    initFileTabs() {
        const fileTabs = document.querySelectorAll('.file-tab');
        fileTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const file = tab.dataset.file;
                this.switchFile(file);
                
                // Actualizar pestañas activas
                fileTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }
    
    initEditor() {
        const editor = document.getElementById('code-editor');
        if (editor) {
            // Configurar editor
            editor.value = AppState.files[AppState.currentFile];
            
            // Actualizar estadísticas
            this.updateEditorStats();
            
            // Configurar autoguardado
            if (AppState.autoSaveEnabled) {
                this.setupAutoSave(editor);
            }
            
            // Configurar atajos de teclado
            this.setupKeyboardShortcuts(editor);
        }
    }
    
    switchFile(fileName) {
        if (AppState.files[fileName]) {
            AppState.currentFile = fileName;
            
            // Actualizar editor
            const editor = document.getElementById('code-editor');
            if (editor) {
                editor.value = AppState.files[fileName];
                this.updateEditorStats();
                
                // Actualizar UI
                const currentFileEl = document.getElementById('current-file');
                if (currentFileEl) {
                    currentFileEl.textContent = fileName;
                }
            }
        }
    }
    
    updateEditorStats() {
        const editor = document.getElementById('code-editor');
        if (!editor) return;
        
        const text = editor.value;
        const lines = text.split('\n').length;
        const characters = text.length;
        
        const lineCountEl = document.getElementById('line-count');
        const charCountEl = document.getElementById('char-count');
        
        if (lineCountEl) lineCountEl.textContent = `Línea: ${lines}`;
        if (charCountEl) charCountEl.textContent = `Caracteres: ${characters}`;
    }
    
    setupAutoSave(editor) {
        let saveTimeout;
        
        editor.addEventListener('input', () => {
            // Actualizar estadísticas
            this.updateEditorStats();
            
            // Actualizar estado
            AppState.files[AppState.currentFile] = editor.value;
            
            // Debounce para autoguardado
            clearTimeout(saveTimeout);
            
            if (AppState.autoSaveEnabled) {
                saveTimeout = setTimeout(() => {
                    this.saveToStorage();
                }, CONFIG.DEBOUNCE_DELAY);
            }
        });
        
        // Guardar también al cambiar de pestaña
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });
    }
    
    setupKeyboardShortcuts(editor) {
        editor.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S para guardar
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveToStorage();
                this.showNotification('Código guardado');
            }
            
            // Ctrl/Cmd + R para ejecutar
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.runCode();
            }
            
            // Ctrl + / para comentar/descomentar
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.toggleComment(editor);
            }
            
            // F1 para mostrar atajos
            if (e.key === 'F1') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
    }
    
    toggleComment(editor) {
        const selectionStart = editor.selectionStart;
        const selectionEnd = editor.selectionEnd;
        const text = editor.value;
        
        // Obtener las líneas seleccionadas
        const beforeSelection = text.substring(0, selectionStart);
        const afterSelection = text.substring(selectionEnd);
        const selectedText = text.substring(selectionStart, selectionEnd);
        
        const lines = selectedText.split('\n');
        const allLinesCommented = lines.every(line => 
            line.trim().startsWith('//') || line.trim() === '');
        
        const modifiedLines = lines.map(line => {
            if (allLinesCommented) {
                // Descomentar
                return line.replace(/^\s*\/\/\s?/, '');
            } else {
                // Comentar
                return line.trim() ? '// ' + line : line;
            }
        });
        
        const modifiedText = modifiedLines.join('\n');
        editor.value = beforeSelection + modifiedText + afterSelection;
        
        // Restaurar selección
        editor.selectionStart = selectionStart;
        editor.selectionEnd = selectionStart + modifiedText.length;
        
        // Actualizar estado
        AppState.files[AppState.currentFile] = editor.value;
    }
    
    loadSavedData() {
        try {
            const savedData = localStorage.getItem('lightcode_editor');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                
                // Combinar con estado por defecto
                Object.assign(AppState.files, parsed.files || {});
                
                // Cargar configuración
                if (parsed.autoSaveEnabled !== undefined) {
                    AppState.autoSaveEnabled = parsed.autoSaveEnabled;
                }
                
                if (parsed.theme) {
                    AppState.theme = parsed.theme;
                    document.documentElement.setAttribute('data-theme', parsed.theme);
                    
                    // Actualizar botón de tema
                    const themeToggle = document.getElementById('theme-toggle');
                    if (themeToggle) {
                        themeToggle.textContent = parsed.theme === 'dark' ? '☀️' : '🌙';
                    }
                }
                
                console.log('Datos guardados cargados correctamente');
            }
        } catch (error) {
            console.warn('Error al cargar datos guardados:', error);
        }
    }
    
    saveToStorage() {
        try {
            const saveData = {
                files: AppState.files,
                autoSaveEnabled: AppState.autoSaveEnabled,
                theme: AppState.theme,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem('lightcode_editor', JSON.stringify(saveData));
            console.log('Datos guardados en localStorage');
        } catch (error) {
            console.error('Error al guardar datos:', error);
        }
    }
    
    runCode() {
        const runButton = document.getElementById('run-code');
        if (runButton) {
            runButton.click();
        }
    }
    
    scrollToEditor() {
        const editorSection = document.getElementById('editor');
        if (editorSection) {
            editorSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    togglePowerSaverMode(enable) {
        const powerSaverMode = enable !== undefined ? enable : !AppState.powerSaverMode;
        
        if (powerSaverMode) {
            document.documentElement.classList.add('power-saver-mode');
            AppState.powerSaverMode = true;
            
            // Mostrar notificación
            const powerSaverEl = document.getElementById('power-saver');
            if (powerSaverEl) {
                powerSaverEl.classList.remove('hidden');
            }
            
            // Desactivar autoguardado
            AppState.autoSaveEnabled = false;
            const autoSaveCheckbox = document.getElementById('auto-save');
            if (autoSaveCheckbox) {
                autoSaveCheckbox.checked = false;
            }
            
            this.showNotification('Modo ahorro activado');
        } else {
            document.documentElement.classList.remove('power-saver-mode');
            AppState.powerSaverMode = false;
            
            // Ocultar notificación
            const powerSaverEl = document.getElementById('power-saver');
            if (powerSaverEl) {
                powerSaverEl.classList.add('hidden');
            }
            
            this.showNotification('Modo ahorro desactivado');
        }
        
        this.saveToStorage();
    }
    
    showNotification(message, duration = 3000) {
        // Crear notificación si no existe
        let notification = document.getElementById('app-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'app-notification';
            notification.className = 'notification';
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
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.style.transform = 'translateX(0)';
        
        // Ocultar después de la duración
        setTimeout(() => {
            notification.style.transform = 'translateX(150%)';
        }, duration);
    }
    
    showKeyboardShortcuts() {
        const shortcuts = `
            Atajos de teclado disponibles:
            
            Ctrl/Cmd + S → Guardar código
            Ctrl/Cmd + R → Ejecutar código
            Ctrl + /     → Comentar/descomentar línea
            F1           → Mostrar esta ayuda
            Tab          → Indentar código
            Shift + Tab  → Desindentar código
        `;
        
        alert(shortcuts);
    }
}

// Inicializar aplicación cuando se cargue la página
const app = new LightCodeApp();

// Funciones globales para el footer
function showPrivacy() {
    alert('LightCode Editor respeta tu privacidad. Todo el código se guarda localmente en tu navegador y no se envía a ningún servidor.');
}

function showTerms() {
    alert('LightCode Editor es software open source. Puedes usarlo, modificarlo y distribuirlo libremente bajo la licencia MIT.');
}

function showAbout() {
    alert(`${CONFIG.APP_NAME} v${CONFIG.VERSION}\n\nEditor de código ultra ligero diseñado para funcionar en cualquier dispositivo.\n\nCreado con ♥ para la comunidad.`);
}

// Exportar para uso en consola
window.LightCodeApp = app;