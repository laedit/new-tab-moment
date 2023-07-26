function getInputValue(elementId: string): string | boolean {
    const elm = document.getElementById(elementId)! as HTMLInputElement;
    if (elm) {
        if (elm.type === "checkbox") {
            return elm.checked;
        } else {
            if (elm.value === "true") return true;
            if (elm.value === "false") return false;

            return elm.value;
        }
    }
    throw new Error('Invalid input element');
}

function setInputValue(elementId: string, value: string | number | boolean): void {
    const elm = document.getElementById(elementId)! as HTMLInputElement;
    if (elm) {
        if (elm.type === "checkbox") {
            elm.checked = !!value;
        } else {
            const strVal = typeof value === "string" ? value : value.toString();
            elm.value = strVal;
        }
    }
}

function displayError(error: Error): void {
    console.error(error);
    const errorDetails = document.getElementById("errorDetails") as HTMLParagraphElement;

    errorDetails.innerText = error.toString();

    const saveErrorDialog = document.getElementById("saveErrorDialog") as HTMLDialogElement;

    saveErrorDialog.showModal();
}

function saveOptions(e: Event): void {
    const settings: Settings = {
        background: getInputValue("background") as string,
        foreground: getInputValue("foreground") as string,
        colorScheme: getInputValue("colorScheme") as ColorScheme,
        measurementUnits: getInputValue("measurementUnits") as MeasurementUnits,
        location: getInputValue("location") as string,
        timePattern: getInputValue("timePattern") as string,
        datePattern: getInputValue("datePattern") as string,
        clock: getInputValue("clock") as ClockType,
        font: getInputValue("font") as FontType,
        leadingZero: getInputValue("zero") as boolean,
        customCss: getInputValue("css") as string,
        displayIcon: getInputValue("icon") as boolean,
        activateDebugMode: getInputValue("activateDebugMode") as boolean,
        backgroundImageUrl: getInputValue("backgroundImageUrl") as string,
        displayOptionsButton: getInputValue("displayOptionsButton") as boolean,
        displayPressure: getInputValue("displayPressure") as boolean,
        displayHumidity: getInputValue("displayHumidity") as boolean,
        displayWind: getInputValue("displayWind") as boolean,
        useFeelsLikeTemperature: getInputValue("useFeelsLikeTemperature") as boolean,
        subClocks: getSubClocks()
    };

    browser.storage.sync.set(settings).catch(displayError);

    e.preventDefault();
}

function getSubClocks(): SubClock[] {
    let subClocks: SubClock[] = [];

    for (let index = 1; index < 4; index++) {
        let subClock = getSubClock(index);
        if (subClock !== undefined) {
            subClocks.push(subClock);
        }
    }

    return subClocks;
}

function getSubClock(index: number): SubClock | undefined {
    let subClockTimeZone = getInputValue(`subClock${index}TimeZone`) as string;
    if (subClockTimeZone) {
        return {
            timeZone: subClockTimeZone,
            displayTimeZone: getInputValue(`subClock${index}DisplayTimeZone`) as boolean,
            name: getInputValue(`subClock${index}Name`) as string
        };
    }
    return undefined;
}

function restoreOptions(): void {
    browser.storage.sync.get(defaultSettings)
        .then(settings => {
            setInputValue("background", settings.background);
            setInputValue("foreground", settings.foreground);
            setInputValue("colorScheme", settings.colorScheme);
            setInputValue("measurementUnits", settings.tempUnit ? (settings.tempUnit == "celsius" ? "metric" : "imperial") : settings.measurementUnits);
            setInputValue("location", settings.location);
            setInputValue("timePattern", settings.timePattern);
            setInputValue("datePattern", settings.datePattern);
            setInputValue("clock", settings.clock);
            setInputValue("font", settings.font);
            setInputValue("zero", settings.leadingZero);
            setInputValue("css", settings.customCss);
            setInputValue("icon", settings.displayIcon);
            setInputValue("activateDebugMode", settings.activateDebugMode);
            setInputValue("backgroundImageUrl", settings.backgroundImageUrl);
            setInputValue("displayOptionsButton", settings.displayOptionsButton);
            setInputValue("displayPressure", settings.displayPressure);
            setInputValue("displayHumidity", settings.displayHumidity);
            setInputValue("displayWind", settings.displayWind);
            setInputValue("useFeelsLikeTemperature", settings.useFeelsLikeTemperature);
            colorSchemeOnChange(document.getElementById("colorScheme") as HTMLSelectElement);
            restoreSubClocks(settings.subClocks);
        })
        .catch(displayError);
}

function restoreSubClocks(subClocks: SubClock[] | undefined) {

    for (let index = 1; index < 4; index++) {
        const timeZonesSelect = document.getElementById(`subClock${index}TimeZone`) as HTMLSelectElement;
        if (typeof Intl.supportedValuesOf === "undefined") {
            // method is supported
            let option = document.createElement("option");
            option.innerText = "Please update your browser to use this";
            timeZonesSelect.append(option)
        }
        else {
            Intl.supportedValuesOf('timeZone').map((timeZone: string) => {
                let option = document.createElement("option");
                option.value = timeZone;
                option.innerText = timeZone;
                timeZonesSelect.append(option)
            });
        }
        setInputValue(`subClock${index}DisplayTimeZone`, true);
    }

    if (subClocks) {
        subClocks.forEach((subClock, index) => {
            console.debug(subClock);
            console.debug(document.getElementById(`subClock${index + 1}TimeZone`));
            setInputValue(`subClock${index + 1}TimeZone`, subClock.timeZone);
            setInputValue(`subClock${index + 1}DisplayTimeZone`, subClock.displayTimeZone);
            setInputValue(`subClock${index + 1}Name`, subClock.name);
        });
    }
}

function colorSchemeOnChange(elm: HTMLSelectElement) {
    const value = elm.value as ColorScheme;
    const enable = (value === "custom");
    (document.getElementById("background") as HTMLInputElement).disabled = !enable;
    (document.getElementById("foreground") as HTMLInputElement).disabled = !enable;
}

document.addEventListener("DOMContentLoaded", () => {
    restoreOptions();

    setInputValue("homepage-url", browser.runtime.getURL("moment.html"));

    document.getElementById("copy-link")!.onclick = () => {
        navigator.clipboard.writeText(browser.runtime.getURL("moment.html"))
    };

    document.getElementById("colorScheme")!.addEventListener("change", ({ target }) => {
        colorSchemeOnChange(target as HTMLSelectElement);
    });

    document.getElementById("closeBtn")?.addEventListener("click", event => {
        event.preventDefault();
        var saveErrorDialog = document.getElementById("saveErrorDialog") as HTMLDialogElement;
        saveErrorDialog.close();
    });

    Array.from(document.forms[0].elements).forEach(element => {
        if (element.id != "homepage-url" && element.id != "copy-link")
            element.addEventListener("change", saveOptions);
    });
});
