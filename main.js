const req_url_root = "https://www.messenger.com";
var counter = {

  token: undefined,
  userid: undefined,
  last_right_click_bar: undefined,
  last_right_click_bar_index: undefined,

  main: function() {
    counter.setup_receiver().then(function() { // receive token
      counter.setup_custom_color_button();
    });
  },

  setup_receiver: function() {
    return new Promise(function(solve) {
      chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.token && message.userid) {
          if (counter.token)
            return;
          counter.token = message.token;
          counter.userid = message.userid;
          solve();
        }
      });
    });
  },

  setup_custom_color_button: function() {
    var target = document.querySelector("#js_4 > div:nth-child(3) > div._1li_ > div > div:nth-child(3)");
    var new_button = target.cloneNode(true);
    new_button.querySelector('._3szq').innerText = chrome.i18n.getMessage("Btn_text") + ' - ' + chrome.i18n.getMessage("extName");

    var color = target.querySelector('svg > path').getAttribute('fill');

    var color_picker = document.createElement('input');
    color_picker.id = 'color-picker';
    color_picker.type = 'color';
    color_picker.style['z-index'] = '-999';
    color_picker.value = color;
    color_picker.onchange = function() {
      var color = color_picker.value;
      console.log(color);
      counter.set_color(color, counter.get_threadid());
      counter.set_button_color(new_button, color);
    };
    new_button.appendChild(color_picker);
    new_button.onclick = function() {
      console.log("click");
      color_picker.click();
    };
    target.parentNode.insertBefore(new_button, target.nextSibling);
  },

  set_color: function(color, fbid) {
    var data_json = {
      "color_choice": color,
      "thread_or_other_fbid": fbid,
      "fb_dtsg": counter.token,
      "counter": true
    };
    counter.xhr("/messaging/save_thread_color/?source=thread_settings&dpr=1", data_json, function(response) {
      response.text().then(function(text) {
        console.log(text);
      });
    });
  },

  get_threadid: function() {
    console.log(document.querySelector('._1ht5._2il3._5l-3 > [role=rowheader]'));
    var row_header_id = document.querySelector('._1ht5._2il3._5l-3 > [role=rowheader]').id;
    return row_header_id.match(/\d*$/);
  },

  set_button_color: function(btn, color) {
    var paths = btn.querySelectorAll('svg > path');
    for (var i = 0; i < 4; i++)
      paths[i].setAttribute('fill', color);
    paths[4].setAttribute('stroke', color);
  },

  /**
   * url: req url
   * data_json: req body
   * callback: the function you need to handle the response
   */
  xhr: function(url, data_json, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', req_url_root + url);
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded; charset=utf-8');
    xhr.onprogress = function(event) {
      //console.log(event, event.lengthComputable);
    };
    xhr.onload = function() {
      callback({
        text: function() {
          return new Promise(function(solve) {
            solve(xhr.responseText);
          });
        }
      });
    };
    xhr.send(counter.json2urlencode(data_json));
    /*fetch(req_url_root + url, {
    headers : {
    'content-type' : 'application/x-www-form-urlencoded; charset=utf-8',
    'x-msgr-region' : 'ATN'
    },
    mode : 'cors',
    method : "POST",
    credentials : 'include',
    cache : 'default',
    body : counter.json2urlencode(data_json)
    }).then(callback);*/
  },

  res_tranformat_to_JSON: function(text) {
    var res = text.replace(/^for \(;;\);/, '');
    return JSON.parse(res);
  },

  json2urlencode: function(data_json) {
    return Object.keys(data_json).map(function(key) {
      return encodeURIComponent(key) + ((data_json[key] !== undefined) ? ('=' + encodeURIComponent(data_json[key])) : '');
    }).join('&');
  }

};

var first = false;
if (location.pathname === '/login.php' && location.search === "?next=https%3A%2F%2Fwww.messenger.com%2Ft%2F1070726462942749%2F") {
  location = location.href.replace(/#/, '%23');
  alert('Please login the messenger.');
} else {
  counter.main();
}
