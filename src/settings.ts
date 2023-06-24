const defaultSettings: Settings = {
    background: "#fafafa",
    foreground: "#424242",
    colorScheme: "custom",
    measurementUnits: "metric",
    location: "",
    timePattern: "H:M:S",
    datePattern: "D M Y",
    clock: "24",
    font: "thin",
    leadingZero: true,
    customCss: "",
    displayIcon: false,
    activateDebugMode: false,
    backgroundImageUrl: "",
    displayOptionsButton: false,
    displayPressure: false,
    displayHumidity: false,
    displayWind: false,
    useFeelsLikeTemperature: false
};

type TempUnit = "celsius" | "fahrenheit";
type MeasurementUnits = "metric" | "imperial";
type ClockType = "12" | "24";
type FontType = "thin" | "bold";
type ColorScheme = "system" | "light" | "dark" | "custom";

type Settings = {
    background: string;
    foreground: string;
    colorScheme: ColorScheme;
    tempUnit?: TempUnit; // deprecated
    measurementUnits: MeasurementUnits;
    location: string;
    clock: ClockType;
    timePattern: string;
    datePattern: string;
    font: FontType;
    leadingZero: boolean;
    customCss: string;
    displayIcon: boolean;
    activateDebugMode: boolean;
    backgroundImageUrl: string;
    displayOptionsButton: boolean;
    displayPressure: boolean;
    displayHumidity: boolean;
    displayWind: boolean;
    useFeelsLikeTemperature: boolean;
};
