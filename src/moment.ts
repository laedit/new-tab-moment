function getWeatherFromAPI(tempUnit: TempUnit, location: string, language: string, displayIcon: boolean): void {
    if (location === "") {
        navigator.geolocation.getCurrentPosition((position: Position) => {
            weatherAPIRequest([position.coords.latitude, position.coords.longitude], tempUnit, language, displayIcon);
        });
    } else {
        weatherAPIRequest(location, tempUnit, language, displayIcon);
    }
}

function getAPIUrl(parameter: string | [number, number], tempUnit: TempUnit, language: string): string {
    const apiUrl: string = `https://api.openweathermap.org/data/2.5/weather?APPID=cfcea063d9248af75b4837959ee2feac&lang=${language.substring(0, 2)}&units=${tempUnit === "celsius" ? "metric" : "imperial"}&`;

    if (typeof parameter === "string") {
        return apiUrl + `q=${parameter}`;
    } else {
        return apiUrl + `lat=${parameter[0]}&lon=${parameter[1]}`;
    }
}

function weatherAPIRequest(parameter: string | [number, number], tempUnit: TempUnit, language: string, displayIcon: boolean): void {
    const apiUrl = getAPIUrl(parameter, tempUnit, language);

    fetch(apiUrl)
        .then(response => {
            return response.json();
        })
        .then(weatherData => {
            const weatherDescription: string = weatherData.weather[0].description;
            const code: string = weatherData.weather[0].id;
            const degrees: string = Math.round(weatherData.main.temp).toString();

            const weatherLink: string = `https://openweathermap.org/city/${weatherData.id}`;

            displayWeather(degrees, weatherDescription, weatherLink, code, displayIcon);
            storeWeather(degrees, weatherDescription, weatherLink, code);
        })
        .catch(error => {
            console.log(`Error on weather fetch: ${error}`);
            // TODO Weather can't be displayed, sorry :(
        });
}

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

function storeWeather(degrees: string, weather: string, link: string, code: string): void {
    let currentTime: number = Date.now();
    currentTime += 60 * 5000; // 5 min
    const expireDate: Date = new Date(currentTime);
    localStorage.setItem("degrees", degrees);
    localStorage.setItem("weather", weather);
    localStorage.setItem("link", link);
    localStorage.setItem("code", code);
    localStorage.setItem("expires", expireDate.getTime().toString());
}

function displayWeather(degrees: string, weather: string, link: string, code: string, displayIcon: boolean): void {
    document.getElementById("weather-degrees")!.textContent = degrees;
    document.getElementById("weather-description")!.innerHTML = `&mdash; ${weather}`;
    document.getElementById("loader")!.style.display = "none";

    const conditionsElement: HTMLLinkElement = document.getElementById("weather-link") as HTMLLinkElement;
    conditionsElement.style.display = "block";
    conditionsElement.classList.add("conditions-fadeIn");
    conditionsElement.href = link;

    if (displayIcon) {
        const iconElement: HTMLElement = document.getElementById("weather-icon") as HTMLElement;
        iconElement.classList.add(`wi-owm-${code}`);
        iconElement.style.display = "block";
        iconElement.title = weather;

        document.getElementById("weather-description")!.style.display = "none";
    }
}

function getWeather(tempUnit: TempUnit, location: string, language: string, displayIcon: boolean): void {
    const expiresDate: number = Number(localStorage.getItem("expires"));
    if (expiresDate > Date.now()) {
        displayWeather(localStorage.getItem("degrees") as string,
            localStorage.getItem("weather") as string,
            localStorage.getItem("link") as string,
            localStorage.getItem("code") as string,
            displayIcon
        );
    } else {
        getWeatherFromAPI(tempUnit, location, language, displayIcon);
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

function load(userSettings: Settings, language: string): void {
    // apply style settings
    setStyle(userSettings);

    // get weather
    getWeather(userSettings.tempUnit, userSettings.location, language, userSettings.displayIcon);

    startTime(userSettings, language);
}

document.addEventListener("DOMContentLoaded", () => {
    browser.storage.sync.get(defaultSettings)
        .then(settings => {
            load(settings, navigator.language);
        });
});
