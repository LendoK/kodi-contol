
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
        document.getElementById("host_error").innerHTML= "  invalid IP address";
        valid = false;
    }else{
        document.getElementById("host_error").innerHTML= "";
    }

    var port = document.querySelector("#port").value;
    port_pattern = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;
    var matchPort = port_pattern.exec(port);
    if(!matchPort){
        document.getElementById("port_error").innerHTML= "  invalid port";
        valid = false;
    }else{
        document.getElementById("port_error").innerHTML= "";
    }

    var user = document.querySelector("#user").value;
    user_pattern = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;
    var matchUser = user_pattern.exec(user);
    if(!matchUser){
        document.getElementById("user_error").innerHTML= "  invalid username";
        valid = false;
    }else{
        document.getElementById("user_error").innerHTML= "";
    }
    return valid;
}

function testConnection(e) {
    if(!checkInputFields()) return;
    e.target.innerHTML = "Checking...";
    e.target.style.backgroundColor = "#dee06d";
    var host = document.querySelector("#host").value.replace("http://", "");
    var port = document.querySelector("#port").value;
    var user = document.querySelector("#user").value;
    var pass = document.querySelector("#pass").value;

    var xhr = new XMLHttpRequest();

    var data = {};
    data["method"] = "JSONRPC.Version";
    data["jsonrpc"] = "2.0";
    data["id"] = 1;
    xhr.open("GET", "http://" + encodeURIComponent(user) + ":" + encodeURIComponent(pass) + "@" + encodeURIComponent(host) + ":" + encodeURIComponent(port) + "/jsonrpc?request=" + JSON.stringify(data), true);
    xhr.timeout = 5000;
    xhr.onreadystatechange = function (aEvt) {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                var resp = xhr.responseText;
                var json = JSON.parse(resp);
                if (json["result"]) buttonCheckOK(e);
                else buttonCheckERROR(e);
            } else {
                buttonCheckERROR(e);
            }
        }

        window.setTimeout(function() {
            e.target.innerHTML = "Test Connection";
            e.target.style.backgroundColor = "#eee";
        }, 2000);
    };
    xhr.send();
}

function saveOptions(e) {
    browser.storage.local.set({
        host: document.querySelector("#host").value.replace("http://", ""),
        port: document.querySelector("#port").value,
        user: document.querySelector("#user").value,
        pass: document.querySelector("#pass").value
    });

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
        document.querySelector("#port").value = result.port || '';
        document.querySelector("#user").value = result.user || '';
        document.querySelector("#pass").value = result.pass || '';
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