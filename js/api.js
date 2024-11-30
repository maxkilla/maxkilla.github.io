import { config, roadConditions, weather, fire, otherInfo } from './config.js';
import { handleError } from './utils.js';

// Generic JSON loader
async function loadJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        handleError(error, 'Failed to load data');
        return null;
    }
}

// Load Weather Data
export async function LoadWeatherJSON() {
    const urls = {
        CurrentAirTemperature: 'data/current/airtemp.json',
        Humidity: 'data/current/humidity.json',
        Precipitation1hour: 'data/current/precip1hour.json',
        Precipitationt24hour: 'data/current/precip24hour.json',
        AHPS: 'data/current/ahps.json',
        Wind: 'data/current/wind.json'
    };

    for (const [key, url] of Object.entries(urls)) {
        weather.current.arrays[key] = await loadJSON(url);
    }
}

// Load Road Travel Conditions
export async function LoadRoadTravelConditionsJSON(layer, url) {
    try {
        roadConditions.arrays[layer] = await loadJSON(url);
        return true;
    } catch (error) {
        roadConditions.arrays[layer] = false;
        handleError(error, `Failed to load ${layer} data`);
        return false;
    }
}

// Load Fire Data
export async function LoadFireJSON() {
    const urls = {
        FireIncidents: 'data/fire/incidents.json',
        FireDetectors: 'data/fire/detectors.json'
    };

    for (const [key, url] of Object.entries(urls)) {
        fire.arrays[key] = await loadJSON(url);
    }
}

// Load Other Info
export async function LoadOtherInfoJSON() {
    const urls = {
        RestAreas: 'data/other/restareas.json',
        FeaturesOfInterest: 'data/other/features.json',
        TruckScales: 'data/other/scales.json',
        SummitLocations: 'data/other/summits.json'
    };

    for (const [key, url] of Object.entries(urls)) {
        otherInfo.arrays[key] = await loadJSON(url);
    }
}
