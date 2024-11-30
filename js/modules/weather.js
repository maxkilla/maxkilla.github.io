class WeatherModule {
    static ID = 'weather';
    #settings;

    constructor() {
        this.#settings = Settings.getInstance();
        this.registerSettings();
    }

    registerSettings() {
        this.#settings.registerModule(WeatherModule.ID, {
            name: 'Weather Settings',
            description: 'Configure OpenWeatherMap API settings',
            fields: {
                apiKey: {
                    label: 'API Key',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter your OpenWeatherMap API key'
                }
            }
        });
    }

    async fetchWeatherData(bounds) {
        const settings = this.#settings.getModuleSettings(WeatherModule.ID);
        if (!settings.apiKey) {
            throw new Error('OpenWeatherMap API key not configured');
        }

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/box/city?bbox=${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()},10&appid=${settings.apiKey}`
            );
            const data = await response.json();
            return data.list || [];
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    }
}
