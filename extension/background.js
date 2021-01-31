chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log('The color is green.');
  });
  createSetIconAction("images/valid@4x.png", function(setIconAction) {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'boards.greenhouse.io'}
          })
        ],
        actions: [ setIconAction, new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);        
  });
});

// some bug from https://stackoverflow.com/questions/28750081/cant-pass-arguments-to-chrome-declarativecontent-seticon/28765872#28765872
function createSetIconAction(path, callback) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var image = new Image();
  image.onload = function() {
    ctx.drawImage(image,0,0,19,19);
    var imageData = ctx.getImageData(0,0,19,19);
    var action = new chrome.declarativeContent.SetIcon({imageData: imageData});
    callback(action);
  }
  image.src = chrome.runtime.getURL(path);
}