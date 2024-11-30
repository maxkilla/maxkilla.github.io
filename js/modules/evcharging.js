class EVChargingModule {
    constructor(map) {
        this.map = map;
        this.markers = L.layerGroup();
        this.settings = {
            apiKey: '',
            enabled: false
        };
    }

    async initialize() {
        this.settings = await window.settingsManager.getModuleSettings('evcharging') || this.settings;
        if (this.settings.enabled && this.settings.apiKey) {
            this.loadChargingStations();
        }
    }

    async loadChargingStations() {
        try {
            const bounds = this.map.getBounds();
            const response = await fetch(`https://api.openchargemap.io/v3/poi/?output=json&maxresults=100&compact=true&verbose=false&latitude=${bounds.getCenter().lat}&longitude=${bounds.getCenter().lng}&distance=50&distanceunit=km&key=${this.settings.apiKey}`);
            const stations = await response.json();
            
            this.markers.clearLayers();
            
            stations.forEach(station => {
                const marker = L.marker([station.AddressInfo.Latitude, station.AddressInfo.Longitude], {
                    icon: L.divIcon({
                        className: 'ev-station-marker',
                        html: '<i class="fas fa-charging-station"></i>',
                        iconSize: [30, 30]
                    })
                });

                const connectors = station.Connections.map(conn => 
                    `<div class="connector-info">
                        <strong>${conn.ConnectionType?.Title || 'Unknown'}</strong>
                        ${conn.PowerKW ? ` - ${conn.PowerKW}kW` : ''}
                    </div>`
                ).join('');

                marker.bindPopup(`
                    <div class="station-popup">
                        <h3>${station.AddressInfo.Title}</h3>
                        <p>${station.AddressInfo.AddressLine1}</p>
                        <p>${station.AddressInfo.Town}, ${station.AddressInfo.StateOrProvince}</p>
                        <h4>Available Connectors:</h4>
                        ${connectors}
                        ${station.UsageCost ? `<p><strong>Cost:</strong> ${station.UsageCost}</p>` : ''}
                        <p><strong>Status:</strong> ${station.StatusType?.Title || 'Unknown'}</p>
                    </div>
                `);
                
                this.markers.addLayer(marker);
            });
            
            if (this.settings.enabled) {
                this.markers.addTo(this.map);
            }
        } catch (error) {
            console.error('Error loading charging stations:', error);
        }
    }

    getSettings() {
        return {
            name: 'evcharging',
            title: 'EV Charging Stations',
            description: 'Display electric vehicle charging stations on the map using OpenChargeMap data.',
            fields: [
                {
                    name: 'apiKey',
                    title: 'API Key',
                    type: 'text',
                    value: this.settings.apiKey,
                    required: true
                },
                {
                    name: 'enabled',
                    title: 'Enable EV Charging Stations',
                    type: 'checkbox',
                    value: this.settings.enabled
                }
            ]
        };
    }

    async updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        await window.settingsManager.saveModuleSettings('evcharging', this.settings);
        
        if (this.settings.enabled && this.settings.apiKey) {
            this.loadChargingStations();
        } else {
            this.markers.clearLayers();
            this.markers.remove();
        }
    }

    onMapMoveEnd() {
        if (this.settings.enabled && this.settings.apiKey) {
            this.loadChargingStations();
        }
    }
}

// Register the module
window.addEventListener('DOMContentLoaded', () => {
    const map = window.map; // Assuming the map is stored in window.map
    const evModule = new EVChargingModule(map);
    window.moduleManager.registerModule('evcharging', evModule);
});
