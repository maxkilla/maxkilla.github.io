// Utility Functions
export function handleVisibilityChange() {
    if (document.hidden) {
        LogAnalyticsEvent('visibility', 'hidden', '');
    } else {
        LogAnalyticsEvent('visibility', 'visible', '');
    }
}

export function LogAnalyticsEvent(eventCategory, eventAction, eventLabel) {
    try {
        gtag('event', eventAction, {
            'event_category': eventCategory,
            'event_label': eventLabel
        });
    } catch (e) {
        console.error('Analytics error:', e);
    }
}

// Date Formatting Functions
export function formatDate(timestring) {
    const date = new Date(timestring);
    return `${getHour(date)}:${getMinute(date)} ${getAMPM(date)} ${getTimezoneName(date)}, ${getMonthName(date)} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatDate2(timestring) {
    const date = new Date(timestring);
    return `${getHour(date)}${getAMPM(date)} ${getTimezoneName(date)}, ${getDayName(date)}, ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// Cookie Functions
export function setCookie(cname, cvalue) {
    const d = new Date();
    d.setTime(d.getTime() + (365*24*60*60*1000));
    document.cookie = cname + "=" + cvalue + ";expires="+ d.toUTCString() + ";path=/";
}

export function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Error Handling
export function handleError(error, userMessage) {
    console.error('Error:', error);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = userMessage || 'An error occurred. Please try again later.';
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Map Utility Functions
export function fromLatLngToPoint(latLng, map) {
    const topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
    const bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
    const scale = Math.pow(2, map.getZoom());
    const worldPoint = map.getProjection().fromLatLngToPoint(latLng);
    return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}

export function point2LatLng(point, map) {
    const topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
    const bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
    const scale = Math.pow(2, map.getZoom());
    const worldPoint = new google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y);
    return map.getProjection().fromPointToLatLng(worldPoint);
}
