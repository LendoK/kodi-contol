var image = function(url){
    var match = /\.(jpg|png)+/.exec(url);
    if (match) {
        var media = {};
        var filename = url.replace(/^.*[\\\/]/, '');
        media['name'] = filename;
        media['id'] = filename;
        media['path'] = url;
        media['type'] = "image";
        media['domain'] = extractRootDomain(url);
        media["played"] = false;
        media["item"] = {"file": url}
        return media;
    }else return null;
}