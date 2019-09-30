var yt_videoPattern = /^https?:\/\/www\.youtube\.com\/.*[?&]v=([A-Za-z0-9_-]{11})/;
var yt_videoPattern2 = /^https?:\/\/youtu.be\/([A-Za-z0-9_-]{11})/;
var yt_playlistPattern = /^https?:\/\/www\.youtube\.com\/.*[?&]list=([A-Za-z0-9_-]{34})/;
var vimeo_videoPattern = /https?:\/\/vimeo\.com\/(\d+)(\?action=(log_stream_play|load_config))*/;
var videoPattern = /\.(mp4|mkv|mov|avi|flv|wmv|asf|mp3|flac|mka|m4a)+/
var imagePattern = /\.(jpg|png)+/

/* global media_list */
media_list = [];
var kodi_volume;
var kodi_mute
var host;
var fullscreen = true;
var unplayed = 0;


//
// ─── PARSE URL ──────────────────────────────────────────────────────────────────
//

function mediaFromURL(url){
    var re = new RegExp(host);
    if (re.test(url)) {
        return null;
    }
    re = new RegExp("https://noembed.com/embed");
    if (re.test(url)) {
        return null;
    }
    var media = {};
    // normal media
    var matchVideo = videoPattern.exec(url);
    var matchImage = imagePattern.exec(url);
    if (matchVideo || matchImage) {
        var filename = url.replace(/^.*[\\\/]/, '');
        media['name'] = filename;
        media['id'] = filename;
        media['path'] = url;
        media['type'] = matchImage ? "image" : "video";
        media['domain'] = extractRootDomain(url);
        media["played"] = false;
        media["item"] = {"file": url}
        return media;
    }
    // youtube
    var matchVideo = yt_videoPattern.exec(url);
    var matchVideo2 = yt_videoPattern2.exec(url);
    var matchList = yt_playlistPattern.exec(url);
    if (matchVideo || matchList || matchVideo2) {
        var id;
        if (matchVideo) {
            id = matchVideo[1];
        } else if(matchList){
            id = matchList[1];
        } else {
            id = matchVideo2[1];
        }
        media['name'] = url;
        media['type'] = "youtube";
        media['path'] = url;
        media['domain'] = extractRootDomain(url);
        media["played"] = false;
        media["id"] = id;
        media["item"] = {"file": "plugin://plugin.video.youtube/play/?video_id="+ id}
        return media;
    }
    //vimeo
    var matchVideo = vimeo_videoPattern.exec(url);
    if (matchVideo) {
        var id = matchVideo[1];

        media['name'] = url;
        media['type'] = "vimeo";
        media['path'] = url;
        media['domain'] = extractRootDomain(url);
        media["played"] = false;
        media["id"] = id
        media["item"] = {"file": "plugin://plugin.video.vimeo/play/?video_id=" + id}
        return media;
    }
    return null;
}

//
// ─── PREPARE MEDIA ──────────────────────────────────────────────────────────────
//


function addToMediaList(listEntry){
    media_list.push(listEntry);
    unplayed += 1;
    if (media_list.length > 10) {
        if (media_list[9].played == false) {
            unplayed -= 1;
        }
        media_list.shift();
    }
    set_badgeText();
}

function logURL(requestDetails) {
    var listEntry = mediaFromURL(requestDetails.url);
    if(listEntry && listEntry["type"] != "image" && !checkIfInMedia(listEntry)){
        if(listEntry.type == "vimeo" || listEntry.type == "youtube"){
            getTitleInfo(listEntry);
        }else{
            addToMediaList(listEntry);
        }
    }
}

function checkIfInMedia(media){
    for (i = 0; i < media_list.length; i++) {
        if (media_list[i]['id'] == media['id']) {
            return true;
        }
    }
    return false;
}

// get titile info via request to "https://noembed.com/embed"
function getTitleInfo(media){
    var xhr = new XMLHttpRequest();
    if(media.type == "youtube"){
        var url = 'https://noembed.com/embed?url=https://www.youtube.com/watch?v=' + media.id
    }else{
        var url = 'https://noembed.com/embed?url=https://vimeo.com/' + media.id
    }
    xhr.open("GET", url, true);
    xhr.timeout = 2000;
    xhr.onreadystatechange = function(aEvt) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var resp = xhr.responseText;
                var title_info = JSON.parse(resp);
                media["name"] = title_info.title;
                if(!checkIfInMedia(media)) addToMediaList(media);
                return;
            }
        }
        if(!checkIfInMedia(media)) addToMediaList(media);
    }
    xhr.send(null);
}

function getUnplayedPerPage(){
    browser.tabs.query({currentWindow: true, active: true})
    .then((tabs) => {
        var domain = extractRootDomain(tabs[0].url);
        unplayed = 0;
        for(var i = 0; i < media_list.length; i++){
            if(domain == media_list[i]["domain"] && !media_list[i].played){
                unplayed++;
            }
        }
        set_badgeText();
    })
}

function GetJson(yourUrl) {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", yourUrl, false);
    Httpreq.send(null);
    return Httpreq.responseText;
}

function set_badgeText() {
    if (unplayed > 0) {
        browser.browserAction.setBadgeText({ text: (unplayed).toString() });
    } else {
        browser.browserAction.setBadgeText({ text: "" });
    }
}

function play_media(id, queue) {
    if (media_list[id]) {
        var data = { "method": "Player.Open", "params": {"item": media_list[id].item}};
        if (queue) {
            data["method"] = "Playlist.Add";
            data["params"]["playlistid"] = 1;
        }
        sendRequestToHost(data, parseJSON);

        if (media_list[id]["played"] == false) {
            unplayed -= 1;
            media_list[id]["played"] = true;
            set_badgeText();
        }
    } else {
        notify("Error Nothing to play");
    }
}


//
// ─── KODI REQUESTS ──────────────────────────────────────────────────────────────
//

function sendRequestToHost(data, func, note, error_func, final_func) {
    var getting = browser.storage.local.get(null, function (result) {
        var hostData = result;
        sendRequest(data, hostData, func, note, error_func, final_func, "POST");
    });
}

function getKodiState(){
    var data = { "method": "Application.GetProperties", "params": { "properties": ["volume", "muted", "name"] }};
    func = function(resp){
        var json = JSON.parse(resp);
        kodi_volume = json["result"]["volume"];
        kodi_mute = json["result"]["muted"];

        var gettingItem = browser.storage.local.get('host');
        gettingItem.then((res) => {
            host = res.host
        });
        browser.browserAction.enable();
        browser.browserAction.setTitle({"title": "KodiControl: connected to "+json["result"]["name"]})
        if (unplayed > 0) {
            browser.browserAction.setBadgeText({ text: (unplayed).toString() });
        } else {
            browser.browserAction.setBadgeText({ text: "" });
        }
    }

    error_func = function(){
        browser.browserAction.disable();
        browser.browserAction.setTitle({"title": "KodiControl: not connected to Kodi!"})
        browser.browserAction.setBadgeText({ text: "" });
    }
    sendRequestToHost(data, func, true, error_func);
}

function getAPI(){
    var data = {"method": "JSONRPC.Introspect"};
    sendRequestToHost(data, parseJSON, true);
}

function set_volume(volume) {
    var data = { "method": "Application.SetVolume", "params": { "volume": parseInt(volume) } };
    sendRequestToHost(data, null, false);
}


function parseJSON(resp) {
    var json = JSON.parse(resp);
    if (json["result"] && json["result"] == "OK") {
        notify("Sent to KODI");
    }
    else {
        console.log(resp)
        notify("Error recived from KODI");
    }
}

function send_text() {
    var text = window.prompt("send string to Kodi", "Hello Kodi");
}

function idToURL(id, mediaid) {
    switch (id) {
        case "queue Media":
            play_media(mediaid, true);
            break;
        case "b_clearlist":
            var data = { "method": "Playlist.Clear", "params": { "playlistid": 1 } };
            sendRequestToHost(data, parseJSON);
            break;
        case "eye":
            fullscreen = !fullscreen;
            var data = { "method": "GUI.SetFullscreen", "params": [fullscreen] };
            sendRequestToHost(data, parseJSON);
            break;
        case "b_stop":
            var data = { "method": "Input.ExecuteAction", "params": ["stop"] };
            sendRequestToHost(data, parseJSON);
            break;
        case "info":
            var data = { "method": "Input.ShowOSD", "params": [] };
            sendRequestToHost(data, parseJSON);
            break;
        case "prev":
            var data = { "method": "Input.ExecuteAction", "params": ["skipprevious"] };
            sendRequestToHost(data, parseJSON);
            break;
        case "next":
            var data = { "method": "Input.ExecuteAction", "params": ["skipnext"] };
            sendRequestToHost(data, parseJSON);
            break;
        case "b_volmute":
            var data = { "method": "Input.ExecuteAction", "params": ["mute"] };
            sendRequestToHost(data, parseJSON);
            break;
        case "b_volup":
            var data = { "method": "Input.ExecuteAction", "params": ["volumeup"] };
            sendRequestToHost(data, parseJSON);
            break;
        case "b_voldown":
            var data = { "method": "Input.ExecuteAction", "params": ["volumedown"] };
            sendRequestToHost(data, parseJSON);
            break;
        case "up":
            var data = { "method": "Input.Up", "params": [] };
            sendRequestToHost(data, parseJSON);
            break;
        case "down":
            var data = { "method": "Input.Down", "params": [] };
            sendRequestToHost(data, parseJSON);
            break;
        case "left":
            var data = { "method": "Input.Left", "params": [] };
            sendRequestToHost(data, parseJSON);
            break;
        case "right":
            var data = { "method": "Input.Right", "params": [] };
            sendRequestToHost(data, parseJSON);
            break;
        case "ok":
            var data = { "method": "Input.Select", "params": [] };
            sendRequestToHost(data, parseJSON);
            break;
        case "back":
            var data = { "method": "Input.Back", "params": [] };
            sendRequestToHost(data, parseJSON);
            break;
        case "context":
            var data = { "method": "Input.ContextMenu", "params": [] };
            sendRequestToHost(data, parseJSON);
            break;
        case "text":
            send_text();
            break;
        case "playpause":
            var data = { "method": "Input.ExecuteAction", "params": ["pause"] };
            sendRequestToHost(data, parseJSON);
            break;
        case "playmedia":
            idToURL("b_stop", 0);
            play_media(mediaid, false);
            break;
        case "playing":
            sendRequestToHost();
            // play_media();
            break;
            window.close();
    }
}


//
// ─── CONTEXT MENU ───────────────────────────────────────────────────────────────
//
browser.contextMenus.create({
    id: "send-kodi",
    title: browser.i18n.getMessage("contextSendToKodi"),
    contexts: ["image", "video"],
    visible: false
}, onCreated);

browser.contextMenus.create({
    id: "send-link-to-kodi",
    title: browser.i18n.getMessage("contextSendLinkToKodi"),
    contexts: ["link"],
    visible: false
}, onCreated);


browser.contextMenus.onShown.addListener(info => {
    var media = mediaFromURL(info.srcUrl);
    browser.contextMenus.update("send-kodi", {
        visible: media ? true : false
        });
    media = mediaFromURL(info.linkUrl);
    browser.contextMenus.update("send-link-to-kodi", {
        visible: media ? true : false
        });

    browser.contextMenus.refresh();
});

browser.contextMenus.onClicked.addListener(function (info, tab) {
    switch (info.menuItemId) {
        case "send-kodi":
            var media = mediaFromURL(info.srcUrl);
            if(media){
                var data = { "method": "Player.Open", "params": media.params};
                sendRequestToHost(data, parseJSON);
            }
            break;
        case "send-link-to-kodi":
            var media = mediaFromURL(info.linkUrl);
            if(media){
                var data = { "method": "Player.Open", "params": media.params};
                sendRequestToHost(data, parseJSON);
            }
            break;
        }
    });

//
// ─── MESSAGING ──────────────────────────────────────────────────────────────────
//

function handleMessage(request, sender, sendResponse) {
    if (request.selectedId) {
        idToURL(request.selectedId, request.id);
    } else if (request.text) {
        var data = {"method": "Input.SendText", "params": [request.text] };
        sendRequestToHost(data, parseJSON, false);

    } else if (request.volume) {
        set_volume(request.volume);
        kodi_volume = request.volume;
    }
    getKodiState();
    sendResponse({ response: "Response from background script", url: media_list, volume: kodi_volume, muted: kodi_mute});

}

function handleResponse(message) {
    console.log(`Message from the background script:  ${message.response}`);
}

function notify(message) {
    browser.notifications.getAll(function (n) {
        // clear all notifications
        for (var i in n) {
            browser.notifications.clear(i);
        }
        // create new notification
        browser.notifications.create({
            "type": "basic",
            "iconUrl": browser.extension.getURL("icons/kodi96.png"),
            "title": "KodiCommander",
            "message": message
        });
    });
}


//
// ─── LISTENERS ──────────────────────────────────────────────────────────────────
//

window.setInterval(function(){
    getKodiState();
}, 5000);

browser.webRequest.onBeforeRequest.addListener(
    logURL,
    { urls: ["<all_urls>"] }
    );

browser.runtime.onMessage.addListener(handleMessage);

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    getUnplayedPerPage();
});