import { handleError } from './utils.js';

export class StorageManager {
    constructor() {
        this.storageAvailable = this.checkStorageAvailability();
    }

    checkStorageAvailability() {
        try {
            const storage = window.localStorage;
            const x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return false;
        }
    }

    saveUserPreferences(preferences) {
        if (!this.storageAvailable) return;

        try {
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
        } catch (error) {
            handleError(error, 'Failed to save user preferences');
        }
    }

    loadUserPreferences() {
        if (!this.storageAvailable) return null;

        try {
            const preferences = localStorage.getItem('userPreferences');
            return preferences ? JSON.parse(preferences) : null;
        } catch (error) {
            handleError(error, 'Failed to load user preferences');
            return null;
        }
    }

    saveMapState(state) {
        if (!this.storageAvailable) return;

        try {
            localStorage.setItem('mapState', JSON.stringify({
                center: state.center,
                zoom: state.zoom,
                activeLayers: state.activeLayers,
                timestamp: Date.now()
            }));
        } catch (error) {
            handleError(error, 'Failed to save map state');
        }
    }

    loadMapState() {
        if (!this.storageAvailable) return null;

        try {
            const state = localStorage.getItem('mapState');
            if (!state) return null;

            const parsedState = JSON.parse(state);
            
            // Check if state is older than 24 hours
            if (Date.now() - parsedState.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('mapState');
                return null;
            }

            return parsedState;
        } catch (error) {
            handleError(error, 'Failed to load map state');
            return null;
        }
    }

    clearStorage() {
        if (!this.storageAvailable) return;

        try {
            localStorage.clear();
        } catch (error) {
            handleError(error, 'Failed to clear storage');
        }
    }

    saveToCache(key, data, expirationMinutes = 60) {
        if (!this.storageAvailable) return;

        try {
            const item = {
                data: data,
                timestamp: Date.now(),
                expirationMinutes: expirationMinutes
            };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (error) {
            handleError(error, 'Failed to save to cache');
        }
    }

    loadFromCache(key) {
        if (!this.storageAvailable) return null;

        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            const parsedItem = JSON.parse(item);
            const expirationTime = parsedItem.timestamp + (parsedItem.expirationMinutes * 60 * 1000);

            if (Date.now() > expirationTime) {
                localStorage.removeItem(key);
                return null;
            }

            return parsedItem.data;
        } catch (error) {
            handleError(error, 'Failed to load from cache');
            return null;
        }
    }
}

export const storageManager = new StorageManager();
