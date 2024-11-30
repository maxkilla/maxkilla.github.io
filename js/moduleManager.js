class ModuleManager {
    constructor(map) {
        this.map = map;
        this.modules = new Map();
    }

    async initialize() {
        // Listen for module settings updates
        window.addEventListener('module-settings-updated', (event) => {
            const { moduleId, settings } = event.detail;
            const module = this.modules.get(moduleId);
            if (module) {
                module.updateSettings(settings);
            }
        });
    }

    registerModule(moduleId, module) {
        this.modules.set(moduleId, module);
        
        // Register module settings
        const moduleSettings = module.getSettings();
        window.settingsManager.registerModule(moduleId, moduleSettings);
    }

    getModule(moduleId) {
        return this.modules.get(moduleId);
    }

    onMapMoveEnd() {
        // Notify all modules about map movement
        this.modules.forEach(module => {
            if (typeof module.onMapMoveEnd === 'function') {
                module.onMapMoveEnd();
            }
        });
    }

    populateSettings() {
        const tabsContainer = document.getElementById('settings-tabs');
        const contentContainer = document.getElementById('settings-tab-content');
        
        // Clear existing content
        tabsContainer.innerHTML = '';
        contentContainer.innerHTML = '';
        
        const modules = window.settingsManager.getModules();
        
        if (modules.length === 0) {
            contentContainer.innerHTML = '<div class="no-modules">No settings modules available</div>';
            return;
        }
        
        // Create tabs and content for each module
        modules.forEach((module, index) => {
            // Create tab
            const tab = document.createElement('button');
            tab.className = `settings-tab ${index === 0 ? 'active' : ''}`;
            tab.textContent = module.title;
            tab.dataset.moduleId = module.id;
            tabsContainer.appendChild(tab);
            
            // Create content panel
            const panel = document.createElement('div');
            panel.className = `settings-panel ${index === 0 ? 'active' : ''}`;
            panel.dataset.moduleId = module.id;
            
            // Add description if available
            if (module.description) {
                const description = document.createElement('div');
                description.className = 'module-description';
                description.textContent = module.description;
                panel.appendChild(description);
            }
            
            // Create form
            const form = document.createElement('form');
            form.className = 'settings-form';
            
            // Add fields
            module.fields.forEach(field => {
                const fieldContainer = document.createElement('div');
                fieldContainer.className = 'settings-field';
                
                const label = document.createElement('label');
                label.textContent = field.title;
                
                let input;
                if (field.type === 'checkbox') {
                    input = document.createElement('input');
                    input.type = 'checkbox';
                    input.checked = field.value;
                } else {
                    input = document.createElement('input');
                    input.type = field.type || 'text';
                    input.value = field.value || '';
                }
                
                input.name = field.name;
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
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const settings = {};
                
                formData.forEach((value, key) => {
                    if (e.target.querySelector(`[name="${key}"]`).type === 'checkbox') {
                        settings[key] = e.target.querySelector(`[name="${key}"]`).checked;
                    } else {
                        settings[key] = value;
                    }
                });
                
                try {
                    await window.settingsManager.updateModuleSettings(module.id, settings);
                    
                    // Show success message
                    const message = document.createElement('div');
                    message.className = 'settings-message success';
                    message.textContent = 'Settings saved successfully';
                    form.appendChild(message);
                    
                    setTimeout(() => {
                        message.remove();
                    }, 3000);
                } catch (error) {
                    // Show error message
                    const message = document.createElement('div');
                    message.className = 'settings-message error';
                    message.textContent = 'Error saving settings';
                    form.appendChild(message);
                    
                    setTimeout(() => {
                        message.remove();
                    }, 3000);
                }
            });
            
            panel.appendChild(form);
            contentContainer.appendChild(panel);
        });
        
        // Handle tab switching
        tabsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('settings-tab')) {
                // Update active tab
                tabsContainer.querySelectorAll('.settings-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Update active panel
                contentContainer.querySelectorAll('.settings-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
                contentContainer.querySelector(`[data-module-id="${e.target.dataset.moduleId}"]`).classList.add('active');
            }
        });
    }
}
