/**
 * Módulo de almacenamiento para LightCode Editor
 * Maneja LocalStorage y IndexedDB de forma eficiente
 */

class StorageManager {
    constructor() {
        this.dbName = 'lightcode_db';
        this.storeName = 'projects';
        this.db = null;
        this.init();
    }
    
    async init() {
        try {
            // Primero intentar con IndexedDB para proyectos grandes
            if ('indexedDB' in window) {
                await this.initIndexedDB();
            }
            
            // Inicializar LocalStorage
            this.initLocalStorage();
            
        } catch (error) {
            console.warn('Storage initialization failed, using localStorage only:', error);
        }
    }
    
    initLocalStorage() {
        // Verificar si localStorage está disponible
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            this.localStorageAvailable = true;
        } catch (e) {
            this.localStorageAvailable = false;
            console.warn('localStorage not available:', e);
        }
    }
    
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    }
    
    async saveProject(projectData) {
        const data = {
            id: 'current_project',
            ...projectData,
            timestamp: new Date().toISOString()
        };
        
        try {
            // Guardar en IndexedDB si está disponible
            if (this.db) {
                await this.saveToIndexedDB(data);
            }
            
            // También guardar en localStorage para acceso rápido
            if (this.localStorageAvailable) {
                this.saveToLocalStorage(data);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving project:', error);
            return false;
        }
    }
    
    async saveToIndexedDB(data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    saveToLocalStorage(data) {
        try {
            // Guardar archivos individuales
            if (data.files) {
                Object.entries(data.files).forEach(([filename, content]) => {
                    localStorage.setItem(`lightcode_file_${filename}`, content);
                });
            }
            
            // Guardar metadatos
            localStorage.setItem('lightcode_metadata', JSON.stringify({
                lastSaved: data.timestamp,
                config: data.config
            }));
            
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded, clearing old data');
                this.cleanupLocalStorage();
                // Reintentar
                this.saveToLocalStorage(data);
            } else {
                throw error;
            }
        }
    }
    
    async loadProject() {
        try {
            // Primero intentar con IndexedDB
            if (this.db) {
                const data = await this.loadFromIndexedDB();
                if (data) return data;
            }
            
            // Fallback a localStorage
            if (this.localStorageAvailable) {
                return this.loadFromLocalStorage();
            }
            
            return null;
        } catch (error) {
            console.error('Error loading project:', error);
            return null;
        }
    }
    
    async loadFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get('current_project');
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    loadFromLocalStorage() {
        try {
            const metadataStr = localStorage.getItem('lightcode_metadata');
            if (!metadataStr) return null;
            
            const metadata = JSON.parse(metadataStr);
            const files = {};
            
            // Cargar archivos individuales
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('lightcode_file_')) {
                    const filename = key.replace('lightcode_file_', '');
                    files[filename] = localStorage.getItem(key);
                }
            }
            
            return {
                files,
                config: metadata.config,
                timestamp: metadata.lastSaved
            };
            
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }
    
    cleanupLocalStorage() {
        // Eliminar datos antiguos (más de 30 días)
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key.startsWith('lightcode_')) {
                try {
                    const item = localStorage.getItem(key);
                    const data = JSON.parse(item);
                    
                    if (data && data.timestamp) {
                        const itemTime = new Date(data.timestamp).getTime();
                        if (itemTime < thirtyDaysAgo) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch (e) {
                    // Si no se puede parsear, mantenerlo
                }
            }
        }
    }
    
    async exportProject() {
        const project = await this.loadProject();
        if (!project) return null;
        
        return {
            ...project,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    async importProject(projectData) {
        try {
            await this.saveProject(projectData);
            return true;
        } catch (error) {
            console.error('Error importing project:', error);
            return false;
        }
    }
    
    clearAll() {
        // Limpiar IndexedDB
        if (this.db) {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            store.clear();
        }
        
        // Limpiar localStorage
        if (this.localStorageAvailable) {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key.startsWith('lightcode_')) {
                    localStorage.removeItem(key);
                }
            }
        }
    }
}

// Inicializar y hacer disponible globalmente
let storageManager = null;

document.addEventListener('DOMContentLoaded', async () => {
    storageManager = new StorageManager();
    window.storageManager = storageManager;
});

// Para uso en otros módulos
window.getStorageManager = () => storageManager;