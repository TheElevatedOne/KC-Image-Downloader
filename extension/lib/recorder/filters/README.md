# Site filters

A filter teaches the recorder how to find the full-size version of images on one site. Every file here is a content
script: add a new filter to `content_scripts[0].js` in `extension/manifest.json`, next to the other filters (after
`kellyPageWatchdog.js`, before `lib/profiles/default.js`).

There are two kinds: validators, for when URL patterns are enough, and filters, which run code.

## Validators (URL patterns only)

A validator tags image URLs with a detection level. Then the downloader's "auto-filter" for that site can keep the
originals and drop previews without the user setting size filters by hand.

```js
KellyPageWatchdog.validators.push({
    url : 'example.com',            // substring of the tab URL where the patterns apply
    host : 'example.com',           // optional, exact hostname (no "www.") that turns on the auto-filter for the site
    patterns : [                    // [substring or RegExp matched against the image URL, detection level]
        ['/thumbs/', 'imagePreview'],
        [new RegExp('/full/[0-9]+\\.jpg'), 'imageOriginal'],
    ],
    patternsDoc : [],               // optional, same format, matched against the related document URL
});
```

Detection levels: `imageAny`, `imagePreview`, `imageOriginal`, `imageByDocument` (image found by loading the page
an image links to, see "Load related documents").

`_validators.js` holds the validator-only sites (Pinterest, Patreon, Fanbox, 2ch, FurAffinity, …).

## Filters (code)

```js
var KellyRecorderFilterExample = new Object();
KellyRecorderFilterExample.manifest = {host : ['example.com', 'example.net'], detectionLvl : ['imagePreview', 'imageOriginal']};

// called for every element while scanning the page
KellyRecorderFilterExample.addItemByDriver = function(handler, data) {
    if (handler.url.indexOf('example.com') == -1 || data.el.tagName != 'IMG') return; // undefined = let other filters / default logic run

    handler.addSingleSrc(data.item, data.el.src, 'addSrcFromAttributes-src', data.el, 'imagePreview');
    handler.addSingleSrc(data.item, data.el.src.replace('/thumb/', '/orig/'), 'addSrcFromAttributes-src', data.el, 'imageOriginal');

    return data.item.relatedSrc.length > 0 ? handler.addDriverAction.ADD : handler.addDriverAction.SKIP;
}

KellyPageWatchdog.filters.push(KellyRecorderFilterExample);
```

`handler` is the page's `KellyPageWatchdog`. Useful fields: `handler.url`, `handler.hostname` (without `www.`),
`handler.host` (origin, used as referrer), `handler.imagesPool`, `handler.allowDuplicates`, `handler.getConfig(cb)`.

Hooks are called on every registered filter, so each hook must first check that it is on its own site. In a
blocking hook, returning anything other than `undefined` stops the other filters.

| Hook | Blocking | `data` | Purpose |
| --- | --- | --- | --- |
| `onInitLocation` | no | `{url, host}` | page opened or SPA location changed |
| `onStartRecord` / `onStopRecord` | no | | recording started / stopped on this tab |
| `addItemByDriver` | yes | `{el, item}` | add sources for a scanned element; return `handler.addDriverAction.ADD`, `SKIP` or `CONTINUE` |
| `validateByDriver` | yes | `{item}` | return `false` to drop an item |
| `onBeforeParseImagesDocByDriver` / `parseImagesDocByDriver` | yes | `{thread}` | parse a loaded related document (`thread.response`), push results into `handler.imagesPool`, return `true` when handled |
| `onBeforeDownloadValidate` | yes | `{dm, arrayBuffer, contentType, url, onReady}` | inspect or replace downloaded data before saving |
| `onInitDownloader`, `onInitDocLoader`, `onInitOptions`, `onImagesGridReady`, `onRecorderImagesShow`, `onUpdateImagesBlock` | no | varies | downloader page UI events |

A filter without `manifest.host` runs on every site; `wix.js` uses that to match Wix images by their CDN URL.

The existing filters in this folder are the best reference: `bsky.js` and `9gag.js` are short, `pixiv.js` and
`reddit.js` load related documents, `twitter.js` uses page options.
