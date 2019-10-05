var zdfVideoPattern = /^https?:\/\/(zdf).*\/master.m3u8/
var zdfMediathekPattern = /^https?:\/\/(zdf).*\/i\/meta-files\/([A-Za-z0-9_-]+)\/.*\/master.m3u8/
var zdfLivePattern =/^https?:\/\/(zdf).*\/hls\/live\/(\d+)\/.*\/master.m3u8/

var zdf = function(url){
    var match = zdfMediathekPattern.exec(url);
    if (match) {
        return {
            "id": url,
            "name": url,
            "type": "zdf",
            "sub": match[1],
            "path": url,
            "domain": match[1] + ".de",
            "played": false,
            "item": {"file": url}
            };
    }else return null;
}