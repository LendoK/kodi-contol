var lbry = function(url){
    var matchVideo = /https?:\/\/cdn.lbryplayer.xyz\/api\/v4\/streams\/([A-Za-z0-9_-]*)\/([A-Za-z0-9_-]*)\/([A-Za-z0-9_-]*)\/([0-9_-]*)/.exec(url);
    if (matchVideo) {
        var media = {}; 
        media["id"] = matchVideo[2];
        media['name'] = matchVideo[2];
        media['type'] = "lbry";
        media['path'] = url;
        media['domain'] = extractRootDomain(url);
        media["played"] = false;
        media["item"] = {"file": "plugin://plugin.video.lbry/play/?video_id=" + media["id"]};
        // media["title_promise"] = fetch('https://noembed.com/embed?url=https://vimeo.com/' + media.id).then((r) => r.json())
        // .then(({ "title": title}) => {
        //     media.name = title;
        //     return title;
        // })
        return media;
    }else return null;
}