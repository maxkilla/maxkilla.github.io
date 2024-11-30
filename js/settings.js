class Settings {
    static STORAGE_KEY = 'smart_travel_hub_settings';
    static #instance = null;
    #settings = {};
    #modules = new Map();

    constructor() {
        if (Settings.#instance) {
            return Settings.#instance;
        }
        Settings.#instance = this;
        this.loadSettings();
    }

    static getInstance() {
        if (!Settings.#instance) {
            Settings.#instance = new Settings();
        }
        return Settings.#instance;
    }

    // Register a new module with its settings configuration
    registerModule(moduleId, config) {
        this.#modules.set(moduleId, {
            ...config,
            settings: this.#settings[moduleId] || {}
        });
        this.saveSettings();
    }

    // Get settings for a specific module
    getModuleSettings(moduleId) {
        return this.#settings[moduleId] || {};
    }

    // Update settings for a specific module
    updateModuleSettings(moduleId, settings) {
        this.#settings[moduleId] = {
            ...this.#settings[moduleId],
            ...settings
        };
        this.saveSettings();
        
        // Dispatch event for module settings update
        window.dispatchEvent(new CustomEvent('module-settings-updated', {
            detail: { moduleId, settings: this.#settings[moduleId] }
        }));
    }

    // Load settings from localStorage
    loadSettings() {
        try {
            const stored = localStorage.getItem(Settings.STORAGE_KEY);
            this.#settings = stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading settings:', error);
            this.#settings = {};
        }
    }

    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem(Settings.STORAGE_KEY, JSON.stringify(this.#settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // Get all registered modules
    getModules() {
        return Array.from(this.#modules.entries()).map(([id, config]) => ({
            id,
            ...config
        }));
    }

    // Show settings dialog
    showDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'settings-dialog';
        
        const content = document.createElement('div');
        content.className = 'settings-content';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'settings-header';
        header.innerHTML = `
            <h2>Settings</h2>
            <button class="close-button">
                <span class="material-icons-round">close</span>
            </button>
        `;
        
        // Create tabs for different setting categories
        const tabs = document.createElement('div');
        tabs.className = 'settings-tabs';
        
        const tabContent = document.createElement('div');
        tabContent.className = 'settings-tab-content';
        
        // Generate tabs and content for each module
        const modules = this.getModules();
        
        if (modules.length > 0) {
            modules.forEach((module, index) => {
                // Create tab
                const tab = document.createElement('button');
                tab.className = `settings-tab ${index === 0 ? 'active' : ''}`;
                tab.textContent = module.name;
                tab.dataset.moduleId = module.id;
                tabs.appendChild(tab);
                
                // Create content panel
                const panel = document.createElement('div');
                panel.className = `settings-panel ${index === 0 ? 'active' : ''}`;
                panel.dataset.moduleId = module.id;
                
                // Generate form fields based on module configuration
                const form = this.createSettingsForm(module);
                panel.appendChild(form);
                
                tabContent.appendChild(panel);
            });
        } else {
            tabContent.innerHTML = '<p class="no-modules">No settings modules registered</p>';
        }
        
        // Assemble dialog
        content.appendChild(header);
        content.appendChild(tabs);
        content.appendChild(tabContent);
        dialog.appendChild(content);
        
        // Add event listeners
        header.querySelector('.close-button').addEventListener('click', () => {
            dialog.remove();
        });
        
        tabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('settings-tab')) {
                // Update active tab
                tabs.querySelectorAll('.settings-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Update active panel
                const moduleId = e.target.dataset.moduleId;
                tabContent.querySelectorAll('.settings-panel').forEach(panel => {
                    panel.classList.toggle('active', panel.dataset.moduleId === moduleId);
                });
            }
        });
        
        // Add dialog to page
        document.body.appendChild(dialog);
    }

    createSettingsForm(module) {
        const form = document.createElement('form');
        form.className = 'settings-form';
        
        // Add description if provided
        if (module.description) {
            const description = document.createElement('p');
            description.className = 'module-description';
            description.textContent = module.description;
            form.appendChild(description);
        }
        
        // Create form fields based on module configuration
        const currentSettings = this.getModuleSettings(module.id);
        
        Object.entries(module.fields || {}).forEach(([fieldId, field]) => {
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'settings-field';
            
            const label = document.createElement('label');
            label.textContent = field.label;
            
            const input = document.createElement('input');
            input.type = field.type || 'text';
            input.name = fieldId;
            input.value = currentSettings[fieldId] || '';
            input.placeholder = field.placeholder || '';
            
            if (field.required) {
                input.required = true;
            }
            
            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);
            form.appendChild(fieldContainer);
        });
        
        // Add save button
        const saveButton = document.createElement('button');
        saveButton.type = 'submit';
        saveButton.className = 'save-settings';
        saveButton.textContent = 'Save Settings';
        
        form.appendChild(saveButton);
        
        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const settings = {};
            
            for (const [key, value] of formData.entries()) {
                settings[key] = value;
            }
            
            this.updateModuleSettings(module.id, settings);
            
            // Show success message
            const message = document.createElement('div');
            message.className = 'settings-message success';
            message.textContent = 'Settings saved successfully';
            form.appendChild(message);
            
            setTimeout(() => {
                message.remove();
            }, 3000);
        });
        
        return form;
    }
}
