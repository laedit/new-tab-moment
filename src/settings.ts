const defaultSettings: Settings = {
    background: "#FAFAFA",
    foreground: "#424242",
    tempUnit: "celsius",
    location: "",
    timePattern: "H:M:S",
    datePattern: "D M Y",
    clock: "24",
    font: "thin",
    leadingZero: true,
    customCss: "",
    displayIcon: false
};

type TempUnit = "celsius" | "fahrenheit";
type ClockType = "12" | "24";
type FontType = "thin" | "bold";

type Settings = {
    background: string;
    foreground: string;
    tempUnit: TempUnit;
    location: string;
    clock: ClockType;
    timePattern: string;
    datePattern: string;
    font: FontType;
    leadingZero: boolean;
    customCss: string;
    displayIcon: boolean;
};
