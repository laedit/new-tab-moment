function getInputValue(elementId: string): string {
  return (document.getElementById(elementId) as HTMLInputElement).value;
}

function setInputValue(elementId: string, value: string): void {
  (document.getElementById(elementId) as HTMLInputElement).value = value;
}

function setStatus(statusText: string): void {
  const status: HTMLElement | null = document.getElementById("status")!;
  status.textContent = statusText;
  setTimeout(() => status.textContent = "", 1000);
}

function saveOptions(e: Event): void {
  const settings: Settings = {
    background: getInputValue("background"),
    foreground: getInputValue("foreground"),
    tempUnit: getInputValue("tempUnit") as TempUnit,
    location: getInputValue("location"),
    timePattern: getInputValue("timePattern"),
    datePattern: getInputValue("datePattern"),
    clock: getInputValue("clock") as ClockType,
    font: getInputValue("font") as FontType,
    leadingZero: getInputValue("zero") === "true",
    customCss: getInputValue("css"),
    displayIcon: getInputValue("icon") === "true"
  };

  browser.storage.sync.set(settings)
    .then(() => setStatus("Options saved."),
      error => setStatus(`Error: ${error}`)
    );

  localStorage.removeItem("expires");

  e.preventDefault();
}

function restoreOptions(): void {
  browser.storage.sync.get(defaultSettings)
    .then(settings => {
      setInputValue("background", settings.background);
      setInputValue("foreground", settings.foreground);
      setInputValue("tempUnit", settings.tempUnit);
      setInputValue("location", settings.location);
      setInputValue("timePattern", settings.timePattern);
      setInputValue("datePattern", settings.datePattern);
      setInputValue("clock", settings.clock);
      setInputValue("font", settings.font);
      setInputValue("zero", settings.leadingZero.toString());
      setInputValue("css", settings.customCss);
      setInputValue("icon", settings.displayIcon.toString());
    }, error => setStatus(`Error: ${error}`));
}

document.addEventListener("DOMContentLoaded", () => {
  restoreOptions();

  setInputValue("homepage-url", browser.extension.getURL("moment.html"));

  document.getElementById("copy-link")!.onclick = () => {
    document.addEventListener("copy", (e: ClipboardEvent) => {
      e.clipboardData!.setData("text/plain", browser.extension.getURL("moment.html"));
      e.preventDefault();
    }, { once: true });

    document.execCommand("copy");
  };

});

document.querySelector("form")!.addEventListener("submit", saveOptions);
