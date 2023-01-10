let elementsMap: { [key: string]: HTMLElement };
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

async function displayWeather({ tempUnit, location, displayIcon, activateDebugMode }: Settings, language: string): Promise<void> {
    try {
        const weatherResult = await Weather.getWeather(tempUnit, location, language, activateDebugMode);

        const conditionsElement = elementsMap.weatherLink as HTMLLinkElement;

        const { degrees, description, link, code }: weather = weatherResult as weather;
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
    } catch (error) {
        console.error("Error during weather display", error);
        let errorElement = document.getElementById("error")!;

        if (error instanceof GeolocationUndefinedError || IsPositionError(error)) {
            let errorLink = document.createElement("a");
            errorLink.text = "Your browser doesn't handle geolocation, please provide a location in the options.";
            errorLink.onclick = () => browser.runtime.openOptionsPage();
            errorElement.appendChild(errorLink);

        }
        else {
            errorElement.innerText = "An error occurred during weather display. See browser console for details.";
        }
    }
    finally {
        document.getElementById("loader")!.style.display = "none";

        const weatherBlock: HTMLLinkElement = document.getElementById("weather") as HTMLLinkElement;
        weatherBlock.style.display = "block";
        weatherBlock.classList.add("conditions-fadeIn");
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
    document.documentElement.style.background = backgroundColor;
    document.documentElement.style.color = foregroundColor;
    elementsMap.weatherLink.style.color = foregroundColor;
}

function setFont(settings: Settings) {
    document.documentElement.dataset.fontType = settings.font;
}

function setBackgroundImage(settings: Settings) {
    document.body.style.backgroundImage = `url(${settings.backgroundImageUrl})`;
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "contain";
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
        };
    }

    // apply style settings
    setStyle(userSettings);

    startTime(userSettings, language);

    // get weather
    displayWeather(userSettings, language);

    return;
}

async function getSettings() {
    return browser.storage.sync.get(defaultSettings);
}

// @ts-ignore // TODO need update @types/firefox-webext-browser
browser.theme.onUpdated.addListener(() => setColorScheme());

browser.storage.onChanged.addListener(async () => load());
document.addEventListener("DOMContentLoaded", async () => load());
