// Configuration and Global Variables
export const config = {
    map: null,
    infoWindow: null,
    markers: [],
    currentIndex: -1,
    minZindex: 1000,
    mapLoaded: false,
    timerID: -1,
    timeoutID: -1,
    wxOverlay: null,
    stickyWindowOpen: false,
    menuVariable: "RoadTravelConditions"
};

// Road/Travel Conditions Configuration
export const roadConditions = {
    activeLayers: {
        Incident: false,
        Chain: false,
        CCTV: false,
        CMS: false,
        RWIS: false,
        RoadInfo: false,
        Traffic: false,
        Weather: false
    },
    markersGenerated: {
        Incident: false,
        Chain: false,
        CCTV: false,
        CMS: false,
        RWIS: false,
        RoadInfo: false
    },
    arrays: {
        Chain: null,
        Incident: null,
        CCTV: null,
        CMS: null,
        RWIS: null,
        RoadInfo: null,
        Traffic: null
    }
};

// Weather Configuration
export const weather = {
    current: {
        arrays: {
            CurrentAirTemperature: null,
            Humidity: null,
            Precipitation1hour: null,
            Precipitationt24hour: null,
            AHPS: null,
            Wind: null
        },
        layer: null
    },
    forecast: {
        arrays: {
            ForecastAirTemperature: null,
            WindSpeed: null,
            WindGustSpeed: null,
            ForecastHumidity: null,
            SkyCover: null,
            Precipitation12hour: null,
            Precipitation6hour: null,
            Snow: null,
            Weather: null
        },
        timeHTML: {},
        markers: {},
        layer: null,
        layerAndTime: null
    }
};

// Fire Configuration
export const fire = {
    arrays: {
        FireIncidents: null,
        FireDetectors: null
    },
    layer: null
};

// Other Info Configuration
export const otherInfo = {
    arrays: {
        RestAreas: null,
        FeaturesOfInterest: null,
        TruckScales: null,
        SummitLocations: null
    },
    markersGenerated: {
        RestAreas: false,
        FeaturesOfInterest: false,
        TruckScales: false,
        SummitLocations: false
    },
    activeLayers: {
        RestAreas: true,
        FeaturesOfInterest: false,
        TruckScales: false,
        SummitLocations: false
    }
};
