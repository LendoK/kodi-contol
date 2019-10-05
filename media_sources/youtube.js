var youtube = function(url){
    var matchVideo = /^https?:\/\/www\.youtube\.com\/.*[?&]v=([A-Za-z0-9_-]{11})/.exec(url);
    var matchVideo2 = /^https?:\/\/youtu.be\/([A-Za-z0-9_-]{11})/.exec(url);
    var matchList = /^https?:\/\/www\.youtube\.com\/.*[?&]list=([A-Za-z0-9_-]{34})/.exec(url);
    if (matchVideo || matchList || matchVideo2) {
        var media = {};
        if (matchVideo) {
            media["id"]  = matchVideo[1];
        } else if(matchList){
            media["id"] = matchList[1];
        } else {
            media["id"] = matchVideo2[1];
        }
        media['name'] = url;
        media['type'] = "youtube";
        media['path'] = url;
        media['domain'] = extractRootDomain(url);
        media["played"] = false;
        media["item"] = {"file": "plugin://plugin.video.youtube/play/?video_id="+ media["id"]};
        media["title_promise"] = fetch('https://noembed.com/embed?url=https://www.youtube.com/watch?v=' + media.id).then((r) => r.json())
        .then(({ "title": title}) => {
            media.name = title;
            return title;
        })
        return media;
    }else return null;
}