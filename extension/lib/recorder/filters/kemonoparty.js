KellyRecorderFilterKemono = new Object();
// kemono.party -> kemono.su -> kemono.cr, coomer.party -> coomer.su -> coomer.st
KellyRecorderFilterKemono.hosts = ['kemono.cr', 'kemono.su', 'kemono.party', 'coomer.st', 'coomer.su', 'coomer.party'];
KellyRecorderFilterKemono.isKemono = function(handler, kemonoOnly) {
    for (var i = 0; i < KellyRecorderFilterKemono.hosts.length; i++) {
        if (kemonoOnly && KellyRecorderFilterKemono.hosts[i].indexOf('kemono.') !== 0) continue;
        if (handler.url.indexOf(KellyRecorderFilterKemono.hosts[i]) != -1) return true;
    }
    return false;
}

KellyRecorderFilterKemono.manifest = {host : KellyRecorderFilterKemono.hosts, detectionLvl : ['imagePreview', 'imageOriginal', 'imageByDocument']};

KellyRecorderFilterKemono.parseImagesDocByDriver = function(handler, data) {
    
    if (!KellyRecorderFilterKemono.isKemono(handler) && data.thread.response) return;
    
    var parser = new DOMParser();
    var doc = parser.parseFromString(data.thread.response, 'text/html');
    
    var images = doc.querySelectorAll('.fileThumb');
    for (var i = 0; i < images.length; i++) {
        var href = KellyTools.getLocationFromUrl(images[i].href).pathname;
        if (href && href.indexOf('/data/') === 0) handler.imagesPool.push({relatedSrc : ['https://' + handler.hostname + href]});
    }

    data.thread.response = ''; 
    return true;
}    
 
KellyRecorderFilterKemono.onStartRecord = function(handler, data) {
     if (!KellyRecorderFilterKemono.isKemono(handler, true)) return;
     handler.allowDuplicates = true;
}

KellyRecorderFilterKemono.hosts.forEach(function(host) {
    KellyPageWatchdog.validators.push({url : host, host : host, patterns : [['/thumbnail/', 'imagePreview']]});
});

KellyPageWatchdog.filters.push(KellyRecorderFilterKemono);
