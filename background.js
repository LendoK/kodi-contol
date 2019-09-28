var pattern = "<all_urls>";
var videoPattern = /^https?:\/\/www\.youtube\.com\/.*[?&]v=([A-Za-z0-9_-]{11})/;
var playlistPattern = /^https?:\/\/www\.youtube\.com\/.*[?&]list=([A-Za-z0-9_-]{34})/;
var youtube_pattern = "https://www.youtube.com/*";

/* global media_list */
media_list = [];
var kodi_volume;
var kodi_mute
var host;
var fullscreen = true;
var unplayed = 0;

function get_volume(resp) {
    var json = JSON.parse(resp);
    kodi_volume = json["result"]["volume"];
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

function check_media(filepath) {
    if (/\.(mp4|mkv|mov|avi|flv|wmv|asf|mp3|flac|mka|m4a)+/i.test(filepath)) {
        var ping = new RegExp(/(ping.gif)+/i);
        if (ping.test(filepath)) {
            return false;
        } else {
            return true;
        }
    }
}


function logURL(requestDetails) {
    var url = requestDetails.url;
    var re = new RegExp(host);
    if (re.test(url)) {
        return;
    }
    if (check_media(url)) {
        var filename = url.replace(/^.*[\\\/]/, '');
        var singleObj = {};
        var i = 0;
        for (i = 0; i < media_list.length; i++) {
            if (media_list[i]['name'] == filename) {
                return;
            }
        }
        singleObj['name'] = filename;
        singleObj['path'] = url;
        singleObj['type'] = "video";
        singleObj['domain'] = extractRootDomain(url);
        singleObj["played"] = false;
        media_list.push(singleObj);
        unplayed += 1;
        set_badgeText();
    }
    var matchVideo = videoPattern.exec(url);
    var matchList = playlistPattern.exec(url);

    if (matchVideo || matchList) {
        var singleObj = {};
        var i = 0;
        if (matchVideo) {
            filename = matchVideo[1];
        } else {
            filename = matchList[1];
        }
        for (i = 0; i < media_list.length; i++) {
            if (media_list[i]['name'] == filename) {
                return;
            }
        }
        var json_obj = JSON.parse(GetJson('https://noembed.com/embed?url=https://www.youtube.com/watch?v=' + filename));

        singleObj['type'] = "youtube";
        singleObj['name'] = json_obj.title;
        singleObj['path'] = url;
        singleObj['domain'] = extractRootDomain(url);
        singleObj["played"] = false;
        media_list.push(singleObj);
        unplayed += 1;
        set_badgeText();

    }
    if (media_list.length > 10) {
        if (media_list[9].played == false) {
            unplayed -= 1;
        }
        media_list.shift();

        set_badgeText();
    }
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

browser.contextMenus.create({
    id: "send-kodi",
    title: browser.i18n.getMessage("contextSendToKodi"),
    contexts: ["image", "video"]
}, onCreated);

function play_media(id, queue) {
    if (media_list[id]) {
        if (media_list[id]["type"] == "video") {
            var data = { "method": "Player.Open", "params": { "item": { "file": media_list[id]["path"] } } };
            if (queue) {
                data = { "method": "Playlist.Add", "params": { "playlistid": 1, "item": { "file": media_list[id]["path"] } } };
            }
            sendRequestToHost(data, parseJSON);
        } if (media_list[id]["type"] == "youtube") {
            var data = { "method": "Player.Open", "params": { "item": { "file": "" } } };
            if (queue) {
                data = { "method": "Playlist.Add", "params": { "playlistid": 1, "item": { "file": media_list[id]["path"] } } };
            }
            parseYoutubeURL(data, media_list[id]["path"]);
        }
        if (media_list[id]["played"] == false) {
            unplayed -= 1;
            media_list[id]["played"] = true;
            set_badgeText();
        }
    } else {
        notify("Error Nothing to play");
    }
}

function sendRequestToHost(data, func, note, error_func, final_func) {
    var getting = browser.storage.local.get(null, function (result) {
        var hostData = result;
        sendRequest(data, hostData, func, note, error_func, final_func, "POST");
    });
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

function parseYoutubeURL(data, url) {

    var yt_data = {};
    yt_data['order'] = 'default';
    yt_data['play'] = '1';

    var matchVideo = videoPattern.exec(url);
    var matchList = playlistPattern.exec(url);

    if (matchVideo && matchVideo.length > 1) {
        yt_data['video_id'] = matchVideo[1];
    }
    if (matchList && matchList.length > 1) {
        yt_data['playlist_id'] = matchList[1];
    }

    if (!matchVideo && !matchList) {
        // notify("This is not youtube URL, trying something else");
        play_media();
    } else {

        data["params"]["item"]["file"] = "plugin://plugin.video.youtube/play/?video_id="+ yt_data['video_id']
        sendRequestToHost(data, parseJSON);
    }
}
//////////////////////////////////////////////////////messageing//////////////////////////////////////////////////


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


////////////////////////////////////////////////////////////////listeners////////////////////////////////////////////////////

window.setInterval(function(){
    getKodiState();
}, 5000);

browser.webRequest.onBeforeRequest.addListener(
    logURL,
    { urls: ["<all_urls>"] }
    );

browser.contextMenus.onClicked.addListener(function (info, tab) {
    switch (info.menuItemId) {
        case "send-kodi":
            var data = { "method": "Player.Open", "params": { "item": { "file": info.srcUrl } }};
            sendRequestToHost(data, parseJSON);
            break;
        }
    });


browser.runtime.onMessage.addListener(handleMessage);