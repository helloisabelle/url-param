
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const activeTab = tabs[0];
  const urlParams = new URLSearchParams(activeTab.url);
  entries = urlParams.entries();

  let i = 0;
  for (const entry of entries) {
    if (i++ == 0) {
      if (entry[0].includes('?')) {
        addUpdateButton();
        addField(entry[0].split('?').pop(), entry[1]);
      } else addNotFoundMessage();
    } else addField(entry[0], entry[1]);
    if (i == 1) break;
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
  if (document.getElementById('not_found') !== null) {
    document.getElementById('not_found').remove();
  }

  addField("", "");
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

  document.getElementById("update").addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      const urlParams = new URLSearchParams(activeTab.url);
      const entries = urlParams.entries();
      let newUrl = "";

      const [first] = entries;
      newUrl += first[0].split('?')[0] + '?';

      const elements = document.querySelectorAll('input[type="text"]');
      for (let i = 0; i < elements.length; i += 2) {
        if (i != 0) newUrl += "&";
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

  let remove = document.createElement("button");
  remove.setAttribute("id", "delete");
  remove.setAttribute("class", "remove");

  let trash = document.createElement("i");
  trash.setAttribute("class", "fa fa-trash-o");
  remove.appendChild(trash);

  span.appendChild(key_field);
  span.appendChild(document.createTextNode(" = "));
  span.appendChild(value_field);
  span.appendChild(remove);

  div.appendChild(span);
}