import { config } from './config.js';
import { handleError } from './utils.js';

export function markerClick(index) {
    try {
        config.stickyWindowOpen = true;
        HighlightMarkerAtIndex(index);
        ShowCurrentElement();
        CenterAtCurrentMarker();
    } catch (error) {
        handleError(error, 'Failed to handle marker click.');
    }
}

export function markerMouseOver(index) {
    if (!config.stickyWindowOpen) {
        HighlightMarkerAtIndex(index);
        ShowCurrentElement();
    }
}

export function markerMouseOut(index) {
    if (!config.stickyWindowOpen) {
        config.infoWindow.close();
        RestoreMarkerAtIndex();
    }
}

export function HighlightMarkerAtIndex(newIndex) {
    if (config.currentIndex >= 0) {
        RestoreMarkerAtIndex();
    }
    
    if (newIndex >= 0 && newIndex < config.markers.length) {
        const marker = config.markers[newIndex];
        if (marker) {
            marker.setZIndex(config.minZindex--);
            if (marker.highlighted) {
                marker.setIcon(marker.highlighted);
            }
        }
        config.currentIndex = newIndex;
    }
}

export function RestoreMarkerAtIndex() {
    if (config.currentIndex >= 0 && config.currentIndex < config.markers.length) {
        const marker = config.markers[config.currentIndex];
        if (marker) {
            if (marker.normal) {
                marker.setIcon(marker.normal);
            }
        }
        config.currentIndex = -1;
    }
}

export function asyncAddMarkers(len, fn, done, group) {
    let i = 0;
    const chunk = 100;
    const delay = 1;

    function doChunk() {
        let count = chunk;
        while (count-- && i < len) {
            fn(i++);
        }
        if (i < len) {
            setTimeout(doChunk, delay);
        } else {
            if (done) done();
            if (group) checkIfAllChecked();
        }
    }
    doChunk();
}

export function setNoImage(imageobject, cameraindex) {
    const img = document.getElementById(imageobject);
    if (img) {
        img.src = "images/noimage.jpg";
        img.alt = "No image available";
    }
}
