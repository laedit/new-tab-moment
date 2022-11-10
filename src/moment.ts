function refresh(settings: Settings, language: string): void {
    var dateTimeParts = new Intl.DateTimeFormat(language, {
        year: "numeric", month: "long", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric",
        hour12: settings.clock === "12"
    }).formatToParts(new Date());

    let hour = dateTimeParts.find(part => part.type == 'hour')?.value!;
    if (10 > Number(hour) && settings.leadingZero) {
        hour = "0" + hour;
    }
    const timeText: string = settings.timePattern.replace("H", hour)
        .replace("M", dateTimeParts.find(part => part.type == 'minute')?.value!)
        .replace("S", dateTimeParts.find(part => part.type == 'second')?.value!);
    document.getElementById("time")!.textContent = timeText;

    const dateText: string = settings.datePattern.replace("D", dateTimeParts.find(part => part.type == 'day')?.value!)
        .replace("Y", dateTimeParts.find(part => part.type == 'year')?.value!)
        .replace("M", dateTimeParts.find(part => part.type == 'month')?.value!);
    document.getElementById("date")!.textContent = dateText;
}

async function displayWeather({ tempUnit, location, displayIcon, activateDebugMode }: Settings, language: string): Promise<void> {
    try {
        const weatherResult = await Weather.getWeather(tempUnit, location, language, activateDebugMode);

        const conditionsElement: HTMLLinkElement = document.getElementById("weather-link") as HTMLLinkElement;

        const { degrees, description, link, code }: weather = weatherResult as weather;
        const weatherDegreesElement = document.getElementById("weather-degrees")!;
        weatherDegreesElement.textContent = degrees;
        weatherDegreesElement.after("°");
        document.getElementById("weather-description")!.textContent = `— ${description}`;

        conditionsElement.href = link;

        if (displayIcon) {
            const iconElement: HTMLElement = document.getElementById("weather-icon") as HTMLElement;
            iconElement.classList.add(`wi-owm-${code}`);
            iconElement.style.display = "block";
            iconElement.title = description;

            document.getElementById("weather-description")!.style.display = "none";
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
    setInterval(() => {
        refresh(settings, language);
    }, 1000);

    // display loaded page
    document.querySelector("body")!.classList.add("body-fadeIn");
}

function setStyle(settings: Settings): void {
    document.body.style.background = settings.background;
    const foreground: string = settings.foreground.toUpperCase();
    document.body.style.color = foreground;
    (document.getElementById("weather-link") as HTMLElement)!.style.color = foreground;

    if (settings.font === "thin") {
        (document.querySelector("body") as HTMLElement)!.style.fontWeight = "100";
        document.getElementById("date")!.style.fontWeight = "100";
        document.getElementById("weather-degrees")!.style.fontWeight = "300";
        document.getElementById("weather-description")!.style.fontWeight = "300";
    }

    document.getElementById("custom")!.textContent = settings.customCss;
}

async function load(userSettings: Settings, language: string): Promise<void> {
    // apply style settings
    setStyle(userSettings);

    startTime(userSettings, language);

    // get weather
    displayWeather(userSettings, language);

    return Promise.resolve();
}

document.addEventListener("DOMContentLoaded", async () => {
    const settings = await browser.storage.sync.get(defaultSettings);
    await load(settings, navigator.language);
});
