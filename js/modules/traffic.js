class TrafficModule {
    static ID = 'traffic';
    #settings;

    constructor() {
        this.#settings = Settings.getInstance();
        this.registerSettings();
    }

    registerSettings() {
        this.#settings.registerModule(TrafficModule.ID, {
            name: 'Traffic Settings',
            description: 'Configure Thunderforest Maps API settings',
            fields: {
                apiKey: {
                    label: 'API Key',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter your Thunderforest API key'
                }
            }
        });
    }

    createLayer() {
        const settings = this.#settings.getModuleSettings(TrafficModule.ID);
        if (!settings.apiKey) {
            throw new Error('Thunderforest API key not configured');
        }

        return L.tileLayer('https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=' + settings.apiKey, {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors, © Thunderforest'
        });
    }
}
