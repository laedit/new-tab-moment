interface Window {
    chrome: typeof browser;
}

if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
    window.browser = window.chrome;
}
