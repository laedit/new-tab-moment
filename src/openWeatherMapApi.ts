/**
 * We need convert https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language
 * to https://openweathermap.org/current#multi
 */
const openWeatherMapLanguageRemap: { [key: string]: string } = {
    "cs": "cz",
    "ko": "kr",
    "lv": "la",
    "pt-br": "pt_br",
    "sq": "al",
    "zh-cn": "zh_cn",
    "zh-tw": "zh_tw"
};

type apiUnit = "metric" | "imperial";

type apiParametersBase = {
    appid: string;
}

type currentWeatherApiParameters = apiParametersBase & {
    lat: number;
    lon: number;
    lang: string;
    units: apiUnit;
}

type geocodingApiParameters = apiParametersBase & {
    q: string;
}

class OpenWeatherMapApi {
    public static async getGeocoding(location: string): Promise<{ lat: number, lon: number }> {
        const apiParameters: geocodingApiParameters = {
            q: location,
            appid: OwmGeocodingKey
        };
        const response = await fetch(this.buildUrl("http://api.openweathermap.org/geo/1.0/direct", apiParameters));
        const geocodingData = await response.json();

        if (geocodingData.length === 0) {
            throw new GeocodingNoResultsError(location);
        }

        const latLon = {
            lat: geocodingData[0].lat,
            lon: geocodingData[0].lon
        };
        return latLon;
    }

    public static async getCurrentWeather(latitude: number, longitude: number, measurementUnits: MeasurementUnits, language: string, debugMode: boolean): Promise<weather> {
        const apiParameters: currentWeatherApiParameters = {
            lat: latitude,
            lon: longitude,
            lang: this.getLanguageForRequest(language),
            units: measurementUnits,
            appid: OwmCurrentWeatherKey
        };
        if (debugMode) {
            console.debug("Weather api url parameters", apiParameters);
        }
        const apiUrl = this.buildUrl("https://api.openweathermap.org/data/2.5/weather", apiParameters);

        const response = await fetch(apiUrl);
        const weatherData = await response.json();

        if (debugMode) {
            console.debug("Weather api result", weatherData);
        }

        const weather: weather = {
            degrees: Math.round(weatherData.main.temp).toString(),
            description: weatherData.weather[0].description,
            link: `https://openweathermap.org/city/${weatherData.id}`,
            code: weatherData.weather[0].id,
            pressure: (weatherData.main.grnd_level | weatherData.main.sea_level | weatherData.main.pressure).toString(),
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind.speed,
            windDegrees: weatherData.wind.deg,
            windGust: weatherData.wind.gust,
            feels_like: Math.round(weatherData.main.feels_like).toString()
        };

        return Promise.resolve(weather);
    }

    private static getLanguageForRequest(language: string): string {
        const lang = language.substring(0, 2);
        let owmLang = openWeatherMapLanguageRemap[language.toLowerCase()];
        if (owmLang === undefined) {
            owmLang = openWeatherMapLanguageRemap[lang];
        }
        return owmLang || lang;
    }

    private static buildUrl(baseUrl: string, parameters: Record<string, string | number>): string {
        const searchParams = new URLSearchParams();

        Object.entries(parameters).map(([key, val]) => {
            if (val !== undefined) {
                searchParams.append(key, val.toString());
            }
        });
        return `${baseUrl}?${searchParams.toString()}`;
    }
}

class GeocodingNoResultsError extends Error {
    constructor(location:string) {
        super(`No results when getting latitude and longitude of '${location}'.`);
        this.name = 'GeocodingError';
    }
}
