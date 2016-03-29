var url = '/checkForUpdates';
var timeToCheck;
var userToCheck;
this.onmessage = function(latest) {
    
    if(Object.prototype.toString.call(latest.data) === '[object Array]' ) {
	timeToCheck = latest.data[0];
	userToCheck = latest.data[1];
    } else {
	timeToCheck = latest.data;
	userToCheck = "req.user._id";
    }
}

var HttpRequest = new XMLHttpRequest();
var HttpClient = function () {
    
    this.get = function (Url, Callback) {
        
        HttpRequest.onreadystatechange = function () {
            if (HttpRequest.readyState == 4 && HttpRequest.status == 200) {
                console.log(HttpRequest.responseText.length);
                Callback(HttpRequest.responseText);
            }              
        }        
        HttpRequest.open("GET", Url, true);
        HttpRequest.send(null);
    }
}
var Client = new HttpClient();

function timedPoll() {
    var params = "?time=" + timeToCheck + "&user=" + userToCheck;
    if(timeToCheck != undefined) {
	Client.get(url + params, function (answer) {
	    if(answer === "true") {
		postMessage(answer);
	    }
	});
    }
  
    setTimeout(function() {
	timedPoll();
    }, 3000);
   
}

timedPoll();
