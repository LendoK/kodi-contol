var zdfVideoPattern = /^https?:\/\/(zdf).*\/master.m3u8/
var zdfMediathekPattern = /^https?:\/\/(zdf).*\/i\/meta-files\/([A-Za-z0-9_-]+)\/.*\/master.m3u8/
var zdfLivePattern =/^https?:\/\/(zdf).*\/hls\/live\/(\d+)\/.*\/master.m3u8/

var zdf = function(url){
    var match = zdfMediathekPattern.exec(url);
    var live_match = zdfLivePattern.exec(url);
    if (match || live_match) {
        var media = {
            "id": url,
            "name": url,
            "type": "zdf",
            // "sub": match[1],
            "path": url,
            // "domain": match[1] + ".de",
            "domain": url,
            "played": false,
            "item": {"file": url}
            };
            browser.tabs.query({currentWindow: true, active: true})
            .then((tabs) => {
                media.domain = extractRootDomain(tabs[0].url);

            })
        return media;
    }else return null;
}