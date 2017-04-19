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


function startaction(action) {
  switch (action) {
    case "Play/Pause":
      console.log("start playing or pause");
     browser.runtime.sendMessage({"selectedId": "playpause"});
     break;
    case "Play Media":

      browser.runtime.sendMessage({"selectedId": "playmedia"});
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
  }
}



function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
  if(message.url){
    console.log(`path:  ${message.url}`);
    media = message.url;
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


document.addEventListener("click", (e) => {
  if (e.target.classList.contains("action")) {
    var action = e.target.textContent;
    // var chosenBeastURL = beastNameToURL(chosenBeast);
    startaction(action);
    console.log("event listener");
    
    // browser.tabs.executeScript(null, { 
    //   file: "kodicommander.js" 
    // });

    // var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
    // gettingActiveTab.then((tabs) => {
    //   browser.tabs.sendMessage(tabs[0].id, {beastURL: chosenBeastURL});
    // });
  }
  // else if (e.target.classList.contains("clear")) {
  //   browser.tabs.reload();
  //   window.close();
  // }
});

document.addEventListener("input", function(e){ 
  console.log("volume bar"+ e.target.value );
  browser.runtime.sendMessage({"volume": e.target.value });
});

