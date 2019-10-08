
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
        // media['domain'] = "ardmediathek.de";
        media["played"] = false;
        // var request_item = {"client": matchVideo[1],"clipId": matchVideo[2],"deviceType": "pc"}
        // var extension = {"persistedQuery":{"version":1,"sha256Hash":"38e4c23d15b4b007e2e31068658944f19797c2fb7a75c93bc0a77fe1632476c6"}};
        // var d = {"variables": request_item, "extension" :extension};
        // request_item = JSON.stringify(request_item).replace('"', '%22').replace('{','%7B').replace(',', '%2C').replace('}', '%7D').replace(':', '%3A');
        // url = "https://api.ardmediathek.de/public-gateway?variables="+stringFormat(request_item)+"&extensions="+stringFormat(extension);
        console.log(url);
        media["promise"] = fetch(url).then((r) => r.json())
        .then(({ "data": { "playerPage": {"mediaCollection": {"_mediaArray" : m_array}}} }) => {
            return m_array[0]._mediaStreamArray[0]._stream[0];
        });
        // media["title_promise"] = fetch(url).then((r) => r.json())
        // .then(({ "data": { "playerPage": {"title": title}} }) => {
        //     console.log(title);
        //     media.name = title;
        //     return title;
        // });

        media["item"] = {"file": ""};
        browser.tabs.query({currentWindow: true, active: true})
        .then((tabs) => {
            media["domain"] = extractRootDomain(tabs[0].url);

        })
        return media;
    }else return null;
}