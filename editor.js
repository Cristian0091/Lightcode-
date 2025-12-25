/**
 * Módulo del editor de código
 * Maneja la lógica del editor y las funcionalidades relacionadas
 */

class CodeEditor {
    constructor() {
        this.editor = document.getElementById('code-editor');
        this.currentFileEl = document.getElementById('current-file');
        this.lineCountEl = document.getElementById('line-count');
        this.charCountEl = document.getElementById('char-count');
        this.fontSizeSelect = document.getElementById('font-size');
        this.tabSizeSelect = document.getElementById('tab-size');
        this.autoSaveCheckbox = document.getElementById('auto-save');
        this.lineNumbersCheckbox = document.getElementById('line-numbers');
        
        this.init();
    }
    
    init() {
        if (this.editor) {
            this.setupEditor();
            this.setupControls();
            this.setupFileActions();
            this.setupSyntaxHighlighting();
        }
    }
    
    setupEditor() {
        // Configurar tamaño de fuente
        const savedFontSize = localStorage.getItem('editor_font_size') || '14';
        this.editor.style.fontSize = `${savedFontSize}px`;
        
        if (this.fontSizeSelect) {
            this.fontSizeSelect.value = savedFontSize;
        }
        
        // Configurar tamaño de tabulación
        const savedTabSize = localStorage.getItem('editor_tab_size') || '4';
        this.editor.style.tabSize = savedTabSize;
        
        if (this.tabSizeSelect) {
            this.tabSizeSelect.value = savedTabSize;
        }
        
        // Manejar tabulaciones
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                
                const start = this.editor.selectionStart;
                const end = this.editor.selectionEnd;
                const value = this.editor.value;
                const tabSize = parseInt(this.tabSizeSelect?.value || '4');
                const tabSpaces = ' '.repeat(tabSize);
                
                if (e.shiftKey) {
                    // Shift + Tab: eliminar tabulación
                    const beforeSelection = value.substring(0, start);
                    const afterSelection = value.substring(end);
                    const selectedText = value.substring(start, end);
                    
                    const lines = selectedText.split('\n');
                    const modifiedLines = lines.map(line => {
                        if (line.startsWith(' '.repeat(tabSize))) {
                            return line.substring(tabSize);
                        } else if (line.startsWith('\t')) {
                            return line.substring(1);
                        }
                        return line;
                    });
                    
                    const modifiedText = modifiedLines.join('\n');
                    this.editor.value = beforeSelection + modifiedText + afterSelection;
                    
                    this.editor.selectionStart = start;
                    this.editor.selectionEnd = start + modifiedText.length;
                } else {
                    // Tab normal: insertar tabulación
                    this.editor.value = value.substring(0, start) + tabSpaces + value.substring(end);
                    this.editor.selectionStart = this.editor.selectionEnd = start + tabSpaces.length;
                }
                
                AppState.files[AppState.currentFile] = this.editor.value;
            }
        });
        
        // Actualizar estadísticas
        this.editor.addEventListener('input', () => {
            this.updateStats();
        });
        
        // Actualizar al cargar
        this.updateStats();
    }
    
    setupControls() {
        // Tamaño de fuente
        if (this.fontSizeSelect) {
            this.fontSizeSelect.addEventListener('change', (e) => {
                const size = e.target.value;
                this.editor.style.fontSize = `${size}px`;
                localStorage.setItem('editor_font_size', size);
            });
        }
        
        // Tamaño de tabulación
        if (this.tabSizeSelect) {
            this.tabSizeSelect.addEventListener('change', (e) => {
                const size = e.target.value;
                this.editor.style.tabSize = size;
                localStorage.setItem('editor_tab_size', size);
            });
        }
        
        // Autoguardado
        if (this.autoSaveCheckbox) {
            this.autoSaveCheckbox.addEventListener('change', (e) => {
                AppState.autoSaveEnabled = e.target.checked;
                localStorage.setItem('editor_auto_save', e.target.checked);
            });
            
            // Cargar configuración guardada
            const savedAutoSave = localStorage.getItem('editor_auto_save');
            if (savedAutoSave !== null) {
                this.autoSaveCheckbox.checked = savedAutoSave === 'true';
                AppState.autoSaveEnabled = this.autoSaveCheckbox.checked;
            }
        }
        
        // Números de línea
        if (this.lineNumbersCheckbox) {
            this.lineNumbersCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.enableLineNumbers();
                } else {
                    this.disableLineNumbers();
                }
            });
            
            // Cargar configuración guardada
            const savedLineNumbers = localStorage.getItem('editor_line_numbers');
            if (savedLineNumbers !== null) {
                this.lineNumbersCheckbox.checked = savedLineNumbers === 'true';
                if (this.lineNumbersCheckbox.checked) {
                    this.enableLineNumbers();
                }
            }
        }
    }
    
    setupFileActions() {
        // Botón ejecutar
        const runButton = document.getElementById('run-code');
        if (runButton) {
            runButton.addEventListener('click', () => {
                this.executeCode();
            });
        }
        
        // Botón guardar
        const saveButton = document.getElementById('save-code');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveProject();
            });
        }
        
        // Botón exportar ZIP
        const exportButton = document.getElementById('export-zip');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportAsZip();
            });
        }
        
        // Botón restablecer
        const resetButton = document.getElementById('reset-code');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('¿Restablecer código a los valores por defecto? Se perderán los cambios no guardados.')) {
                    this.resetToDefault();
                }
            });
        }
        
        // Botón actualizar vista previa
        const refreshButton = document.getElementById('refresh-preview');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.executeCode();
            });
        }
    }
    
    setupSyntaxHighlighting() {
        // Implementación ligera de resaltado de sintaxis
        this.editor.addEventListener('input', () => {
            if (AppState.currentFile.endsWith('.js')) {
                this.highlightJavaScript();
            } else if (AppState.currentFile.endsWith('.css')) {
                this.highlightCSS();
            } else if (AppState.currentFile.endsWith('.html')) {
                this.highlightHTML();
            }
        });
        
        // Aplicar resaltado inicial
        setTimeout(() => {
            this.editor.dispatchEvent(new Event('input'));
        }, 100);
    }
    
    highlightJavaScript() {
        // Resaltado básico para JavaScript
        const code = this.editor.value;
        let highlighted = code;
        
        // Palabras clave
        const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 
                         'return', 'class', 'export', 'import', 'new', 'this', 'typeof', 
                         'instanceof', 'try', 'catch', 'finally', 'throw'];
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
        });
        
        // Strings
        highlighted = highlighted.replace(/('.*?'|".*?")/g, '<span class="string">$1</span>');
        
        // Comentarios
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="comment">$&</span>');
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');
        
        // Números
        highlighted = highlighted.replace(/\b\d+\b/g, '<span class="number">$&</span>');
        
        // Actualizar editor manteniendo cursor
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        
        // Solo actualizar si el contenido cambió
        if (this.editor.innerHTML !== highlighted) {
            this.editor.innerHTML = highlighted;
            this.editor.selectionStart = start;
            this.editor.selectionEnd = end;
        }
    }
    
    highlightCSS() {
        // Resaltado básico para CSS
        const code = this.editor.value;
        let highlighted = code;
        
        // Selectores
        highlighted = highlighted.replace(/([^{}]+)(?={)/g, '<span class="selector">$1</span>');
        
        // Propiedades
        const properties = ['color', 'background', 'font', 'margin', 'padding', 'border', 
                           'width', 'height', 'display', 'position', 'flex', 'grid'];
        
        properties.forEach(prop => {
            const regex = new RegExp(`\\b${prop}\\b(?=:)`, 'g');
            highlighted = highlighted.replace(regex, `<span class="property">${prop}</span>`);
        });
        
        // Valores
        highlighted = highlighted.replace(/(:\s*)([^;]+)/g, '$1<span class="value">$2</span>');
        
        // Comentarios
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');
        
        // Actualizar
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        
        if (this.editor.innerHTML !== highlighted) {
            this.editor.innerHTML = highlighted;
            this.editor.selectionStart = start;
            this.editor.selectionEnd = end;
        }
    }
    
    highlightHTML() {
        // Resaltado básico para HTML
        const code = this.editor.value;
        let highlighted = code;
        
        // Etiquetas
        highlighted = highlighted.replace(/&lt;\/?(\w+)[^&]*&gt;/g, '<span class="tag">$&</span>');
        
        // Atributos
        highlighted = highlighted.replace(/(\w+)=/g, '<span class="attribute">$1</span>=');
        
        // Strings en atributos
        highlighted = highlighted.replace(/=["'][^"']*["']/g, '<span class="string">$&</span>');
        
        // Comentarios
        highlighted = highlighted.replace(/&lt;!--[\s\S]*?--&gt;/g, '<span class="comment">$&</span>');
        
        // Actualizar
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        
        if (this.editor.innerHTML !== highlighted) {
            this.editor.innerHTML = highlighted;
            this.editor.selectionStart = start;
            this.editor.selectionEnd = end;
        }
    }
    
    updateStats() {
        const text = this.editor.value;
        const lines = text.split('\n').length;
        const characters = text.length;
        
        if (this.lineCountEl) {
            this.lineCountEl.textContent = `Línea: ${lines}`;
        }
        
        if (this.charCountEl) {
            this.charCountEl.textContent = `Caracteres: ${characters}`;
        }
    }
    
    enableLineNumbers() {
        // Implementación simple de números de línea
        localStorage.setItem('editor_line_numbers', 'true');
        
        // Agregar estilos para números de línea
        const styleId = 'line-numbers-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .code-editor {
                    counter-reset: line;
                    padding-left: 3.5em !important;
                }
                .code-editor::before {
                    content: counter(line);
                    counter-increment: line;
                    position: absolute;
                    left: 0;
                    width: 3em;
                    padding-right: 0.5em;
                    text-align: right;
                    color: var(--text-secondary);
                    background: var(--code-bg);
                    border-right: 1px solid var(--border-color);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    disableLineNumbers() {
        localStorage.setItem('editor_line_numbers', 'false');
        
        const style = document.getElementById('line-numbers-style');
        if (style) {
            style.remove();
        }
        
        this.editor.style.paddingLeft = '';
    }
    
    executeCode() {
        // Disparar evento para que preview.js maneje la ejecución
        const event = new CustomEvent('code-execute', {
            detail: {
                html: AppState.files['index.html'],
                css: AppState.files['style.css'],
                js: AppState.files['script.js']
            }
        });
        
        document.dispatchEvent(event);
    }
    
    saveProject() {
        try {
            const saveData = {
                files: AppState.files,
                config: {
                    autoSave: AppState.autoSaveEnabled,
                    theme: AppState.theme,
                    powerSaver: AppState.powerSaverMode
                },
                metadata: {
                    name: 'LightCode Project',
                    created: new Date().toISOString(),
                    version: CONFIG.VERSION
                }
            };
            
            const blob = new Blob([JSON.stringify(saveData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lightcode-project-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            window.app?.showNotification('Proyecto guardado correctamente');
        } catch (error) {
            console.error('Error al guardar proyecto:', error);
            window.app?.showNotification('Error al guardar proyecto', 5000);
        }
    }
    
    async exportAsZip() {
        try {
            // Usar JSZip si está disponible (carga diferida)
            if (typeof JSZip === 'undefined') {
                // Cargar JSZip dinámicamente
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
            }
            
            const zip = new JSZip();
            
            // Agregar archivos
            Object.entries(AppState.files).forEach(([filename, content]) => {
                zip.file(filename, content);
            });
            
            // Agregar archivo README
            zip.file('README.md', `# LightCode Project\n\nGenerated with LightCode Editor\nDate: ${new Date().toLocaleString()}`);
            
            // Generar ZIP
            const blob = await zip.generateAsync({ type: 'blob' });
            
            // Descargar
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lightcode-project-${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            window.app?.showNotification('Proyecto exportado como ZIP');
        } catch (error) {
            console.error('Error al exportar ZIP:', error);
            
            // Fallback: descargar archivos individualmente
            this.saveProject();
        }
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    resetToDefault() {
        AppState.files = {
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
        };
        
        // Actualizar editor actual
        this.editor.value = AppState.files[AppState.currentFile];
        this.updateStats();
        
        // Guardar cambios
        window.app?.saveToStorage();
        
        // Ejecutar código actualizado
        this.executeCode();
    }
}

// Inicializar editor cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const editor = new CodeEditor();
    
    // Hacer disponible globalmente para depuración
    window.codeEditor = editor;
});