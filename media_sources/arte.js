
var arte = function(url){
    var matchVideo = /^https?:\/\/www.arte.tv\/([A-Za-z0-9_-]+)\/videos\/(?!RC)([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)+/.exec(url);
    var matchVideo2 = /^https?:\/\/api.arte.tv\/api\/player\/v1\/config\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)\?autostart/.exec(url);
    if (matchVideo || matchVideo2) {
        var media = {};
        var mv = matchVideo2 ? matchVideo2 : matchVideo;
        media["id"] = mv[2];
        media['name'] = url;
        media['type'] = "arte";
        url = "https://api.arte.tv/api/player/v1/config/"+mv[1]+"/"+mv[2];
        media['path'] = url;
        media['domain'] = extractRootDomain(url);
        media["played"] = false;
        media["promise"] = fetch(url).then((r) => r.json())
        .then(({ "videoJsonPlayer": { "VSR": data } }) => {
            return Object.values(data).filter((f) => f.id.endsWith("_1"))
                    .reduce((b, f) => (b.height < f.height ? f : b))
                    .url;
        });
        media["title_promise"] = fetch(url).then((r) => r.json())
        .then(({ "videoJsonPlayer": { "VTI": title} }) => {
            media.name = title;
            return title;
        });

        media["item"] = {"file": ""};
        return media;
    }else return null;
}