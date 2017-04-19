var pattern = "<all_urls>";
var videoPattern = /^https?:\/\/www\.youtube\.com\/.*[?&]v=([A-Za-z0-9_-]{11})/;
var playlistPattern = /^https?:\/\/www\.youtube\.com\/.*[?&]list=([A-Za-z0-9_-]{34})/;

var youtube_pattern = "https://www.youtube.com/*";

/* global media_list */
media_list = [];
var kodi_volume;
function check_media(filepath){  
    // mp4|mkv|mov|avi|flv|wmv|asf|mp3|flac|mka|m4a|aac|ogg|pls|jpg|png|gif|jpeg|tiff
    // if ( /\.(mp4|mkv|mov|avi|flv|wmv|asf|mp3|flac|mka|m4a)$/i.test(filepath)){
    if ( /\.(mp4|mkv|mov|avi|flv|wmv|asf|mp3|flac|mka|m4a)+/i.test(filepath)){
        return true;
    }
}


function logURL(requestDetails) {
    media_list = [];
    // console.log(requestDetails.url);
    if (check_media(requestDetails.url)){
        // console.log("Loading: " + requestDetails.url);
        var filename = requestDetails.url.replace(/^.*[\\\/]/, '');
        var singleObj = {}
        singleObj['name'] = filename;
        singleObj['path'] = requestDetails.url;
        media_list.push(singleObj);
        console.log("Loading: " + singleObj['name']);  
    }
}

browser.webRequest.onBeforeRequest.addListener(
  logURL,
//   {urls:[pattern], types:["image"]},
//   {urls:[pattern], types:["media"]}
    {urls: ["<all_urls>"]}
);


/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
function onCreated(n) {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

/*
Called when the item has been removed.
We'll just log success here.
*/
function onRemoved() {
  console.log("Item removed successfully");
}

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}


var content;
browser.contextMenus.create({
  id: "send-kodi",
  title: browser.i18n.getMessage("contextSendToKodi", content),
  contexts: ["image","video"]
}, onCreated);

browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "send-kodi":
      console.log("from context menu: " , info.srcUrl);
      var data = {"jsonrpc":"2.0","method":"Player.Open","params":{"item":{"file":info.srcUrl}},"id":1};
      getHostData(data);
      break;
  }
});

function play_media(){
    if(media_list[0]){
        var data = {"jsonrpc":"2.0","method":"Player.Open","params":{"item":{"file":media_list[0]["path"]}},"id":1};
        getHostData(data);
    }else{
        notify("Error Nothing to play");
    }
}

function getHostData(data) {
    var getting = browser.storage.local.get(null, function(result){
        var hostData = result;
        sendRequestToKODI(data, hostData);
    });
}

function getHostData2(data, func, note) {
     var getting = browser.storage.local.get(null, function(result){
        var hostData = result;
        sendRequestToKODI2(data, hostData, func, note);
    });
}

function sendRequestToKODI2(data, hostData, func, note) {
    
    var xhr = new XMLHttpRequest();
    
    data["jsonrpc"] = "2.0";
    data["id"] = 1;
    
    console.log(hostData);
    console.log(JSON.stringify(data));
    xhr.open("GET", "http://" + encodeURIComponent(hostData.user) + ":" + encodeURIComponent(hostData.pass) + "@" + encodeURIComponent(hostData.host) + ":" + encodeURIComponent(hostData.port) + "/jsonrpc?request=" + JSON.stringify(data), true);
    xhr.timeout = 5000;
    xhr.onreadystatechange = function (aEvt) {
        if (note){
            if (xhr.readyState == 4) {
                if(xhr.status == 200 && func) {
                    var resp = xhr.responseText;
                    func(resp);
                } else {
                    notify("Error Sending request to KODI");
                }
            }
        }
    };
    xhr.send();
}


function sendRequestToKODI(data, hostData) {
    
    var xhr = new XMLHttpRequest();
    
    data["jsonrpc"] = "2.0";
    data["id"] = 1;
    
    console.log(hostData);
    console.log(JSON.stringify(data));
    xhr.open("GET", "http://" + encodeURIComponent(hostData.user) + ":" + encodeURIComponent(hostData.pass) + "@" + encodeURIComponent(hostData.host) + ":" + encodeURIComponent(hostData.port) + "/jsonrpc?request=" + JSON.stringify(data), true);
    xhr.timeout = 5000;
    xhr.onreadystatechange = function (aEvt) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                var resp = xhr.responseText;
                parseJSON(resp);
            } else {
                notify("Error Sending request to KODI");
            }
        }
    };
    xhr.send();
}


function onGot(item) {
  console.log(item);
}



function get_active_player(){
    var xhr = new XMLHttpRequest();
    // let getting = browser.storage.local.get();
    // getting.then(onGot, onError);
    // var hostData = get_host_2();
   
    var data = {"method": "Player.GetActivePlayers"};
    data["jsonrpc"] = "2.0";
    data["id"] = 1;
    
    // console.log(hostData);
    console.log(JSON.stringify(data));
    xhr.open("GET", "http://" + encodeURIComponent(hostData.user) + ":" + encodeURIComponent(hostData.pass) + "@" + encodeURIComponent(hostData.host) + ":" + encodeURIComponent(hostData.port) + "/jsonrpc?request=" + JSON.stringify(data), true);    
    xhr.timeout = 5000;
    xhr.onreadystatechange = function (aEvt) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                var resp = xhr.responseText;
                // parseJSON(resp);
                console.log(resp);
                var json = JSON.parse(resp);
    
                if (json["result"]){
                    return json["result"]["playerid"];
                }
            } else {
                notify("Error Sending request to KODI");
                return 0;
            }
        }
    };
    xhr.send();
}

function parseJSON(resp) {
    console.log(resp);
    var json = JSON.parse(resp);
    
    if (json["result"] && json["result"] == "OK") notify("Sent to KODI");
    else notify("Error recived from KODI");
}



function notify(message) {
    browser.notifications.getAll(function(n) {
        // clear all notifications
        for(var i in n) {
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

function idToURL(id) {
    switch (id) {
        case "b_play":
            var data = {"method": "Player.Open", "params": {"item": {"file": ""}}};
            getURLfromTab(data);
            break;
        case "b_queue":
            var data = {"method": "Playlist.Add", "params": {"playlistid":1, "item": {"file": ""}}};
            getURLfromTab(data);
            break;
        case "b_clearlist":
            var data = {"method": "Playlist.Clear", "params": {"playlistid":1}};
            getHostData(data);
            break;
        case "b_pause":
            var data = {"method": "Input.ExecuteAction", "params": ["pause"]};
            getHostData(data);
            break;
        case "b_stop":
            var data = {"method": "Input.ExecuteAction", "params": ["stop"]};
            getHostData(data);
            break;
        case "b_skipprevious":
            var data = {"method": "Input.ExecuteAction", "params": ["skipprevious"]};
            getHostData(data);
            break;
        case "b_volmute":
            var data = {"method": "Input.ExecuteAction", "params": ["mute"]};
            getHostData(data);
            break;
        case "b_volup":
            var data = {"method": "Input.ExecuteAction", "params": ["volumeup"]};
            getHostData(data);
            break;            
        case "b_voldown":
            var data = {"method": "Input.ExecuteAction", "params": ["volumedown"]};
            getHostData(data);
            break;
        case "playpause":
            var data = {"method": "Input.ExecuteAction", "params": ["pause"]};
            // var data = {"jsonrpc":"2.0","method": "Player.PlayPause", "params": { "playerid": get_active_player() },"id":1};
            getHostData2(data,parseJSON);
            break;
        case "playmedia":
            var data = {"method": "Player.Open", "params": {"item": {"file": ""}}};
            getURLfromTab(data);
            // play_media();
            break;
        case "playing":
            getHostData2();
            // play_media();
            break;
        window.close();
    }
}

function encodeQueryData(data) {
    var k;
    var ret = [];
    for (k in data) {
        if (data[k] != '') {
            ret.push((k) + '=' + data[k]);
        }
    }
    return escape(ret.join('&'));
}

function getURLfromTab(data) {
    var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
    gettingActiveTab.then((tabs) => {
        parseYoutubeURL(data, tabs[0].url);
    });
}

function parseYoutubeURL(data, url) {

    var yt_data = {  };
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
        data["params"]["item"]["file"] = "plugin%3A%2F%2Fplugin.video.youtube%2Fplay%2F%3F" + encodeQueryData(yt_data)
        getHostData(data);
    }
}

function encodeQueryData(data) {
    var k;
    var ret = [];
    for (k in data) {
        if (data[k] != '') {
            ret.push((k) + '=' + data[k]);
        }
    }
    return escape(ret.join('&'));
}

function get_volume(resp){
    var json = JSON.parse(resp);
    console.log(json["result"]);
    kodi_volume = json["result"]["volume"];

}

browser.runtime.onMessage.addListener(handleMessage);
function set_volume(volume){
    var data = {"method": "Application.SetVolume", "params": {"volume" : parseInt(volume)}};
    getHostData2(data, null, false);
}


function handleMessage(request, sender, sendResponse) {
  if(request.selectedId){
      idToURL(request.selectedId);
      console.log("selectedID empfangengen");
  }else if(request.volume){
    set_volume(request.volume);
    kodi_volume = request.volume;
  }else if(request.onload){
    console.log("Message from the Popup script: " +request.greeting);
    var data = {"jsonrpc": "2.0", "method": "Application.GetProperties", "params": {"properties": ["volume"]}, "id": 1};
    getHostData2(data, get_volume, true);
    // sendResponse({response: "Response from background script", url: media_list[0]["name"], volume: kodi_volume});
    sendResponse({response: "Response from background script", url: media_list, volume: kodi_volume});
  }
}

function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}
