
/* global media_list */
media_list = [];
var kodi_volume;
var kodi_mute
var host;
var fullscreen = true;
var unplayed = 0;
var currentUrl;

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
    var media = mediaFromURL(requestDetails.url);
    if(media && media["type"] != "image" && !checkIfInMedia(media.id)){
        if ("title_promise" in media) {
            media.title_promise.then(() =>{if(!checkIfInMedia(media.id)) addToMediaList(media);});
        }else{
            addToMediaList(media);
        }
    }
}

function checkIfInMedia(id){
    for (i = 0; i < media_list.length; i++) {
        if (media_list[i]['id'] == id) {
            return true;
        }
    }
    return false;
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

function play_media(media, queue) {
    if (media) {
        var data = { "method": "Player.Open", "params": {"item": media.item}};
        if (queue) {
            data["method"] = "Playlist.Add";
            data["params"]["playlistid"] = 1;
        }
        if("promise" in media){
            media.promise.then((f)=>{
                data["params"]["item"]["file"] = f;
                sendRequestToHost(data, parseJSON);
            });
        }else{
            sendRequestToHost(data, parseJSON);
        }

        if (media["played"] == false) {
            unplayed -= 1;
            media["played"] = true;
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
        case "playmedia":
            idToURL("b_stop", 0);
            play_media(media_list[mediaid], false);
            break;
        case "queue Media":
            play_media(media_list[mediaid], true);
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
    id: "send-kodi-queue",
    title: browser.i18n.getMessage("contextSendToKodiQueue"),
    contexts: ["image", "video"],
    visible: false
}, onCreated);

browser.contextMenus.create({
    id: "send-link-to-kodi",
    title: browser.i18n.getMessage("contextSendLinkToKodi"),
    contexts: ["link"],
    visible: false
}, onCreated);

browser.contextMenus.create({
    id: "send-link-to-kodi-queue",
    title: browser.i18n.getMessage("contextSendLinkToKodiQueue"),
    contexts: ["link"],
    visible: false
}, onCreated);

browser.contextMenus.onShown.addListener(info => {
    var media = mediaFromURL(info.srcUrl);
    browser.contextMenus.update("send-kodi", {
        visible: media ? true : false
        });
    //exception for images to queue
    browser.contextMenus.update("send-kodi-queue", {
        visible: media && media.type != "image" ? true : false
        });
    //links
    media = mediaFromURL(info.linkUrl);
    browser.contextMenus.update("send-link-to-kodi", {
        visible: media ? true : false
        });
    browser.contextMenus.update("send-link-to-kodi-queue", {
        visible: media ? true : false
        });
    browser.contextMenus.refresh();
});

browser.contextMenus.onClicked.addListener(function (info, tab) {
    switch (info.menuItemId) {
        case "send-kodi":
            var media = mediaFromURL(info.srcUrl);
            play_media(media, true);
            break;
        case "send-kodi-queue":
            var media = mediaFromURL(info.srcUrl);
                if(media && media.type != "image"){
                    play_media(media, true);
                }
            break;
        case "send-link-to-kodi":
            var media = mediaFromURL(info.linkUrl);
            if(media){
                play_media(media, false);
            }
            break;
        case "send-link-to-kodi-queue":
            var media = mediaFromURL(info.linkUrl);
            play_media(media, true);
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
    var newList = JSON.parse(JSON.stringify(media_list));
    sendResponse({ response: "Response from background script", url: newList, volume: kodi_volume, muted: kodi_mute});

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
    { urls: ["<all_urls>"], types: ["media", "xmlhttprequest"]}
    );

browser.runtime.onMessage.addListener(handleMessage);

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    getUnplayedPerPage();
});