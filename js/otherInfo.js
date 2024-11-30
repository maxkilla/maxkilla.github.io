import { config, otherInfo } from './config.js';
import { handleError } from './utils.js';
import { asyncAddMarkers, clearMarkers } from './markers.js';

export function AddOtherInfoContent(layer, fn) {
    try {
        if (otherInfo.activeLayers[layer]) {
            otherInfo.activeLayers[layer] = false;
            clearMarkers(layer);
            return;
        }

        if (otherInfo.arrays[layer] === null) {
            otherInfo.arrays[layer] = [];
            LoadOtherInfoJSON(layer);
            return;
        }

        if (otherInfo.arrays[layer] === false) {
            handleError(null, `Failed to load ${layer} information`);
            return;
        }

        if (!otherInfo.markersGenerated[layer]) {
            asyncAddMarkers(otherInfo.arrays[layer].length, fn);
            otherInfo.markersGenerated[layer] = true;
        } else {
            showMarkers(layer);
        }

        otherInfo.activeLayers[layer] = true;

    } catch (error) {
        handleError(error, 'Failed to add other information content');
    }
}

export function setInfoIcon(marker, type) {
    const icons = {
        'rest_area': 'images/info/rest_area.png',
        'viewpoint': 'images/info/viewpoint.png',
        'hospital': 'images/info/hospital.png',
        'gas_station': 'images/info/gas.png',
        'food': 'images/info/food.png',
        'lodging': 'images/info/lodging.png'
    };

    marker.setIcon({
        url: icons[type] || 'images/info/default.png',
        scaledSize: new google.maps.Size(32, 32)
    });
}

export async function LoadOtherInfoJSON(layer) {
    try {
        const response = await fetch(config.otherInfoUrls[layer]);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        otherInfo.arrays[layer] = processOtherInfoData(data, layer);
        
        document.getElementById(layer).click();
    } catch (error) {
        otherInfo.arrays[layer] = false;
        handleError(error, 'Failed to load other information data');
    }
}

function processOtherInfoData(data, layer) {
    return data.features.map(feature => ({
        position: {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
        },
        type: layer,
        name: feature.properties.name || 'Unknown Location',
        description: feature.properties.description || '',
        amenities: feature.properties.amenities || []
    }));
}
