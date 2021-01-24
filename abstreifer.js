
function checkURL(url){
    var re = new RegExp(host);
    if (re.test(url)) {
        return false;
    }
    // re = new RegExp(/(ping.gif)+/i);
    // if (re.test(url)) {
    //     return false;
    // }
    re = new RegExp(/.*\?null\=0/);
    if (re.test(url)) {
        return false;
    }
    re = new RegExp("https://noembed.com/embed");
    if (re.test(url)) {
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
    youtube,
    lbry
]