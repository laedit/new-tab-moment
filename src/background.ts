browser.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        browser.storage.sync.set({ displayOptionsButton: true });
    }
});
