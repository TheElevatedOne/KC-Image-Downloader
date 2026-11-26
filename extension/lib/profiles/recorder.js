// part of KellyFavItems extension

var KellyProfileRecorder = new Object();
    KellyProfileRecorder.create = function() {
        
        KellyProfileRecorder.self = new KellyProfileDefault();   
        var handler = KellyProfileRecorder.self;
        
        handler.profile = 'recorder';    
        handler.extLinks = {
        
            pp : 'https://github.com/NC22/KellyC-Image-Downloader/wiki/%5BPP%5D-Privacy-Policy',
            github : KellyTools.links.github,
            upstream : KellyTools.links.upstream,
            issues : KellyTools.links.issues,
            author : KellyTools.links.upstream,
        };
    }
    
    KellyProfileRecorder.getInstance = function() {
        if (typeof KellyProfileRecorder.self == 'undefined') KellyProfileRecorder.create();    
        return KellyProfileRecorder.self;
    }