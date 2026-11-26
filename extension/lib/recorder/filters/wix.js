// Wix sites (any domain): images are served from static.wixstatic.com/media/<file>/v1/<fill|fit|crop>/<params>/<name>,
// a resized copy that starts as a blurred placeholder (blur_2) and is swapped for a sharper size later.
// The original upload is the same URL without the /v1/... transform: static.wixstatic.com/media/<file>

var KellyRecorderFilterWix = new Object();
KellyRecorderFilterWix.manifest = {detectionLvl : ['imagePreview', 'imageOriginal']}; // no host: Wix sites use their own domains

KellyRecorderFilterWix.mediaRegExp = /^(?:https?:)?\/\/static\.wixstatic\.com\/media\/([^\/?#]+)/;

// returns the original image URL for any static.wixstatic.com/media URL, or false
KellyRecorderFilterWix.getOriginal = function(src) {
    var match = typeof src == 'string' ? KellyRecorderFilterWix.mediaRegExp.exec(src.trim()) : null;
    return match ? 'https://static.wixstatic.com/media/' + match[1] : false;
}

// a small, sharp copy for the downloader grid (the page's own copy may still be the blurred placeholder)
KellyRecorderFilterWix.getPreview = function(original) {
    var file = original.substr(original.lastIndexOf('/') + 1);
    return original + '/v1/fit/w_480,h_480,q_80/' + file;
}

KellyRecorderFilterWix.findMediaSrc = function(handler, el) {

    var candidates = [];
    if (el.tagName == 'IMG') candidates.push(el.currentSrc, el.getAttribute('src'), el.getAttribute('data-src'));

    ['srcset', 'data-srcset'].forEach(function(attr) {
        var value = el.getAttribute(attr);
        if (value) value.split(',').forEach(function(part) { candidates.push(part.trim().split(' ')[0]); });
    });

    candidates.push(handler.getSrcFromStyle(el));

    for (var i = 0; i < candidates.length; i++) {
        var original = KellyRecorderFilterWix.getOriginal(candidates[i]);
        if (original) return original;
    }

    return false;
}

KellyRecorderFilterWix.addItemByDriver = function(handler, data) {

    var el = data.el;

    // <picture><source srcset> - the <img> in the same <picture> gives the same original, and <source> is treated as video
    if (el.tagName == 'SOURCE') {
        if (el.parentElement && el.parentElement.tagName == 'PICTURE' && KellyRecorderFilterWix.findMediaSrc(handler, el)) return handler.addDriverAction.SKIP;
        return;
    }

    var original = KellyRecorderFilterWix.findMediaSrc(handler, el);
    if (!original) return;

    var context = el.tagName == 'IMG' ? 'addSrcFromAttributes-src' : 'addSrcFromStyle';

    handler.addSingleSrc(data.item, KellyRecorderFilterWix.getPreview(original), context, el, 'imagePreview');
    handler.addSingleSrc(data.item, original, context, el, 'imageOriginal');

    return data.item.relatedSrc.length > 0 ? handler.addDriverAction.ADD : handler.addDriverAction.SKIP;
}

KellyPageWatchdog.filters.push(KellyRecorderFilterWix);
