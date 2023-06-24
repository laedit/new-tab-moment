declare var chrome: typeof browser;
let browserInstance = chrome;
if (typeof chrome === "undefined" || Object.getPrototypeOf(chrome) !== Object.prototype) {
    browserInstance = browser;
}

browserInstance.runtime.onInstalled.addListener(function (details) {
    switch (details.reason) {
        case "install": browserInstance.storage.sync.set({ displayOptionsButton: true });
            break;
        case "update": localStorage.clear();
            break;
    }
});
