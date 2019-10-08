
function checkURL(url){
    var re = new RegExp(host);
    var ping = new RegExp(/(ping.gif)+/i);
    if (re.test(url)) {
        return false;
    } else if (ping.test(url)) {
        return false;
    }
    return true;
}

function mediaFromURL(url){
    if(checkURL(url)){
        for(var i = 0; i < scharber.length; i++){
            var media = scharber[i](url);
            if(media) return media;
        }
    }
    return null;
}

var scharber = [
    ard,
    zdf,
    arte,
    vimeo,
    twitch,
    image,
    video,
    youtube
]