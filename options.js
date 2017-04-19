document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save_button").addEventListener("click", function(e){
    saveOptions(e);
});

document.getElementById("test_button").addEventListener("click", function(e){
    testConnection(e);
});

function testConnection(e) {
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
    
    console.log(JSON.stringify(data));
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