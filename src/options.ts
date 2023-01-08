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

function setStatus(statusText: string): void {
  const status: HTMLElement | null = document.getElementById("status")!;
  status.textContent = statusText;
  setTimeout(() => status.textContent = "", 1000);
}

function saveOptions(e: Event): void {
  const settings: Settings = {
    background: getInputValue("background") as string,
    foreground: getInputValue("foreground") as string,
    colorScheme: getInputValue("colorScheme") as ColorScheme,
    tempUnit: getInputValue("tempUnit") as TempUnit,
    location: getInputValue("location") as string,
    timePattern: getInputValue("timePattern") as string,
    datePattern: getInputValue("datePattern") as string,
    clock: getInputValue("clock") as ClockType,
    font: getInputValue("font") as FontType,
    leadingZero: getInputValue("zero") as boolean,
    customCss: getInputValue("css") as string,
    displayIcon: getInputValue("icon") as boolean,
    activateDebugMode: getInputValue("activateDebugMode") as boolean,
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
      setInputValue("colorScheme", settings.colorScheme);
      setInputValue("tempUnit", settings.tempUnit);
      setInputValue("location", settings.location);
      setInputValue("timePattern", settings.timePattern);
      setInputValue("datePattern", settings.datePattern);
      setInputValue("clock", settings.clock);
      setInputValue("font", settings.font);
      setInputValue("zero", settings.leadingZero);
      setInputValue("css", settings.customCss);
      setInputValue("icon", settings.displayIcon);
      setInputValue("activateDebugMode", settings.activateDebugMode);
      colorSchemeOnChange(document.getElementById("colorScheme") as HTMLSelectElement);
    }, error => setStatus(`Error: ${error}`));
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
    document.addEventListener("copy", (e: ClipboardEvent) => {
      e.clipboardData!.setData("text/plain", browser.runtime.getURL("moment.html"));
      e.preventDefault();
    }, { once: true });

    document.execCommand("copy");
  };

  document.getElementById("colorScheme")!.addEventListener("change", ({ target }) => {
    colorSchemeOnChange(target as HTMLSelectElement);
  })
});

document.querySelector("form")!.addEventListener("submit", saveOptions);
