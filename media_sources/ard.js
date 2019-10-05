
function encodeQueryData(data) {
    var k;
    var ret = [];
    for (k in data) {
        if (data[k] != '') {
            ret.push( data[k]);
        }
    }
    return escape(ret);
}

var ard = function(url){
    var matchVideo = /^https:\/\/www.ardmediathek\.de\/([A-Za-z0-9_-]+)\/player\/([A-Za-z0-9_-]+)/.exec(url);
    if (matchVideo) {
        var media = {};
        media["id"] = matchVideo[2];
        media['name'] = url;
        media['type'] = matchVideo[1];
        media['path'] = url;
        media['domain'] = "www.ardmediathek.de";
        media["played"] = false;
        var request_item = {"client": matchVideo[1],"clipId": matchVideo[2],"deviceType": "pc"}
        var extension = {"persistedQuery":{"version":1,"sha256Hash":"38e4c23d15b4b007e2e31068658944f19797c2fb7a75c93bc0a77fe1632476c6"}};
        // request_item = JSON.stringify(request_item).replace('"', '%22').replace('{','%7B').replace(',', '%2C').replace('}', '%7D').replace(':', '%3A');
        url = "https://api.ardmediathek.de/public-gateway?variables=";//+JSON.stringify(request_item)+"&extension="+JSON.stringify(extension);
        console.log(url);
        media["promise"] = fetch(url).then((r) => r.json())
        .then(({ "data": { "playerPage": {"mediaCollection": {"_mediaArray" : m_array}}} }) => {
            return m_array[0]._mediaStreamArray[0]._stream[0];
        });
        media["title_promise"] = fetch(url).then((r) => r.json())
        .then(({ "data": { "playerPage": {"title": title}} }) => {
            console.log(title);
            media.name = title;
            return title;
        });

        media["item"] = {"file": ""};
        return media;
    }else return null;
}