chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    console.log("This is a first install!");
    chrome.tabs.create({
      url : "firstRun.html"
    });
    chrome.tabs.create({
      url : "https://www.messenger.com/"
    });
  } else if (details.reason == "update") {
    var thisVersion = chrome.runtime.getManifest().version;
    console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    chrome.tabs.create({
      url : "firstRun.html"
    });
    chrome.tabs.create({
      url : "https://www.messenger.com/"
    });
  }
});

var background = {

  token : undefined,

  setup_package_listener : function () {
    chrome.webRequest.onBeforeRequest.addListener(function (details) {
      var str = background.arrayBuffer2utf8(details.requestBody.raw[0].bytes);
      var url = background.url_decode(str);
      if (url.match(/counter=true/)) {
        console.log('It\'s form extension.');
        return;
      }
      console.log(details);
      var token = background.token = background.toke_out_token(url),
      userid = background.toke_out_userid(url);
      console.log(userid);
      console.log(token);
      background.send_to_tabs({
        token : token,
        userid : userid
      });
    }, {
      urls : ["*://www.messenger.com/ajax/mercury/threadlist_info.php?dpr=1"]
    }, ['requestBody']);
  },

  arrayBuffer2utf8 : function (bytes) {
    return String.fromCharCode.apply(null, new Uint8Array(bytes));
  },

  url_decode : function (str) {
    return decodeURIComponent(str);
  },

  toke_out_token : function (url) {
    var matches = url.match(/fb_dtsg=.*:/);
    if (matches !== null)
      return matches[0].replace(/^fb_dtsg=/, "");
    else {
      console.error('Token not found');
      return "";
    }
  },

  toke_out_userid : function (url) {
    var matches = url.match(/__user=\d*/);
    if (matches !== null)
      return matches[0].replace(/^__user=/, "");
    else {
      console.error('User ID not found');
      return "";
    }
  },

  send_to_tabs : function (data) {
    chrome.tabs.query({}, function (tabs) {
      for (var i in tabs)
        chrome.tabs.sendMessage(tabs[i].id, data, function (response) {});
    });
  }

};

background.setup_package_listener();
