
var twitch = function(url){
    var matchVideo = /^https?:\/\/(?:www.twitch.tv|go.twitch.tv|m.twitch.tv)\/videos\/(\d+)/.exec(url);
    var matchVideo2 = /^https?:\/\/(?:api.twitch.tv)\/.*\/videos\/(\d+)/.exec(url);
    var matchClip = /^https?:\/\/(?:www.twitch.tv|go.twitch.tv|m.twitch.tv)\/.*\/clip\/([A-Za-z0-9_-]+).*/.exec(url);
    var matchClip2 = /^https?:\/\/(?:www.twitch.tv|go.twitch.tv|m.twitch.tv)\/([A-Za-z0-9_-]+)$/.exec(url);
    var matchChannel = /^https?:\/\/(?:www.twitch.tv|go.twitch.tv|m.twitch.tv)\/([A-Za-z0-9_-]+)$/.exec(url);
    var matchChannel2 = /^https?:\/\/(?:api.twitch.tv)\/.*\/channels\/([A-Za-z0-9_-]+)\/(?!extensions)/.exec(url);
    if (matchVideo || matchVideo2 || matchChannel || matchChannel2 || matchClip || matchClip2) {
        var media = {};
        if (matchVideo || matchVideo2) {
           media["id"] = matchVideo ? matchVideo[1] : matchVideo2[1];
           media["item"] = {"file": "plugin://plugin.video.twitch/?mode=play&video_id=" + media["id"]};
           media["sub"] = "video";
           media['name'] = media["id"];
       } else if(matchChannel || matchChannel2){
           media["id"] = matchChannel ? matchChannel[1] : matchChannel2[1];
           media["item"] = {"file": "plugin://plugin.video.twitch/?mode=play&channel_name=" + media["id"]};
           media["sub"] = "channel";
           media['name'] = media["id"];
       } else {
           media["id"] = matchClip ? matchClip[1] : matchClip2[1];
           media["item"] = {"file": "plugin://plugin.video.twitch/?mode=play&slug=" + media["id"]};
           media["sub"] = "clip";
           media['name'] = media["id"];
       }
        media['type'] = "twitch";
        media['path'] = url;
        media['domain'] = extractRootDomain(url);
        media["played"] = false;
        media["title_promise"] = fetch('https://noembed.com/embed?url=https://www.twitch.tv/videos/' + media.id).then((r) => r.json())
        .then(({ "title": title}) => {
            media.name = title;
            return title;
        })
        return media;
    }else return null;
}