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
    case "text":
    var string = document.getElementById("textfield");
    console.log("string value:" + string.value);
     browser.runtime.sendMessage({ "text": string.value});
     break;
    case "Play/Pause":
     browser.runtime.sendMessage({"selectedId": "playpause"});
     break;
    case "eye":
     browser.runtime.sendMessage({"selectedId": "eye"});
     break;
    case "Play Media":
      browser.runtime.sendMessage({"selectedId": "playmedia", "id": id});
      break;
    case "queue Media":
      browser.runtime.sendMessage({"selectedId": "queue Media", "id": id});
      break;
    case "Stop":
      browser.runtime.sendMessage({"selectedId": "b_stop"});
      break;
    case "playing":
      browser.runtime.sendMessage({"selectedId": "playing"});
      break;
    case "mute":
      browser.runtime.sendMessage({"selectedId": "b_volmute"});
      break;
    case "prev":
      browser.runtime.sendMessage({"selectedId": "prev"});
      break;
    case "next":
      browser.runtime.sendMessage({"selectedId": "next"});
      break;
    case "up":
      browser.runtime.sendMessage({"selectedId": "up"});
      break;
    case "down":
      browser.runtime.sendMessage({"selectedId": "down"});
      break;
    case "left":
      browser.runtime.sendMessage({"selectedId": "left"});
      break;
    case "right":
      browser.runtime.sendMessage({"selectedId": "right"});
      break;
    case "ok":
      browser.runtime.sendMessage({"selectedId": "ok"});
      break;
    case "back":
      browser.runtime.sendMessage({"selectedId": "back"});
      break;
    case "context":
      browser.runtime.sendMessage({"selectedId": "context"});
      break;
     case "info":
      browser.runtime.sendMessage({"selectedId": "info"});
      break;
    case "text":
      // var text = prompt("Send string to Kodi");
      // browser.runtime.sendMessage({"selectedId": "text"});
      // var text = window.prompt("send string to Kodi", "Hello Kodi");
      // console.log("der text:"+text);
      // var func => {var text = window.prompt("send string to Kodi", "Hello Kodi");};
      // browser.runtime.sendMessage({"selectedId": "context"});
      break;
    case "Send local file":
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
window.addEventListener("wheel", OnWheel, true);
window.addEventListener("keydown", OnKeyDown, true);

function OnKeyDown(e){
  var key = e.key; 
  console.log("key: "+ e.key);
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

function OnWheel(e){
  // var wheelEvent = new WheelEvent(null,null); 
  var delta = e.deltaY;
  // console.log("maus rad: " +e.deltaY);
  if(delta < 0){
    startaction("up", 0)
  }else{
    startaction("down", 0)
  }
}

function OnLoad() {
    console.log("POPUP: OnLoad");  
    notifyBackgroundPage();
    // window.focus();
    
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
      if(mlist[i]["played"] == true){
        div.style.color = "purple";
      }
      var domain = document.createTextNode(mlist[i]["domain"])
      div.appendChild(textnode);
      div.appendChild(document.createElement("br"));
      div.appendChild(domain);
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

