var lbry = function(url){
    var matchVideo = /https?:\/\/vimeo\.com\/(\d+)(\?action=(log_stream_play|load_config))*/.exec(url);
    if (matchVideo) {
        var media = {}; 
        media["id"] = matchVideo[1];
        media['name'] = url;
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