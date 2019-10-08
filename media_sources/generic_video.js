var video = function(url){
    var match = /\.(mp4|mkv|mov|avi|flv|wmv|asf|mp3|flac|mka|m4a)(?!\.csmil)/.exec(url);
    if (match) {
        var media = {};
        var filename = url.replace(/^.*[\\\/]/, '');
        media['name'] = filename;
        media['id'] = filename;
        media['path'] = url;
        media['type'] = "video";
        media['domain'] = extractRootDomain(url);
        media["played"] = false;
        media["item"] = {"file": url}
        return media;
    }else return null;
}