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
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
function onCreated(n) {
    if (browser.runtime.lastError) {
        console.log(`Error: ${browser.runtime.lastError}`);
    } else {
        // console.log("Item created successfully");
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

function onResponse(response) {
    console.log(`Received ${response}`);
}

function handleError(error) {
    console.log(`Error: ${error}`);
}


//reqest function to submit json data
function sendRequest(data, hostData, func, note, error_func, final_func, methode) {
    var xhr = new XMLHttpRequest();
    data["jsonrpc"] = "2.0";
    data["id"] = 1;
    if (typeof(methode)==='undefined') methode = "POST";
    if(methode == "POST"){
        request = "http://" + encodeURIComponent(hostData.host)
            + ":8080"
            + "/jsonrpc";
    }else{
        request = "http://" + encodeURIComponent(hostData.host)
            + ":8080"
            + "/jsonrpc?request="
            + JSON.stringify(data);
    }
    xhr.open(methode, request, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.timeout = 5000;
    xhr.onreadystatechange = function (aEvt) {
        if (note) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200 && func) {
                    var resp = xhr.responseText;
                    func(resp);
                } else {
                    if(error_func){
                        error_func();
                    }
                }
            }
            if(final_func){
                final_func();
            }
        }
    };
    if(methode == "POST"){
        xhr.send(JSON.stringify(data));
    }else{
        xhr.send();
    }
}

function enableBrowserAction(){
    browser.browserAction.enable();
    browser.browserAction.setTitle({"title": "KodiControl: connected"})
}

function disableDisableAction(){
    browser.browserAction.disable();
    browser.browserAction.setTitle({"title": "KodiControl: not connected to a Kodi device!"})
}