var pattern = "<all_urls>";
var videoPattern = /^https?:\/\/www\.youtube\.com\/.*[?&]v=([A-Za-z0-9_-]{11})/;
var playlistPattern = /^https?:\/\/www\.youtube\.com\/.*[?&]list=([A-Za-z0-9_-]{34})/;
var youtube_pattern = "https://www.youtube.com/*";

/* global media_list */
media_list = [];
var kodi_volume;
var host;
var fullscreen = true;
var unplayed = 0;

function get_volume(resp) {
    var json = JSON.parse(resp);
    kodi_volume = json["result"]["volume"];
}

function check_media(filepath) {
    if (/\.(mp4|mkv|mov|avi|flv|wmv|asf|mp3|flac|mka|m4a)+/i.test(filepath)) {
        var re = new RegExp(host);
        var ping = new RegExp(/(ping.gif)+/i);
        if (re.test(filepath)) {
            return false;
        } else if (ping.test(filepath)) {
            return false;
        } else {
            return true;
        }
    }
}


function logURL(requestDetails) {
    var url = requestDetails.url;
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

var content;
browser.contextMenus.create({
    id: "send-kodi",
    title: browser.i18n.getMessage("contextSendToKodi"),
    contexts: ["image", "video"]
}, onCreated);

function play_media(id, queue) {
    if (media_list[id]) {
        if (media_list[id]["type"] == "video") {
            var data = { "jsonrpc": "2.0", "method": "Player.Open", "params": { "item": { "file": media_list[id]["path"] } }, "id": 1 };
            if (queue) {
                data = { "method": "Playlist.Add", "params": { "playlistid": 1, "item": { "file": media_list[id]["path"] } } };
            }
            getHostData(data, parseJSON);
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

function getHostData(data, func, note) {
    var getting = browser.storage.local.get(null, function (result) {
        var hostData = result;
        sendRequestToKODI(data, hostData, func, note);
    });
}

function sendRequestToKODI(data, hostData, func, note) {
    var xhr = new XMLHttpRequest();
    data["jsonrpc"] = "2.0";
    data["id"] = 1;
    request = "http://" + encodeURIComponent(hostData.user) + ":" + encodeURIComponent(hostData.pass) + "@" + encodeURIComponent(hostData.host) + ":" + encodeURIComponent(hostData.port) + "/jsonrpc";
    xhr.open("POST", request, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.timeout = 5000;
    xhr.onreadystatechange = function (aEvt) {
        if (note) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200 && func) {
                    // browser.browserAction.enable();
                    var resp = xhr.responseText;
                    console.log("response: ", resp)
                    func(resp);
                } else {
                    // notify("Error Sending request to KODI");
                    // browser.browserAction.disable();
                    console.log("response: ", resp)
                }
            }
        }
    };
    xhr.send(JSON.stringify(data));
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
            getHostData(data, parseJSON);
            break;
        case "eye":
            fullscreen = !fullscreen;
            var data = { "method": "GUI.SetFullscreen", "params": [fullscreen] };
            getHostData(data, parseJSON);
            break;
        case "b_stop":
            var data = { "method": "Input.ExecuteAction", "params": ["stop"] };
            getHostData(data, parseJSON);
            break;
        case "info":
            var data = { "method": "Input.ShowOSD", "params": [] };
            getHostData(data, parseJSON);
            break;
        case "prev":
            var data = { "method": "Input.ExecuteAction", "params": ["skipprevious"] };
            getHostData(data, parseJSON);
            break;
        case "next":
            var data = { "method": "Input.ExecuteAction", "params": ["skipnext"] };
            getHostData(data, parseJSON);
            break;
        case "b_volmute":
            var data = { "method": "Input.ExecuteAction", "params": ["mute"] };
            getHostData(data, parseJSON);
            break;
        case "b_volup":
            var data = { "method": "Input.ExecuteAction", "params": ["volumeup"] };
            getHostData(data, parseJSON);
            break;
        case "b_voldown":
            var data = { "method": "Input.ExecuteAction", "params": ["volumedown"] };
            getHostData(data, parseJSON);
            break;
        case "up":
            var data = { "method": "Input.Up", "params": [] };
            getHostData(data, parseJSON);
            break;
        case "down":
            var data = { "method": "Input.Down", "params": [] };
            getHostData(data, parseJSON);
            break;
        case "left":
            var data = { "method": "Input.Left", "params": [] };
            getHostData(data, parseJSON);
            break;
        case "right":
            var data = { "method": "Input.Right", "params": [] };
            getHostData(data, parseJSON);
            break;
        case "ok":
            var data = { "method": "Input.Select", "params": [] };
            getHostData(data, parseJSON);
            break;
        case "back":
            var data = { "method": "Input.Back", "params": [] };
            getHostData(data, parseJSON);
            break;
        case "context":
            var data = { "method": "Input.ContextMenu", "params": [] };
            getHostData(data, parseJSON);
            break;
        case "text":
            send_text();
            break;
        case "playpause":
            var data = { "method": "Input.ExecuteAction", "params": ["pause"] };
            getHostData(data, parseJSON);
            break;
        case "playmedia":
            idToURL("b_stop", 0);
            play_media(mediaid, false);
            break;
        case "playing":
            getHostData();
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
        getHostData(data, parseJSON);
    }
}
//////////////////////////////////////////////////////messageing//////////////////////////////////////////////////


function handleMessage(request, sender, sendResponse) {
    if (request.selectedId) {
        idToURL(request.selectedId, request.id);
    } else if (request.text) {
        var data = { "jsonrpc": "2.0", "method": "Input.SendText", "params": [request.text], "id": 1 };
        getHostData(data, parseJSON, false);

    } else if (request.volume) {
        set_volume(request.volume);
        kodi_volume = request.volume;
    } else if (request.onload) {
        var data = { "jsonrpc": "2.0", "method": "Application.GetProperties", "params": { "properties": ["volume"] }, "id": 1 };
        getHostData(data, get_volume, true);
        sendResponse({ response: "Response from background script", url: media_list, volume: kodi_volume });
    }
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

function set_volume(volume) {
    var data = { "method": "Application.SetVolume", "params": { "volume": parseInt(volume) } };
    getHostData(data, null, false);
}

////////////////////////////////////////////////////////////////listeners////////////////////////////////////////////////////


browser.webRequest.onBeforeRequest.addListener(
    logURL,
    { urls: ["<all_urls>"] }
    );

browser.contextMenus.onClicked.addListener(function (info, tab) {
    switch (info.menuItemId) {
        case "send-kodi":
            // console.log("from context menu: ", info.srcUrl);
            var data = { "jsonrpc": "2.0", "method": "Player.Open", "params": { "item": { "file": info.srcUrl } }, "id": 1 };
            getHostData(data, parseJSON);
            break;
        }
    });


browser.runtime.onMessage.addListener(handleMessage);