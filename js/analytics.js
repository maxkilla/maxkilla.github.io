import { config } from './config.js';
import { handleError } from './utils.js';

// Initialize Google Analytics
export function initAnalytics() {
    try {
        // Load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', config.googleAnalyticsId);

        window.gtag = gtag;
    } catch (error) {
        handleError(error, 'Failed to initialize Google Analytics');
    }
}

// Track page views
export function trackPageView(pageName) {
    try {
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_title: pageName,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    } catch (error) {
        handleError(error, 'Failed to track page view');
    }
}

// Track events
export function trackEvent(category, action, label = null, value = null) {
    try {
        if (window.gtag) {
            const eventParams = {
                event_category: category,
                event_action: action
            };

            if (label) eventParams.event_label = label;
            if (value) eventParams.value = value;

            window.gtag('event', action, eventParams);
        }
    } catch (error) {
        handleError(error, 'Failed to track event');
    }
}

// Track user interactions
export function trackInteraction(interactionType, details) {
    try {
        switch (interactionType) {
            case 'layer_toggle':
                trackEvent('Layer', 'toggle', details.layer, details.active ? 1 : 0);
                break;
            case 'marker_click':
                trackEvent('Marker', 'click', details.type);
                break;
            case 'search':
                trackEvent('Search', 'perform', details.query);
                break;
            case 'filter':
                trackEvent('Filter', 'apply', details.filter);
                break;
            default:
                trackEvent('Other', interactionType, JSON.stringify(details));
        }
    } catch (error) {
        handleError(error, 'Failed to track interaction');
    }
}

// Track errors
export function trackError(errorType, errorMessage) {
    try {
        trackEvent('Error', errorType, errorMessage);
    } catch (error) {
        console.error('Failed to track error:', error);
    }
}
