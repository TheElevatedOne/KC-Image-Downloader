// Chrome MV3 service worker entry. Firefox loads the same files through background.scripts in manifest.json.
// Keep this list in sync with manifest.json -> background.scripts.
importScripts(
    "lib/kellyTools.js",
    "lib/kellyDispetcher.js",
    "lib/kellyDispetcherNetRequest.js",
    "lib/recorder/kellyEDRecorder.js",
    "env/init/background.js"
);
