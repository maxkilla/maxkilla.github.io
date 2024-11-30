// Main application entry point
import { config } from './config.js';
import { handleError, formatDate, getCookie, setCookie } from './utils.js';
import { initMap, map } from './map.js';
import { initMarkerHandlers } from './markers.js';
import { AddCurrentWeatherContent, AddForecastWeatherContent } from './weather.js';
import { AddRoadTravelConditionsContent } from './roadConditions.js';
import { AddFireContent } from './fire.js';
import { AddOtherInfoContent } from './otherInfo.js';
import { initAnalytics, trackPageView, trackInteraction } from './analytics.js';
import { initializeSearch } from './search.js';
import { storageManager } from './storage.js';
import { openNav, closeNav, handleResize } from './ui.js';
import { loadData } from './api.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize analytics
        initAnalytics();
        trackPageView('Home');

        // Initialize map
        await initMap();
        
        // Initialize search
        const searchManager = initializeSearch(map);

        // Initialize marker handlers
        initMarkerHandlers();

        // Load saved preferences and map state
        const preferences = storageManager.loadUserPreferences();
        const mapState = storageManager.loadMapState();
        if (mapState) {
            map.setCenter(mapState.center);
            map.setZoom(mapState.zoom);
        }

        // Load initial data
        await loadData();

        // Add event listeners
        window.addEventListener('resize', handleResize);
        
        // Track successful initialization
        trackInteraction('app_init', { success: true });
    } catch (error) {
        handleError(error, 'Failed to initialize application');
        trackInteraction('app_init', { success: false, error: error.message });
    }
});

// Make necessary functions available globally
window.openNav = openNav;
window.closeNav = closeNav;
window.AddCurrentWeatherContent = AddCurrentWeatherContent;
window.AddForecastWeatherContent = AddForecastWeatherContent;
window.AddRoadTravelConditionsContent = AddRoadTravelConditionsContent;
window.AddFireContent = AddFireContent;
window.AddOtherInfoContent = AddOtherInfoContent;
