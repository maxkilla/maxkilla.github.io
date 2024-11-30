class ApiKeyManager {
    static STORAGE_KEY = 'encrypted_maps_api_key';
    
    static async encrypt(text, password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await this._deriveKey(password, salt);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );
        return {
            encrypted: Array.from(new Uint8Array(encrypted)),
            iv: Array.from(iv),
            salt: Array.from(salt)
        };
    }

    static async decrypt(encryptedData, password) {
        try {
            const key = await this._deriveKey(password, new Uint8Array(encryptedData.salt));
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
                key,
                new Uint8Array(encryptedData.encrypted)
            );
            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    static async _deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }

    static validateApiKey(apiKey) {
        // Basic validation for Google Maps API key format
        const pattern = /^AIza[0-9A-Za-z-_]{35}$/;
        return pattern.test(apiKey);
    }

    static showError(input, message) {
        const errorDiv = document.querySelector('.api-key-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 820);
    }

    static async saveApiKey(apiKey) {
        try {
            const password = window.location.hostname + navigator.userAgent;
            const encrypted = await this.encrypt(apiKey, password);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(encrypted));
            return true;
        } catch (error) {
            console.error('Error saving API key:', error);
            return false;
        }
    }

    static async getApiKey() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return null;
            
            const password = window.location.hostname + navigator.userAgent;
            const encryptedData = JSON.parse(stored);
            return await this.decrypt(encryptedData, password);
        } catch (error) {
            console.error('Error retrieving API key:', error);
            return null;
        }
    }

    static async validateApiKeyWithGoogle(apiKey) {
        return new Promise((resolve) => {
            // Create a temporary script to test the API key
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=validateGoogleMapsCallback`;
            script.async = true;
            
            // Set a timeout to handle failed loads
            const timeoutId = setTimeout(() => {
                window.validateGoogleMapsCallback = null;
                script.remove();
                resolve({ isValid: false, error: 'API key validation timed out. Please check your internet connection.' });
            }, 10000);

            // Create a global callback function
            window.validateGoogleMapsCallback = () => {
                clearTimeout(timeoutId);
                window.validateGoogleMapsCallback = null;
                script.remove();
                
                // Check if the Maps API was properly initialized
                if (window.google && window.google.maps) {
                    resolve({ isValid: true });
                } else {
                    resolve({ isValid: false, error: 'API key is invalid or has insufficient permissions.' });
                }
            };

            // Handle load errors
            script.onerror = () => {
                clearTimeout(timeoutId);
                window.validateGoogleMapsCallback = null;
                script.remove();
                resolve({ isValid: false, error: 'Invalid API key or API quota exceeded.' });
            };

            document.head.appendChild(script);
        });
    }

    static async promptForApiKey() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'api-key-modal';
            modal.innerHTML = `
                <div class="api-key-modal-content">
                    <h2>Google Maps API Key Required</h2>
                    <p>Please enter your Google Maps API key to use this application.</p>
                    <p class="hint">Your API key will be stored securely in your browser.</p>
                    <div class="input-group">
                        <input type="text" id="apiKeyInput" placeholder="Enter your API key" />
                        <div class="api-key-error"></div>
                    </div>
                    <div class="api-key-instructions">
                        <p><strong>Your API key should:</strong></p>
                        <ul>
                            <li>Start with 'AIza'</li>
                            <li>Be exactly 39 characters long</li>
                            <li>Have Maps JavaScript API enabled</li>
                            <li>Have proper billing set up</li>
                        </ul>
                        <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
                           target="_blank" 
                           rel="noopener noreferrer">
                            How to get an API key →
                        </a>
                    </div>
                    <div class="button-group">
                        <button id="submitApiKey" class="primary">
                            <span class="button-text">Save API Key</span>
                            <span class="button-loader" style="display: none;">
                                <span class="material-icons-round rotating">sync</span>
                            </span>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const input = modal.querySelector('#apiKeyInput');
            const submitBtn = modal.querySelector('#submitApiKey');
            const buttonText = submitBtn.querySelector('.button-text');
            const buttonLoader = submitBtn.querySelector('.button-loader');

            const setLoading = (isLoading) => {
                submitBtn.disabled = isLoading;
                buttonText.style.display = isLoading ? 'none' : 'block';
                buttonLoader.style.display = isLoading ? 'block' : 'none';
            };

            const handleSubmit = async () => {
                const apiKey = input.value.trim();
                
                if (!apiKey) {
                    this.showError(input, 'Please enter an API key');
                    return;
                }

                if (!this.validateApiKey(apiKey)) {
                    this.showError(input, 'Invalid API key format. Should start with "AIza" and be 39 characters long.');
                    return;
                }

                setLoading(true);
                const validationResult = await this.validateApiKeyWithGoogle(apiKey);
                setLoading(false);

                if (!validationResult.isValid) {
                    this.showError(input, validationResult.error);
                    return;
                }

                await this.saveApiKey(apiKey);
                modal.remove();
                resolve(apiKey);
            };

            submitBtn.addEventListener('click', handleSubmit);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleSubmit();
            });
            
            // Clear error on input
            input.addEventListener('input', () => {
                const errorDiv = modal.querySelector('.api-key-error');
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                }
                submitBtn.disabled = false;
            });
        });
    }
}
