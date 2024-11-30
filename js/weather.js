import { config, weather } from './config.js';
import { handleError } from './utils.js';
import { asyncAddMarkers } from './markers.js';

export function setWeatherIcon(marker, value) {
    const icons = {
        'clear': 'images/weather/clear.png',
        'cloudy': 'images/weather/cloudy.png',
        'rain': 'images/weather/rain.png',
        'snow': 'images/weather/snow.png',
        'thunderstorm': 'images/weather/thunderstorm.png'
    };
    
    marker.setIcon({
        url: icons[value] || icons['clear'],
        scaledSize: new google.maps.Size(32, 32)
    });
}

export function setPrecipIcon(marker, value) {
    let iconPath;
    if (value === 0) {
        iconPath = 'images/weather/precip0.png';
    } else if (value < 0.1) {
        iconPath = 'images/weather/precip1.png';
    } else if (value < 0.25) {
        iconPath = 'images/weather/precip2.png';
    } else if (value < 0.5) {
        iconPath = 'images/weather/precip3.png';
    } else {
        iconPath = 'images/weather/precip4.png';
    }
    
    marker.setIcon({
        url: iconPath,
        scaledSize: new google.maps.Size(32, 32)
    });
}

export function setWindIcon(marker, speed, direction) {
    const iconPath = `images/weather/wind_${Math.round(direction / 22.5) * 22.5}.png`;
    const size = speed < 10 ? 24 : speed < 20 ? 32 : 40;
    
    marker.setIcon({
        url: iconPath,
        scaledSize: new google.maps.Size(size, size)
    });
}

export function AddCurrentWeatherContent(layer, legend, fn, url) {
    try {
        if (weather.current.layer === layer) {
            weather.current.layer = null;
            clearMarkers(layer);
            resetLegend();
            return;
        }

        if (weather.current.arrays[layer] === null) {
            weather.current.arrays[layer] = [];
            LoadWeatherJSON(layer, url);
            return;
        }

        if (weather.current.arrays[layer] === false) {
            handleError(null, `Failed to load ${layer} data`);
            return;
        }

        if (weather.current.layer) {
            clearMarkers(weather.current.layer);
        }

        weather.current.layer = layer;
        setLegend(legend);
        asyncAddMarkers(weather.current.arrays[layer].length, fn);

    } catch (error) {
        handleError(error, 'Failed to add weather content');
    }
}

export function AddForecastWeatherContent(layer, time) {
    try {
        const layerAndTime = `${layer}_${time}`;
        
        if (weather.forecast.layerAndTime === layerAndTime) {
            weather.forecast.layerAndTime = null;
            weather.forecast.layer = null;
            clearMarkers(layer);
            resetLegend();
            return;
        }

        if (weather.forecast.layer) {
            clearMarkers(weather.forecast.layer);
        }

        weather.forecast.layer = layer;
        weather.forecast.layerAndTime = layerAndTime;
        
        if (!weather.forecast.markers[layerAndTime]) {
            handleError(null, 'No forecast data available for this time');
            return;
        }

        showMarkers(layer);

    } catch (error) {
        handleError(error, 'Failed to add forecast weather content');
    }
}
