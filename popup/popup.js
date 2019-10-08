
function startaction(action, id) {
    var sending;
    switch (action) {
        case "text":
            var string = document.getElementById("textfield");
            sending = browser.runtime.sendMessage({ "text": string.value });
            break;
        case "Play/Pause":
            sending = browser.runtime.sendMessage({ "selectedId": "playpause" });
            break;
        case "eye":
            sending = browser.runtime.sendMessage({ "selectedId": "eye" });
            break;
        case "Play Media":
            sending = browser.runtime.sendMessage({ "selectedId": "playmedia", "id": id });
            break;
        case "queue Media":
            sending = browser.runtime.sendMessage({ "selectedId": "queue Media", "id": id });
            break;
        case "Stop":
            sending = browser.runtime.sendMessage({ "selectedId": "b_stop" });
            break;
        case "playing":
            sending = browser.runtime.sendMessage({ "selectedId": "playing" });
            break;
        case "mute":
            sending = browser.runtime.sendMessage({ "selectedId": "b_volmute" });
            break;
        case "prev":
            sending = browser.runtime.sendMessage({ "selectedId": "prev" });
            break;
        case "next":
            sending = browser.runtime.sendMessage({ "selectedId": "next" });
            break;
        case "up":
            sending = browser.runtime.sendMessage({ "selectedId": "up" });
            break;
        case "down":
            sending = browser.runtime.sendMessage({ "selectedId": "down" });
            break;
        case "left":
            sending = browser.runtime.sendMessage({ "selectedId": "left" });
            break;
        case "right":
            sending = browser.runtime.sendMessage({ "selectedId": "right" });
            break;
        case "ok":
            sending = browser.runtime.sendMessage({ "selectedId": "ok" });
            break;
        case "back":
            sending = browser.runtime.sendMessage({ "selectedId": "back" });
            break;
        case "context":
            sending = browser.runtime.sendMessage({ "selectedId": "context" });
            break;
        case "info":
            sending = browser.runtime.sendMessage({ "selectedId": "info" });
            break;
    }
    if(sending) sending.then(handleResponsePO, handleError);
}


function handleResponsePO(message) {
    if ("url" in message) {
        media = message.url;
        getDomainMediaList(message.url);
    }
    if ("volume" in message) {
        document.getElementById("volume").value = message.volume;
    }
    if ("muted" in message) {
        image = document.getElementById('mute');
        // image.id = "mute";
        if(message.muted){
            image.src = "/icons/mute.svg";
        }else{
            image.src = "/icons/audio.svg";
        }
    }
}

function notifyBackgroundPage() {
    var sending = browser.runtime.sendMessage({
        greeting: "Greeting from the popup script", "onload": true
    });
    sending.then(handleResponsePO, handleError);
}

function OnKeyDown(e) {
    var key = e.key;
    switch (key) {
        case "ArrowUp":
            startaction("up", 0)
            break;
        case "ArrowDown":
            startaction("down", 0)
            break;
        case "ArrowLeft":
            startaction("left", 0)
            break;
        case "ArrowRight":
            startaction("right", 0)
            break;
        case "Enter":
            startaction("ok", 0)
            break;
        case "Backspace":
            startaction("back", 0)
            break;
        case "Space":
            startaction("right", 0)
            break;
        case "Control":
            startaction("context", 0)
            break;
    }
}

function OnWheel(e) {
    var delta = e.deltaY;
    if (delta < 0) {
        startaction("up", 0)
    } else {
        startaction("down", 0)
    }
}

function OnLoad() {
    notifyBackgroundPage();
}

function getDomainMediaList(mlist){
    // get current domain
    browser.tabs.query({currentWindow: true, active: true})
    .then((tabs) => {
        var domain = extractRootDomain(tabs[0].url);
        create_media_list(domain, mlist);
    })
}


function create_media_list(domain, mlist) {
    var list = document.getElementById("media_list");
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    for (var i = mlist.length -1; i >= 0 ; i--) {
        if(domain == mlist[i]["domain"]){
            var container = document.createElement("div");
            var node = document.createElement("LI");                 // Create a <li> node
            var div = document.createElement("div");
            container.appendChild(div);
            var quere = document.createElement("div");
            quere.id = i;
            quere.className = "list item quere";
            container.appendChild(quere);

            if (mlist[i]["type"] == "youtube") {
                div.className = "list item youtube";
            } else if(mlist[i]["type"] == "vimeo"){
                div.className = "list item vimeo";
            }else if(mlist[i]["type"] == "twitch"){
                div.className = "list item twitch";
            }else if(mlist[i]["type"] == "zdf"){
                div.className = "list item zdf";
            }else if(mlist[i]["type"] == "arte"){
                div.className = "list item arte";
            }else if(mlist[i]["type"] == "ard"){
                div.className = "list item ard";
            }else {
                div.className = "list item mp4";
            }
            div.id = i;
            div.title = mlist[i]["name"];
            var textnode = document.createTextNode(mlist[i]["name"]);      // Create a text node
            if (mlist[i]["played"] == true) {
                div.style.color = "purple";
            }
            var domain_text = document.createTextNode(mlist[i]["domain"])
            div.appendChild(textnode);
            div.appendChild(document.createElement("br"));
            div.appendChild(domain_text);
            node.appendChild(container);
            list.appendChild(node);
        }
    }

}

document.addEventListener("click", (e) => {
    var id = 0;
    if (e.target.classList.contains("action")) {
        var action = e.target.id;
    }
    if (e.target.classList.contains("item")) {
        id = e.target.id;
        var action = "Play Media";
    }
    if (e.target.classList.contains("quere")) {
        action = "queue Media";
        id = e.target.id;
    }

    startaction(action, id);
});

window.addEventListener("load", OnLoad, false);
window.addEventListener("wheel", OnWheel, true);
window.addEventListener("keydown", OnKeyDown, true);

document.addEventListener("input", function (e) {
    browser.runtime.sendMessage({ "volume": e.target.value });
});


