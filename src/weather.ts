class Weather {

    public static async getWeather(measurementUnits: MeasurementUnits, location: string, language: string, debugMode: boolean): Promise<weather> {
        location = location.replace(/\s/g, "").toLocaleLowerCase();
        return LocalStorage.get(`currentWeather:${location}:${language}:${measurementUnits}`, async () => await this.getCurrentWeather(measurementUnits, location, language, debugMode), 60 * 5000); // 5 min
    }

    private static async getCurrentWeather(measurementUnits: MeasurementUnits, location: string, language: string, debugMode: boolean): Promise<weather> {
        let latitude: number;
        let longitude: number;

        if (location === "") {
            if (debugMode) {
                console.debug("Getting geolocation from browser");
            }
            if (navigator.geolocation === undefined) {
                console.debug("navigator.geolocation is undefined in your browser");
                throw new GeolocationUndefinedError();
            }

            const position = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
            if (debugMode) {
                console.debug("Geolocation result", position);
            }
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        }
        else {
            const geocodingMap = await LocalStorage.get<geocodingMap>("geocodingMap") ?? {};
            let locationGeo = geocodingMap[location];
            if (locationGeo) {
                latitude = locationGeo.lat;
                longitude = locationGeo.lon;
            }
            else {
                locationGeo = await OpenWeatherMapApi.getGeocoding(location);
                geocodingMap[location] = locationGeo;
                LocalStorage.set("geocodingMap", geocodingMap);
                latitude = locationGeo.lat;
                longitude = locationGeo.lon;
            }
        }

        return await OpenWeatherMapApi.getCurrentWeather(latitude, longitude, measurementUnits, language, debugMode);
    }
}

type weather = {
    degrees: string;
    description: string;
    link: string;
    code: string;
    pressure: string;
    humidity: string;
    windSpeed: string;
    windDegrees: string;
    windGust: string;
}

type geocodingMap = Record<string, { lat: number, lon: number }>

class GeolocationUndefinedError extends Error {
    constructor() {
        super("Geolocation is not available in your browser (navigator.geolocation is undefined).");
        this.name = 'GeolocationUndefinedError';
    }
}
