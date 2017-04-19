media_list = [];

function onError(error) {
  console.log(`Error: ${error}`);
}

function onGot(item) {
  var ip = "192.168.178.28";
  if (item.ip) {
    ip = item.ip;
  }
//   document.body.style.border = "10px solid " + color;
}

// var getting = browser.storage.local.get("ip");
// getting.then(onGot, onError);
console.log("content script sending message");
/*
If the click was on a link, send a message to the background page.
The message contains the link's URL.
*/
function notifyExtension(e) {
  // var target = e.target;
  // while ((target.tagName != "A" || !target.srcUrl) && target.parentNode) {
  //   target = target.parentNode;
  // }
  // if (target.tagName != "A")
  //   return;

  console.log("content script sending message");
  // browser.runtime.sendMessage({"url": target.srcUrl});
}

/*
Add notifyExtension() as a listener to click events.
*/
window.addEventListener("click", notifyExtension);



