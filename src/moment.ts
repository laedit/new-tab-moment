function refresh(settings: Settings, language: string): void {
    const currentDate: Date = new Date();
    let currentHours: number = currentDate.getHours();
    const currentMinutes: number = currentDate.getMinutes();
    const currentSeconds: number = currentDate.getSeconds();
    if (settings.clock === "12" && currentHours > 12) {
        currentHours = currentHours - 12;
    }

    let hoursDisplayed: string = currentHours.toString();
    if (10 > currentHours && settings.leadingZero) {
        hoursDisplayed = "0" + currentHours;
    }

    let minutesDisplayed: string = currentMinutes.toString();
    if (10 > currentMinutes) {
        minutesDisplayed = "0" + currentMinutes;
    }

    let secondsDisplayed = currentSeconds.toString();
    if (10 > currentSeconds) {
        secondsDisplayed = "0" + currentSeconds;
    }

    const timeText: string = settings.timePattern.replace("H", hoursDisplayed).replace("M", minutesDisplayed).replace("S", secondsDisplayed);
    document.getElementById("time")!.textContent = timeText;

    const month: string = new Intl.DateTimeFormat(language, { month: "long" }).format(new Date());
    const day: number = currentDate.getDate();
    let year: number = currentDate.getFullYear();
    if (year < 2000) {
        year = year + 1900;
    }

    const dateText: string = settings.datePattern.replace("D", day.toString()).replace("Y", year.toString()).replace("M", month);
    document.getElementById("date")!.textContent = dateText;
}

async function displayWeather({ tempUnit, location, displayIcon, activateDebugMode }: Settings, language: string): Promise<void> {
    try {
        const weatherResult = await Weather.getWeather(tempUnit, location, language, activateDebugMode);

        document.getElementById("loader")!.style.display = "none";

        const conditionsElement: HTMLLinkElement = document.getElementById("weather-link") as HTMLLinkElement;
        conditionsElement.style.display = "block";
        conditionsElement.classList.add("conditions-fadeIn");

        if (typeof weatherResult === "string") {
            document.getElementById("weather-degrees")!.textContent = "";
            document.getElementById("weather-description")!.textContent = weatherResult as string;

            conditionsElement.onclick = () => browser.runtime.openOptionsPage();
        }
        else {
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
        }
    } catch (error) {
        console.error("Error during weather display", error);
    }
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
