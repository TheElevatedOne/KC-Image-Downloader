KellyRecorderFilterKemono = new Object();
// kemono.party -> kemono.su -> kemono.cr, coomer.party -> coomer.su -> coomer.st; pawchive.pw is a kemono clone
KellyRecorderFilterKemono.hosts = ['kemono.cr', 'kemono.su', 'kemono.party', 'coomer.st', 'coomer.su', 'coomer.party', 'pawchive.pw'];
KellyRecorderFilterKemono.isKemono = function(handler, kemonoOnly) {
    for (var i = 0; i < KellyRecorderFilterKemono.hosts.length; i++) {
        if (kemonoOnly && KellyRecorderFilterKemono.hosts[i].indexOf('coomer.') === 0) continue;
        if (handler.url.indexOf(KellyRecorderFilterKemono.hosts[i]) != -1) return true;
    }
    return false;
}

// https://t3.pawchive.pw/f/<id>/<name>?e=<expires>&s=<signature>
KellyRecorderFilterKemono.isSignedFile = function(link) {
    return link.pathname.indexOf('/f/') === 0 && /(^|\.)pawchive\.pw$/.test(link.hostname);
}

KellyRecorderFilterKemono.manifest = {host : KellyRecorderFilterKemono.hosts, detectionLvl : ['imagePreview', 'imageOriginal', 'imageByDocument']};

KellyRecorderFilterKemono.parseImagesDocByDriver = function(handler, data) {
    
    if (!KellyRecorderFilterKemono.isKemono(handler) && data.thread.response) return;
    
    var parser = new DOMParser();
    var doc = parser.parseFromString(data.thread.response, 'text/html');
    
    var images = doc.querySelectorAll('.fileThumb');
    for (var i = 0; i < images.length; i++) {
        var rawHref = images[i].getAttribute('href');
        if (!rawHref) continue;
        
        var link = KellyTools.getLocationFromUrl(rawHref.indexOf('/') === 0 && rawHref.indexOf('//') !== 0 ? 'https://' + handler.hostname + rawHref : rawHref);
        if (link.pathname.indexOf('/data/') === 0) {
            handler.imagesPool.push({relatedSrc : ['https://' + handler.hostname + link.pathname]});
        } else if (KellyRecorderFilterKemono.isSignedFile(link)) {
            // pawchive serves originals as signed, temporary links (keep the query string)
            handler.imagesPool.push({relatedSrc : [link.href]});
        }
    }

    data.thread.response = ''; 
    return true;
}    
 
KellyRecorderFilterKemono.onStartRecord = function(handler, data) {
     if (!KellyRecorderFilterKemono.isKemono(handler, true)) return;
     handler.allowDuplicates = true;
}

KellyRecorderFilterKemono.hosts.forEach(function(host) {
    var patterns = [['/thumbnail/', 'imagePreview']];
    if (host == 'pawchive.pw') patterns.push([new RegExp('//t[0-9]*\\.pawchive\\.pw/f/'), 'imageOriginal']);
    KellyPageWatchdog.validators.push({url : host, host : host, patterns : patterns});
});

KellyPageWatchdog.filters.push(KellyRecorderFilterKemono);
