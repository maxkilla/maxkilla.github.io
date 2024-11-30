import { config } from './config.js';
import { handleError } from './utils.js';

export function initMap() {
    try {
        const mapOptions = {
            center: new google.maps.LatLng(41.0, -120.5),
            zoom: 6,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            scaleControl: true,
            streetViewControl: false,
            fullscreenControl: false
        };

        config.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        config.infoWindow = new google.maps.InfoWindow();

        // Add event listeners
        config.map.addListener('click', () => {
            if (!config.stickyWindowOpen) {
                config.infoWindow.close();
            }
        });

        config.infoWindow.addListener('closeclick', () => {
            config.stickyWindowOpen = false;
        });

        // Set map loaded flag
        google.maps.event.addListenerOnce(config.map, 'tilesloaded', () => {
            config.mapLoaded = true;
        });

    } catch (error) {
        handleError(error, 'Failed to initialize map. Please refresh the page.');
    }
}

export function setMapOnAll(map, variable) {
    if (config.markers && config.markers.length > 0) {
        config.markers.forEach(marker => {
            if (marker.elementtype === variable) {
                marker.setMap(map);
            }
        });
    }
}

export function clearMarkers(variable) {
    setMapOnAll(null, variable);
}

export function showMarkers(variable) {
    setMapOnAll(config.map, variable);
}

export function clearAllMarkers() {
    if (config.markers && config.markers.length > 0) {
        config.markers.forEach(marker => marker.setMap(null));
    }
    config.markers = [];
}

export function gotoPosition(position) {
    try {
        const pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        config.map.setCenter(pos);
        config.map.setZoom(12);
    } catch (error) {
        handleError(error, 'Failed to center map on position.');
    }
}
