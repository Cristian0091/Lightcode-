/**
 * Módulo de vista previa en vivo
 * Maneja la ejecución del código y la vista previa en iframe
 */

class CodePreview {
    constructor() {
        this.previewFrame = document.getElementById('preview-frame');
        this.consoleOutput = document.getElementById('console-output');
        this.originalConsole = {};
        
        this.init();
    }
    
    init() {
        this.setupConsoleCapture();
        this.setupEventListeners();
        this.executeInitialCode();
    }
    
    setupConsoleCapture() {
        // Guardar consola original
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };
        
        // Capturar console.log
        console.log = (...args) => {
            this.originalConsole.log(...args);
            this.appendToConsole('log', ...args);
        };
        
        // Capturar console.error
        console.error = (...args) => {
            this.originalConsole.error(...args);
            this.appendToConsole('error', ...args);
        };
        
        // Capturar console.warn
        console.warn = (...args) => {
            this.originalConsole.warn(...args);
            this.appendToConsole('warn', ...args);
        };
        
        // Capturar console.info
        console.info = (...args) => {
            this.originalConsole.info(...args);
            this.appendToConsole('info', ...args);
        };
    }
    
    setupEventListeners() {
        // Escuchar evento de ejecución de código
        document.addEventListener('code-execute', (e) => {
            this.updatePreview(e.detail);
        });
        
        // Limpiar consola periódicamente para evitar sobrecarga
        setInterval(() => {
            if (this.consoleOutput.children.length > 100) {
                while (this.consoleOutput.children.length > 50) {
                    this.consoleOutput.removeChild(this.consoleOutput.firstChild);
                }
            }
        }, 5000);
    }
    
    executeInitialCode() {
        // Ejecutar código inicial después de un breve delay
        setTimeout(() => {
            const initialCode = {
                html: AppState.files['index.html'],
                css: AppState.files['style.css'],
                js: AppState.files['script.js']
            };
            
            this.updatePreview(initialCode);
        }, 500);
    }
    
    updatePreview({ html, css, js }) {
        try {
            // Limpiar consola
            this.clearConsole();
            
            // Generar documento completo
            const fullHtml = this.generateFullHtml(html, css, js);
            
            // Actualizar iframe
            this.updateIframe(fullHtml);
            
            // Restaurar console methods temporalmente para el código del usuario
            this.executeUserCode(js);
            
        } catch (error) {
            this.appendToConsole('error', `Error al actualizar vista previa: ${error.message}`);
        }
    }
    
    generateFullHtml(html, css, js) {
        // Encontrar etiquetas de cierre para insertar estilos y scripts en el lugar correcto
        let processedHtml = html;
        
        // Insertar estilos en el head
        if (processedHtml.includes('</head>')) {
            processedHtml = processedHtml.replace(
                '</head>',
                `<style>${css}</style>\n</head>`
            );
        } else if (processedHtml.includes('<body')) {
            // Si no hay head, insertar antes del body
            processedHtml = processedHtml.replace(
                '<body',
                `<style>${css}</style>\n<body`
            );
        } else {
            // Si no hay body, agregar al principio
            processedHtml = `<style>${css}</style>\n${processedHtml}`;
        }
        
        // Insertar scripts antes del cierre del body
        if (processedHtml.includes('</body>')) {
            processedHtml = processedHtml.replace(
                '</body>',
                `<script>${js}</script>\n</body>`
            );
        } else {
            // Si no hay body, agregar al final
            processedHtml += `\n<script>${js}</script>`;
        }
        
        return processedHtml;
    }
    
    updateIframe(html) {
        if (!this.previewFrame) return;
        
        try {
            const iframeDoc = this.previewFrame.contentDocument || 
                             this.previewFrame.contentWindow.document;
            
            iframeDoc.open();
            iframeDoc.write(html);
            iframeDoc.close();
            
            // Inyectar captura de console.log en el iframe
            this.injectConsoleCapture(iframeDoc);
            
        } catch (error) {
            // Fallback: usar srcdoc
            this.previewFrame.srcdoc = html;
        }
    }
    
    injectConsoleCapture(iframeDoc) {
        const script = iframeDoc.createElement('script');
        script.textContent = `
            (function() {
                const originalConsole = {
                    log: console.log,
                    error: console.error,
                    warn: console.warn,
                    info: console.info
                };
                
                // Enviar logs al parent
                function sendToParent(type, args) {
                    try {
                        window.parent.postMessage({
                            type: 'console',
                            method: type,
                            args: Array.from(args).map(arg => 
                                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                            )
                        }, '*');
                    } catch (e) {
                        // Silenciar errores de cross-origin
                    }
                }
                
                console.log = function(...args) {
                    originalConsole.log(...args);
                    sendToParent('log', args);
                };
                
                console.error = function(...args) {
                    originalConsole.error(...args);
                    sendToParent('error', args);
                };
                
                console.warn = function(...args) {
                    originalConsole.warn(...args);
                    sendToParent('warn', args);
                };
                
                console.info = function(...args) {
                    originalConsole.info(...args);
                    sendToParent('info', args);
                };
            })();
        `;
        
        iframeDoc.head.appendChild(script);
        
        // Escuchar mensajes desde el iframe
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'console') {
                this.appendToConsole(e.data.method, ...e.data.args);
            }
        });
    }
    
    executeUserCode(js) {
        try {
            // Ejecutar el código del usuario en el contexto actual
            // (solo para propósitos de consola)
            const userScript = document.createElement('script');
            userScript.textContent = js;
            document.head.appendChild(userScript);
            document.head.removeChild(userScript);
            
        } catch (error) {
            this.appendToConsole('error', `Error en ejecución: ${error.message}`);
        }
    }
    
    appendToConsole(type, ...args) {
        if (!this.consoleOutput) return;
        
        const entry = document.createElement('div');
        entry.className = `console-entry console-${type}`;
        
        // Formatear argumentos
        const formattedArgs = args.map(arg => {
            try {
                if (typeof arg === 'object') {
                    return JSON.stringify(arg, null, 2);
                }
                return String(arg);
            } catch (e) {
                return '[Object]';
            }
        });
        
        // Añadir timestamp
        const timestamp = new Date().toLocaleTimeString();
        entry.innerHTML = `
            <span class="console-timestamp">[${timestamp}]</span>
            <span class="console-type">${type.toUpperCase()}:</span>
            <span class="console-message">${formattedArgs.join(' ')}</span>
        `;
        
        // Estilos según tipo
        entry.style.cssText = `
            padding: 4px 8px;
            border-bottom: 1px solid var(--border-color);
            font-family: var(--font-mono);
            font-size: 12px;
            word-break: break-all;
        `;
        
        switch (type) {
            case 'error':
                entry.style.color = 'var(--error-color)';
                entry.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
                break;
            case 'warn':
                entry.style.color = 'var(--warning-color)';
                entry.style.backgroundColor = 'rgba(243, 156, 18, 0.1)';
                break;
            case 'info':
                entry.style.color = 'var(--accent-primary)';
                entry.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
                break;
            default:
                entry.style.color = 'var(--code-text)';
        }
        
        this.consoleOutput.appendChild(entry);
        
        // Auto-scroll al final
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }
    
    clearConsole() {
        if (this.consoleOutput) {
            this.consoleOutput.innerHTML = '';
        }
    }
}

// Inicializar vista previa
document.addEventListener('DOMContentLoaded', () => {
    const preview = new CodePreview();
    window.codePreview = preview;
});