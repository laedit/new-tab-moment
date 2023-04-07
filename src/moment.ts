let elementsMap: Record<string, HTMLElement>;
let interval: number;

function refresh(settings: Settings, language: string): void {
    var dateTimeParts = new Intl.DateTimeFormat(language, {
        year: "numeric", month: "long", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric",
        hour12: settings.clock === "12"
    }).formatToParts(new Date());

    let hour = dateTimeParts.find(part => part.type == 'hour')?.value!;
    if (settings.leadingZero && settings.clock === "12" && hour.length === 1) {
        hour = "0" + hour;
    }
    const timeText = settings.timePattern.replace("H", hour)
        .replace("M", dateTimeParts.find(part => part.type == 'minute')?.value!)
        .replace("S", dateTimeParts.find(part => part.type == 'second')?.value!);
    setValue(elementsMap.time, timeText);

    const dateText = settings.datePattern.replace("D", dateTimeParts.find(part => part.type == 'day')?.value!)
        .replace("Y", dateTimeParts.find(part => part.type == 'year')?.value!)
        .replace("M", dateTimeParts.find(part => part.type == 'month')?.value!);
    setValue(elementsMap.date, dateText);
}

async function displayWeather({ measurementUnits, location, displayIcon, activateDebugMode, displayHumidity, displayPressure, displayWind }: Settings, language: string): Promise<void> {
    try {
        elementsMap.error.replaceChildren(); // reset display
        elementsMap.weatherLink.style.display = "block";

        const weatherResult = await Weather.getWeather(measurementUnits, location, language, activateDebugMode);

        const conditionsElement = elementsMap.weatherLink as HTMLLinkElement;

        const { degrees, description, link, code }: weather = weatherResult;
        setValue(elementsMap.weatherDegrees, `${degrees}°`);
        setValue(elementsMap.weatherDescription, `— ${description}`);

        conditionsElement.href = link;

        if (displayIcon) {
            const iconElement = elementsMap.weatherIcon;
            iconElement.classList.add(`wi-owm-${code}`);
            iconElement.style.display = "block";
            iconElement.title = description;

            elementsMap.weatherDescription.style.display = "none";
        }

        let columnIndex = 1;
        elementsMap.pressure.style.display = "none";
        if (displayPressure) {
            setValue(elementsMap.pressureText, `${weatherResult.pressure} hPa`);
            elementsMap.pressure.style.display = "block";
            elementsMap.pressure.style.gridColumn = columnIndex.toString();
            columnIndex++;
        }

        elementsMap.humidity.style.display = "none";
        if (displayHumidity) {
            setValue(elementsMap.humidityText, `${weatherResult.humidity} %`);
            elementsMap.humidity.style.display = "block";
            elementsMap.humidity.style.gridColumn = columnIndex.toString();
            columnIndex++;
        }

        elementsMap.wind.style.display = "none";
        if (displayWind) {
            let windUnit = measurementUnits === "metric" ? 'm/s' : 'm/h'; // MeasurementUnits = imperial -> miles/hour
            setValue(elementsMap.windText, `${weatherResult.windSpeed} ${windUnit}`);
            elementsMap.gust.style.display = 'none';
            if (weatherResult.windGust) {
                elementsMap.gust.style.display = 'block';
                setValue(elementsMap.windGustText, `${weatherResult.windGust} ${windUnit}`); // MeasurementUnits // imperial -> miles/hour
            }
            elementsMap.windIcon.classList.add(`towards-${weatherResult.windDegrees}-deg`);
            elementsMap.wind.style.display = "block";
            elementsMap.wind.style.gridColumn = columnIndex.toString();
            columnIndex++;
        }

    } catch (error) {
        console.error("Error during weather display", error);

        if (error instanceof GeolocationUndefinedError || IsPositionError(error)) {
            SetErrorMessage("Your browser doesn't handle geolocation, please provide a location in the options.", true);
        }
        if (error instanceof GeocodingNoResultsError) {
            SetErrorMessage(`No results when getting latitude and longitude of '${location}'. Please check the location in the options.`, true);
        }
        else {
            SetErrorMessage("An error occurred during weather display. See browser console for details.");
        }
    }
    finally {
        document.getElementById("loader")!.style.display = "none";

        const weatherBlock: HTMLLinkElement = document.getElementById("weather") as HTMLLinkElement;
        weatherBlock.style.display = "block";
        weatherBlock.classList.add("conditions-fadeIn");
    }
}

function SetErrorMessage(errorMessage: string, linkToOptions: boolean = false): void {
    elementsMap.weatherLink.style.display = "none";

    if (linkToOptions) {
        let errorLink = document.createElement("a");
        errorLink.text = errorMessage;
        errorLink.onclick = () => browser.runtime.openOptionsPage();
        elementsMap.error.appendChild(errorLink);
    }
    else {
        elementsMap.error.innerText = errorMessage;
    }
}

function IsPositionError(error: any): error is GeolocationPositionError {
    // from https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
    return error.constructor.name === "GeolocationPositionError"
        || ["code", "message", "TIMEOUT", "PERMISSION_DENIED", "POSITION_UNAVAILABLE"]
            .every(propertyName => error.__proto__.hasOwnProperty(propertyName));
}

function startTime(settings: Settings, language: string): void {
    // set time
    refresh(settings, language);
    clearInterval(interval);
    interval = setInterval(() => {
        refresh(settings, language);
    }, 1000);

    // display loaded page
    document.body.classList.add("body-fadeIn");
}

async function setColorScheme(settings?: Settings) {
    settings = settings || await getSettings();
    let foregroundColor: string = '';
    let backgroundColor: string = '';

    if (settings.colorScheme === "custom") {
        backgroundColor = settings.background;
        foregroundColor = settings.foreground;
    }
    document.documentElement.dataset.colorScheme = settings.colorScheme;
    document.documentElement.style.backgroundColor = backgroundColor;
    document.documentElement.style.color = foregroundColor;
    elementsMap.weatherLink.style.color = foregroundColor;
}

function setFont(settings: Settings) {
    document.documentElement.dataset.fontType = settings.font;
}

function setBackgroundImage(settings: Settings) {
    if (settings.backgroundImageUrl) {
        document.body.style.backgroundImage = `url(${settings.backgroundImageUrl})`;
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundSize = "contain";
    }
    else {
        document.body.removeAttribute('style');
    }
}

function setStyle(settings: Settings): void {
    setColorScheme(settings);
    setFont(settings);
    setBackgroundImage(settings);
    setValue(document.getElementById("custom")!, settings.customCss);
}

function setValue(elm: HTMLElement, value: string | number) {
    const strVal = typeof value === "string" ? value : value.toString();
    if (elm.textContent !== strVal) {
        elm.textContent = strVal;
    }
}

async function load(): Promise<void> {
    const userSettings = await getSettings();
    const language = navigator.language;

    if (!elementsMap) {
        elementsMap = {
            time: document.getElementById("time")!,
            date: document.getElementById("date")!,
            weatherLink: document.getElementById("weather-link")!,
            weatherIcon: document.getElementById("weather-icon")!,
            weatherDegrees: document.getElementById("weather-degrees")!,
            weatherDescription: document.getElementById("weather-description")!,
            pressureText: document.getElementById("pressure-text")!,
            pressure: document.getElementById("pressure")!,
            humidityText: document.getElementById("humidity-text")!,
            humidity: document.getElementById("humidity")!,
            windText: document.getElementById("wind-text")!,
            wind: document.getElementById("wind")!,
            windIcon: document.getElementById("wind-icon")!,
            windGustText: document.getElementById("wind-gust-text")!,
            gust: document.getElementById("gust")!,
            error: document.getElementById("error")!,
        };
    }

    // apply style settings
    setStyle(userSettings);

    startTime(userSettings, language);

    // get weather
    displayWeather(userSettings, language);

    // display cog icon
    if (userSettings.displayOptionsButton) {
        let optionsLink = document.createElement("a");
        optionsLink.setAttribute('id', 'options');

        if (isBackgroundDark(userSettings)) {
            optionsLink.style.backgroundImage = "url('../images/cog-light.png')";
        }
        else {
            optionsLink.style.backgroundImage = "url('../images/cog-dark.png')";
        }

        optionsLink.onclick = () => browser.runtime.openOptionsPage();
        document.body.appendChild(optionsLink);
    }
}

function isBackgroundDark(settings: Settings): boolean {
    switch (settings.colorScheme) {
        case 'dark': return true;
        case 'light': return false;
        case 'system': return window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches;
    }
    var rgbRegex = /^rgb\(([0-9]{1,3}),[ +]?([0-9]{1,3}),[ +]?([0-9]{1,3})\)$/;
    var rgbMatch = document.documentElement.style.backgroundColor.match(rgbRegex)!;
    var r = parseFloat(rgbMatch[1]);
    var g = parseFloat(rgbMatch[2]);
    var b = parseFloat(rgbMatch[3]);

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma < 128;
}

async function getSettings() {
    return browser.storage.sync.get(defaultSettings);
}

browser.storage.onChanged.addListener(async () => load());
document.addEventListener("DOMContentLoaded", async () => load());
