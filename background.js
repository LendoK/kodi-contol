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


function get_settings(){
    var ip2 = 0;
    var gettingItem = browser.storage.local.get('host');
    gettingItem.then((res) => {
        host = res.host
        console.log("getting host ip: " + host);
        var re = new RegExp(ip);
        ip2 = ip;
    });
    var data = {"jsonrpc": "2.0", "method": "Application.GetProperties", "params": {"properties": ["volume"]}, "id": 1};
    getHostData2(data, get_volume, true);
}

function check_media(filepath){  
    // mp4|mkv|mov|avi|flv|wmv|asf|mp3|flac|mka|m4a|aac|ogg|pls|jpg|png|gif|jpeg|tiff
    // if ( /\.(mp4|mkv|mov|avi|flv|wmv|asf|mp3|flac|mka|m4a)$/i.test(filepath)){
        // |ts


    if ( /\.(mp4|mkv|mov|avi|flv|wmv|asf|mp3|flac|mka|m4a)+/i.test(filepath)){
        var re = new RegExp(host);
        var ping = new RegExp(/(ping.gif)+/i);
        if(re.test(filepath)){
            console.log("invalid or request was to host: " + host);
            return false;
        }else if(ping.test(filepath)){
            return false;            
        }else{
            return true;
        }
    }
}


function logURL(requestDetails) {
    // console.log(requestDetails.url);
    var url = requestDetails.url;
    if (check_media(url)){
        // media_list = [];
        // console.log("Loading: " + requestDetails.url);
        var filename = url.replace(/^.*[\\\/]/, '');
        var singleObj = {};
        var i =0;
        for(i = 0; i < media_list.length; i++){
            if(media_list[i]['name'] == filename){
                return;
            }
        }
        singleObj['name'] = filename;
        singleObj['path'] = url;
        singleObj['type'] = "video";
        singleObj['domain'] = extractRootDomain(url);
        singleObj["played"] = false;
        media_list.push(singleObj);
        console.log("Loading: " + singleObj['name']);  
        unplayed +=1;
        set_badgeText();
    }
    var matchVideo = videoPattern.exec(url);
    var matchList = playlistPattern.exec(url);

    if(matchVideo || matchList){
        console.log("found youtube video");
        var singleObj = {};
        var i =0;
        if(matchVideo){
            filename = matchVideo[1];
        }else{
            filename = matchList[1];
        }
        for(i = 0; i < media_list.length; i++){
            if(media_list[i]['name'] == filename){
                return;
            }
        }
        singleObj['type'] = "youtube";
        singleObj['name'] = filename;
        singleObj['path'] = url;
        singleObj['domain'] = extractRootDomain(url);
        singleObj["played"] = false;
        
        // get_yt_title(matchVideo[1]);

        media_list.push(singleObj);
        unplayed +=1;        
        set_badgeText();
        
    }
    if(media_list.length > 10){
        if (media_list[9]["palyed"]== false){
            unplayed -=1;
        }
        media_list.shift();

        set_badgeText();        
    }
}

function set_badgeText(){
    // browser.browserAction.setBadgeBackgroundColor({color: "grey"});
    if(unplayed > 0){
        browser.browserAction.setBadgeText({text: (unplayed).toString()});
    }else{
        browser.browserAction.setBadgeText({text: ""});
    }
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get the hostname
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];

    return hostname;
}

function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
    }
    return domain;
}


/*
function get_yt_title(youtubeid){
    var xhr = new XMLHttpRequest();
    var apikey = 0;
    // https://www.googleapis.com/youtube/v3/videos?part=snippet&id={YOUTUBE_VIDEO_ID}&fields=items(id%2Csnippet)&key={YOUR_API_KEY}
    xhr.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + youtubeid);
    xhr.timeout = 5000;
    xhr.onreadystatechange = function (aEvt) {
    if (xhr.readyState == 4) {
        if(xhr.status == 200 && func) {
            var resp = xhr.responseText;
            console.log(resp);

        }
    };
    xhr.send();
    // return resp[]
}
*/

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
  title: browser.i18n.getMessage("contextSendToKodi"),
  contexts: ["image","video"]
}, onCreated);



function play_media(id, queue){
    if(media_list[id]){
        if(media_list[id]["type"] == "video"){
            var data = {"jsonrpc":"2.0","method":"Player.Open","params":{"item":{"file":media_list[id]["path"]}},"id":1};
            if(queue){
                 data = {"method": "Playlist.Add", "params": {"playlistid":1, "item": {"file": media_list[id]["path"]}}};
            }
            getHostData2(data,parseJSON);
        }if(media_list[id]["type"] == "youtube"){
            var data = {"method": "Player.Open", "params": {"item": {"file": ""}}};
            if(queue){
                data = {"method": "Playlist.Add", "params": {"playlistid":1, "item": {"file": media_list[id]["path"]}}};
            }
            parseYoutubeURL(data,media_list[id]["path"]);
        }
        if(media_list[id]["played"] == false){
            unplayed -=1;
            media_list[id]["played"] = true;
            set_badgeText();        
        }
    }else{
        notify("Error Nothing to play");
    }
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


function parseJSON(resp) {
    console.log(resp);
    var json = JSON.parse(resp);
    
    if (json["result"] && json["result"] == "OK") notify("Sent to KODI");
    else notify("Error recived from KODI");
}


function send_text(){
  var text = window.prompt("send string to Kodi", "Hello Kodi");
  console.log("der text:"+text);
}


function idToURL(id, mediaid) {
    switch (id) {
        case "queue Media":
            play_media(mediaid,true);
            break;
        case "b_clearlist":
            var data = {"method": "Playlist.Clear", "params": {"playlistid":1}};
            getHostData2(data,parseJSON);
            break;
         case "eye":
            fullscreen = !fullscreen;
            var data = {"method": "GUI.SetFullscreen", "params": [fullscreen]};
            getHostData2(data,parseJSON);
            break;
        case "b_stop":
            var data = {"method": "Input.ExecuteAction", "params": ["stop"]};
            getHostData2(data,parseJSON);
            break;
        case "info":
            var data = {"method": "Input.ShowOSD", "params": []};
            getHostData2(data,parseJSON);
            break;
        case "prev":
            var data = {"method": "Input.ExecuteAction", "params": ["skipprevious"]};
            getHostData2(data,parseJSON);
            break;
        case "next":
            var data = {"method": "Input.ExecuteAction", "params": ["skipnext"]};
            getHostData2(data,parseJSON);
            break;
        case "b_volmute":
            var data = {"method": "Input.ExecuteAction", "params": ["mute"]};
            getHostData2(data,parseJSON);
            break;
        case "b_volup":
            var data = {"method": "Input.ExecuteAction", "params": ["volumeup"]};
            getHostData2(data,parseJSON);
            break;            
        case "b_voldown":
            var data = {"method": "Input.ExecuteAction", "params": ["volumedown"]};
            getHostData2(data,parseJSON);
            break;
        case "up":
            var data = {"method": "Input.Up", "params": []};
            getHostData2(data,parseJSON);
            break;
         case "down":
            var data = {"method": "Input.Down", "params": []};
            getHostData2(data,parseJSON);
            break;
         case "left":
            var data = {"method": "Input.Left", "params": []};
            getHostData2(data,parseJSON);
            break;
         case "right":
            var data = {"method": "Input.Right", "params": []};
            getHostData2(data,parseJSON);
            break;
         case "ok":
            var data = {"method": "Input.Select", "params": []};
            getHostData2(data,parseJSON);
            break;
         case "back":
            var data = {"method": "Input.Back", "params": []};
            getHostData2(data,parseJSON);
            break;
         case "context":
            var data = {"method": "Input.ContextMenu", "params": []};
            getHostData2(data,parseJSON);
            break;
        case "text":
            send_text();
            break;
        case "playpause":
            var data = {"method": "Input.ExecuteAction", "params": ["pause"]};
            // var data = {"jsonrpc":"2.0","method": "Player.PlayPause", "params": { "playerid": get_active_player() },"id":1};
            getHostData2(data,parseJSON);
            break;
        case "playmedia":
            // var data = {"method": "Player.Open", "params": {"item": {"file": ""}}};
            // getURLfromTab(data);
            idToURL("b_stop", 0); 
            play_media(mediaid,false);
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
        getHostData2(data,parseJSON);
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


//////////////////////////////////////////////////////messageing//////////////////////////////////////////////////


function handleMessage(request, sender, sendResponse) {
  if(request.selectedId){
      idToURL(request.selectedId, request.id);
      console.log("selectedID empfangengen");
    }else if(request.text){
        var data = {"jsonrpc": "2.0", "method": "Input.SendText", "params": [request.text], "id": 1};
        getHostData2(data, parseJSON, false);

    }else if(request.volume){
        set_volume(request.volume);
        kodi_volume = request.volume;
    }else if(request.onload){
        console.log("Message from the Popup script: " +request.greeting);
        var data = {"jsonrpc": "2.0", "method": "Application.GetProperties", "params": {"properties": ["volume"]}, "id": 1};
        getHostData2(data, get_volume, true);
        sendResponse({response: "Response from background script", url: media_list, volume: kodi_volume});
  }
}

function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
}

function handleError(error) {
  console.log(`Error: ${error}`);
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


////////////////////////////////////////////////////////////////listeners////////////////////////////////////////////////////

window.addEventListener("load", get_settings, false);

browser.webRequest.onBeforeRequest.addListener(
  logURL,
//   {urls:[pattern], types:["image"]},
//   {urls:[pattern], types:["media"]}
    {urls: ["<all_urls>"]}
);

browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "send-kodi":
      console.log("from context menu: " , info.srcUrl);
      var data = {"jsonrpc":"2.0","method":"Player.Open","params":{"item":{"file":info.srcUrl}},"id":1};
      getHostData2(data,parseJSON);
      break;
  }
});

browser.runtime.onMessage.addListener(handleMessage);
function set_volume(volume){
    var data = {"method": "Application.SetVolume", "params": {"volume" : parseInt(volume)}};
    getHostData2(data, null, false);
}