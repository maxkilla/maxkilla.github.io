import { config, fire } from './config.js';
import { handleError } from './utils.js';
import { asyncAddMarkers, clearMarkers } from './markers.js';

export function AddFireContent(layer, fn) {
    try {
        if (fire.activeLayers[layer]) {
            fire.activeLayers[layer] = false;
            clearMarkers(layer);
            return;
        }

        if (fire.arrays[layer] === null) {
            fire.arrays[layer] = [];
            LoadFireJSON(layer);
            return;
        }

        if (fire.arrays[layer] === false) {
            handleError(null, `Failed to load ${layer} fire data`);
            return;
        }

        if (!fire.markersGenerated[layer]) {
            asyncAddMarkers(fire.arrays[layer].length, fn);
            fire.markersGenerated[layer] = true;
        } else {
            showMarkers(layer);
        }

        fire.activeLayers[layer] = true;

    } catch (error) {
        handleError(error, 'Failed to add fire content');
    }
}

export function setFireIcon(marker, size) {
    const iconSize = size < 100 ? 24 : size < 1000 ? 32 : 40;
    
    marker.setIcon({
        url: 'images/fire.png',
        scaledSize: new google.maps.Size(iconSize, iconSize)
    });
}

export async function LoadFireJSON(layer) {
    try {
        const response = await fetch(config.fireDataUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        fire.arrays[layer] = processFireData(data);
        
        document.getElementById(layer).click();
    } catch (error) {
        fire.arrays[layer] = false;
        handleError(error, 'Failed to load fire data');
    }
}

function processFireData(data) {
    // Process the fire data according to your requirements
    return data.features.map(feature => ({
        position: {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
        },
        size: feature.properties.size || 0,
        name: feature.properties.name || 'Unknown Fire',
        status: feature.properties.status || 'Unknown',
        containment: feature.properties.containment || '0%'
    }));
}
