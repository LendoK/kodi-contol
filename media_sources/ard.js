
var ard = function(url){
    // var matchVideo = /^https:\/\/www.ardmediathek\.de\/([A-Za-z0-9_-]+)\/player\/([A-Za-z0-9_-]+)/.exec(url);
    var matchVideo = /^https:\/\/api\.ardmediathek\.de\/public-gateway\?variables\=\%7B\%22client%22%3A%22([A-Za-z0-9_-]+)%22%2C%22clipId%22%3A.*/.exec(url);
    if (checkIfInMedia(url) || currentUrl == url) return;
    if (matchVideo) {
        var media = {};
        currentUrl = url;
        media["id"] = url;
        media['name'] = url;
        media['type'] = "ard";
        media['path'] = url;

        media["played"] = false;

        media["promise"] = fetch(url).then((r) => r.json())
        .then(({ "data": { "playerPage": {"mediaCollection": {"_mediaArray" : m_array}}} }) => {
            return m_array[0]._mediaStreamArray[0]._stream[0];
        });


        media["item"] = {"file": ""};
        browser.tabs.query({currentWindow: true, active: true})
        .then((tabs) => {
            media["domain"] = extractRootDomain(tabs[0].url);

        })
        return media;
    }else return null;
}