// import { abstreifer as zdf } from "./media_sources/zdf.js";


function mediaFromURL(url){
    for(var i = 0; i < scharber.length; i++){
        var media = scharber[i](url);
        if(media) return media;
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