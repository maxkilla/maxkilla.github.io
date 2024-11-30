import { config } from './config.js';
import { handleError } from './utils.js';
import { trackInteraction } from './analytics.js';

export class SearchManager {
    constructor(map) {
        this.map = map;
        this.searchBox = null;
        this.searchMarkers = [];
        this.initSearchBox();
    }

    initSearchBox() {
        try {
            // Create the search box input
            const input = document.getElementById('pac-input');
            if (!input) return;

            this.searchBox = new google.maps.places.SearchBox(input);
            this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            // Bias the SearchBox results towards current map's viewport
            this.map.addListener('bounds_changed', () => {
                this.searchBox.setBounds(this.map.getBounds());
            });

            // Listen for the event fired when the user selects a prediction
            this.searchBox.addListener('places_changed', () => {
                this.handlePlacesChanged();
            });

        } catch (error) {
            handleError(error, 'Failed to initialize search box');
        }
    }

    handlePlacesChanged() {
        try {
            const places = this.searchBox.getPlaces();
            if (!places.length) return;

            // Clear existing markers
            this.clearSearchMarkers();

            // For each place, get the icon, name and location
            const bounds = new google.maps.LatLngBounds();
            
            places.forEach(place => {
                if (!place.geometry || !place.geometry.location) {
                    console.log('Returned place contains no geometry');
                    return;
                }

                // Create a marker for each place
                const marker = new google.maps.Marker({
                    map: this.map,
                    icon: {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    },
                    title: place.name,
                    position: place.geometry.location
                });

                this.searchMarkers.push(marker);

                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });

            this.map.fitBounds(bounds);

            // Track search interaction
            trackInteraction('search', {
                query: document.getElementById('pac-input').value,
                results: places.length
            });

        } catch (error) {
            handleError(error, 'Failed to handle places changed');
        }
    }

    clearSearchMarkers() {
        this.searchMarkers.forEach(marker => marker.setMap(null));
        this.searchMarkers = [];
    }
}

export function initializeSearch(map) {
    return new SearchManager(map);
}
