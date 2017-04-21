/*
Given the name of a beast, get the URL to the corresponding image.
*/
function onResponse(response) {
  console.log(`Received ${response}`);
  // var x = document.getElementById("volume").value;

  
}

function onError(error) {
  console.log(`Error: ${error}`);
}


function startaction(action, id) {
  switch (action) {
    case "Play/Pause":
      console.log("start playing or pause");
     browser.runtime.sendMessage({"selectedId": "playpause"});
     break;
    case "Play Media":
      browser.runtime.sendMessage({"selectedId": "playmedia", "id": id});
      break;
    case "queue Media":
      browser.runtime.sendMessage({"selectedId": "queue Media", "id": id});
      break;
    case "Stop":
      // stop();
      browser.runtime.sendMessage({"selectedId": "b_stop"});
      break;
    case "playing":
      // stop();
      browser.runtime.sendMessage({"selectedId": "playing"});
      break;
    case "mute":
      // stop();
      browser.runtime.sendMessage({"selectedId": "b_volmute"});
      break;
    case "prev":
      // stop();
      browser.runtime.sendMessage({"selectedId": "b_skipprevious"});
      break;
    case "next":
      // stop();
      browser.runtime.sendMessage({"selectedId": "next"});
      break;
     case "Send local file":
      // stop();
      openMyPage()
      break;
  }
}



function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
  if(message.url){
    console.log(`path:  ${message.url}`);
    media = message.url;
    creat_media_list(message.url);
  }
  if(message.volume){
    console.log("load volume");
    document.getElementById("volume").value = message.volume;
  }
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

function notifyBackgroundPage() {
  var sending = browser.runtime.sendMessage({
    greeting: "Greeting from the popup script", "onload" : true
  });
  sending.then(handleResponse, handleError);  
}


window.addEventListener("load", OnLoad, false);

function OnLoad() {
    console.log("POPUP: OnLoad");  
    notifyBackgroundPage();
    
    // var data = {"jsonrpc": "2.0", "method": "Application.GetProperties", "params": {"properties": ["volume"]}, "id": 1};
}

function creat_media_list(mlist){
    var i;
    var list = document.getElementById("media_list");
    for (i = 0; i < mlist.length; i++) {
      var container = document.createElement("div");
      var node = document.createElement("LI");                 // Create a <li> node
      var div = document.createElement("div");
      container.appendChild(div);
      var quere = document.createElement("div");
      quere.id = i;
      quere.className ="list item quere";
      container.appendChild(quere);
      // div.appendChild(quere);
      
      if(mlist[i]["type"] == "youtube"){
        div.className = "list item youtube";
      }else{
        div.className = "list item mp4";
      }
      div.id = i;
      var textnode = document.createTextNode(mlist[i]["name"]);      // Create a text node
      div.appendChild(textnode);
      node.appendChild(container);    
      list.appendChild(node);
    }
 
}


document.addEventListener("click", (e) => {
  console.log("click: " +e.target.id);
  var id = 0;
  if (e.target.classList.contains("action")) {
    var action = e.target.id;
    console.log("action: "+action);
  }
  if(e.target.classList.contains("item")){
      id = e.target.id;

      console.log("play from media list" +e.target.id);
      var action = "Play Media";
  }
  if(e.target.classList.contains("quere")){
      action = "queue Media";
      id = e.target.id;
  }

    startaction(action, id);
    console.log("event listener");
});

document.addEventListener("input", function(e){ 
  console.log("volume bar"+ e.target.value );
  browser.runtime.sendMessage({"volume": e.target.value });
});

function openMyPage() {
  console.log("injecting");
   browser.tabs.create({
     "url": "/local_files/local_files.html"
   });
}

