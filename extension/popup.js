let fillApplication = document.getElementById('fillApplication');

chrome.storage.sync.get('color', function(data) {
  fillApplication.style.backgroundColor = data.color;
  fillApplication.setAttribute('value', data.color);
});

fillApplication.onclick = function(element) {
  if (window.localStorage.getItem("applrToken")) {
    let color = element.target.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(tabs[0].id, {code: 'document.body.style.backgroundColor = "' + color + '";'});
      chrome.storage.sync.get(['token'], result => {
        console.log('Got token: ', result.key)
        chrome.tabs.executeScript(tabs[0].id, {
          code: `const secretToken = "${window.localStorage.getItem('applrToken') || 'none'}";`
        }, () => {
          chrome.tabs.executeScript(tabs[0].id, {
            file: 'inject.js'
          });
        });
      })
    })
  } else {
    let button = document.getElementById("fillApplication")
    button.style.backgroundColor = "#FF0000"
    button.innerHTML = "Not signed in!"
  }
};

chrome.runtime.sendMessage({
  action: 'updateIcon',
  value: false
});