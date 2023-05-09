
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var activeTab = tabs[0];
  const urlParams = new URLSearchParams(activeTab.url);
  entries = urlParams.entries();

  var i = 0;
  for (const entry of entries) {
    if (i++ == 0) {
      if (entry[0].includes('?')) {
        addUpdateButton();
        addField(entry[0].split('?').pop(), entry[1]);
      } else {
        addNotFoundMessage();
        document.body.style.width = 'auto';
      }

    } else addField(entry[0], entry[1]);
  }
});

let div = document.getElementById("main");

function addNotFoundMessage(){
  let p = document.createElement("p");
  p.setAttribute("id", "not_found");
  p.appendChild(document.createTextNode("No URL params found!"));
  div.appendChild(p);
}

document.getElementById("add").addEventListener('click', () => {
  if (document.getElementById('not_found') !== null) document.getElementById('not_found').remove();

});

function addUpdateButton(){
  let toolbar = document.getElementById("toolbar");
  let button = document.createElement("button");
  button.setAttribute("id", "update");

  let icon = document.createElement("i");
  icon.setAttribute("class", "fa fa-refresh");

  button.appendChild(icon);
  button.appendChild(document.createTextNode("Update"));

  toolbar.appendChild(button);
  div.appendChild(document.createElement("br"));

  document.getElementById("update").addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      const urlParams = new URLSearchParams(activeTab.url);
      var entries = urlParams.entries();
      var newUrl = "";

      var i = 0;
      for (const entry of entries) {
        if (i++ == 0) {
          newUrl += entry[0].split('?')[0] + '?';
        } else break;
      }

      var elements = document.querySelectorAll('input[type="text"]');

      for (var i = 0; i < elements.length; i += 2) {
        newUrl += elements[i].value + "=" + elements[i + 1].value;
      }
      chrome.tabs.update(undefined, { url: newUrl });
    });
  });
}


function addField(key, value){
  let span = document.createElement("span");
  span.setAttribute("class", "field");

  let key_field = document.createElement("input");
  key_field.setAttribute("type", "text");
  key_field.setAttribute("value", key);

  let value_field = document.createElement("input");
  value_field.setAttribute("type", "text");
  value_field.setAttribute("value", value);

  span.appendChild(key_field);
  span.appendChild(document.createTextNode(" = "));
  span.appendChild(value_field);
  span.appendChild(document.createElement("br"));

  div.appendChild(span);
}