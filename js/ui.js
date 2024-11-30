import { config } from './config.js';
import { handleError } from './utils.js';

export function openNav() {
    document.getElementById("mySidenav").style.width = "350px";
    document.getElementById("main").style.marginLeft = "350px";
}

export function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

export function setLegend(legend) {
    try {
        const legendDiv = document.getElementById('legend');
        if (!legendDiv) return;

        legendDiv.innerHTML = legend;
        legendDiv.style.display = 'block';
    } catch (error) {
        handleError(error, 'Failed to set legend');
    }
}

export function resetLegend() {
    const legendDiv = document.getElementById('legend');
    if (legendDiv) {
        legendDiv.style.display = 'none';
        legendDiv.innerHTML = '';
    }
}

export function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
    }
}

export function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

export function showError(message) {
    const errorContainer = document.getElementById('error-container');
    if (!errorContainer) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorContainer.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

export function closeAllactiveTabs(except) {
    const tabs = ['RoadTravelConditions', 'CurrentWeather', 'ForecastWeather', 'Fire', 'OtherInfo', 'About'];
    
    tabs.forEach(tab => {
        if (tab !== except) {
            const element = document.getElementById(tab);
            if (element) {
                element.classList.remove('active');
                const content = document.getElementById(`${tab}content`);
                if (content) {
                    content.style.display = 'none';
                }
            }
        }
    });
}

export function scrollintoview(tab) {
    const element = document.getElementById(tab);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Window resize handler
export function handleResize() {
    const width = window.innerWidth;
    const sidenav = document.getElementById('mySidenav');
    const main = document.getElementById('main');
    
    if (width <= 768) {
        sidenav.style.width = '0';
        main.style.marginLeft = '0';
    }
}
