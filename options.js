
document.getElementById("save_button").addEventListener("click", function(e){
    saveOptions(e);
});

document.getElementById("test_button").addEventListener("click", function(e){
    testConnection(e);
});

function checkInputFields(){
    valid = true;
    var host = document.querySelector("#host").value.replace("http://", "");
    host_pattern = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b$/;
    var matchHost = host_pattern.exec(host);
    if(!matchHost){
        document.getElementById("host_error").innerHTML= "  invalid!";
        valid = false;
    }else{
        document.getElementById("host_error").innerHTML= "";
    }
    return valid;
}


function getHostDateFromInput(){
    hostData = {}
    hostData["host"] = document.querySelector("#host").value.replace("http://", "");
    return hostData;
}

function testConnection(e) {
    if(!checkInputFields()) return;
    e.target.innerHTML = "Checking...";
    e.target.style.backgroundColor = "#dee06d";
    hostData = getHostDateFromInput();
    var data = {"method": "JSONRPC.Version"};

    func = function(resp){
        var json = JSON.parse(resp);
        if (json["result"]){
            buttonCheckOK(e);
            // enableBrowserAction();
        }
        else{
            buttonCheckERROR(e);
            // disableDisableAction();
        }
    };

    error_func = function(){
        buttonCheckERROR(e);
        // disableDisableAction();
    };

    final_func = function(){
        window.setTimeout(function() {
            e.target.innerHTML = "Test Connection";
            e.target.style.backgroundColor = "#eee";
        }, 2000);
    };

    sendRequest(data, hostData, func, true, error_func, final_func, "GET");
}

function saveHostData(){
    browser.storage.local.set({
        host: document.querySelector("#host").value.replace("http://", ""),
    });
}

function saveOptions(e) {
    saveHostData();
    e.target.innerHTML = "Saved";
    e.target.style.backgroundColor = "#6de075";

    window.setTimeout(function() {
        e.target.innerHTML = "Save";
        e.target.style.backgroundColor = "#eee";
    }, 2000);
}

function restoreOptions() {
    var getting = browser.storage.local.get(null, function(result){
        document.querySelector("#host").value = result.host || '';
    });
}

function buttonCheckOK(e) {
    e.target.innerHTML = "Ok";
    e.target.style.backgroundColor = "#6de075";
}

function buttonCheckERROR(e) {
    e.target.innerHTML = "Error";
    e.target.style.backgroundColor = "#ff4949";
}

document.addEventListener("DOMContentLoaded", restoreOptions);