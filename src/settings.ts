const defaultSettings: Settings = {
    background: "#fafafa",
    foreground: "#424242",
    colorScheme: "custom",
    tempUnit: "celsius",
    location: "",
    timePattern: "H:M:S",
    datePattern: "D M Y",
    clock: "24",
    font: "thin",
    leadingZero: true,
    customCss: "",
    displayIcon: false,
    activateDebugMode: false,
    backgroundImageUrl: ""
};

type TempUnit = "celsius" | "fahrenheit";
type ClockType = "12" | "24";
type FontType = "thin" | "bold";
type ColorScheme = "system" | "light" | "dark" | "custom";

type Settings = {
    background: string;
    foreground: string;
    colorScheme: ColorScheme;
    tempUnit: TempUnit;
    location: string;
    clock: ClockType;
    timePattern: string;
    datePattern: string;
    font: FontType;
    leadingZero: boolean;
    customCss: string;
    displayIcon: boolean;
    activateDebugMode: boolean;
    backgroundImageUrl: string
};
