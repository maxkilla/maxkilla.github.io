import { config, roadConditions } from './config.js';
import { handleError } from './utils.js';
import { asyncAddMarkers, clearMarkers } from './markers.js';

export function AddRoadTravelConditionsContent(layer, fn) {
    try {
        if (roadConditions.activeLayers[layer]) {
            roadConditions.activeLayers[layer] = false;
            clearMarkers(layer);
            checkIfAllChecked();
            return;
        }

        if (roadConditions.arrays[layer] === null) {
            roadConditions.arrays[layer] = [];
            LoadRoadTravelConditionsJSON(layer);
            return;
        }

        if (roadConditions.arrays[layer] === false) {
            handleError(null, `Failed to load ${layer} data`);
            return;
        }

        if (!roadConditions.markersGenerated[layer]) {
            asyncAddMarkers(roadConditions.arrays[layer].length, fn, null, true);
            roadConditions.markersGenerated[layer] = true;
        } else {
            showMarkers(layer);
        }

        roadConditions.activeLayers[layer] = true;
        checkIfAllChecked();

    } catch (error) {
        handleError(error, 'Failed to add road conditions content');
    }
}

export function checkIfAllChecked() {
    const checkAllButton = document.getElementById('checkall');
    if (!checkAllButton) return;

    let allChecked = true;
    let anyAvailable = false;

    for (const layer in roadConditions.activeLayers) {
        if (roadConditions.arrays[layer] !== false) {
            anyAvailable = true;
            if (!roadConditions.activeLayers[layer]) {
                allChecked = false;
                break;
            }
        }
    }

    checkAllButton.checked = allChecked && anyAvailable;
}

export function checkUncheckAll() {
    let shouldCheck = false;

    // Check if any layers are off
    for (const layer in roadConditions.activeLayers) {
        if (roadConditions.arrays[layer] !== false && !roadConditions.activeLayers[layer]) {
            shouldCheck = true;
            break;
        }
    }

    // Toggle all layers
    for (const layer in roadConditions.activeLayers) {
        if (roadConditions.arrays[layer] !== false) {
            if (shouldCheck && !roadConditions.activeLayers[layer]) {
                document.getElementById(layer).click();
            } else if (!shouldCheck && roadConditions.activeLayers[layer]) {
                document.getElementById(layer).click();
            }
        }
    }
}
