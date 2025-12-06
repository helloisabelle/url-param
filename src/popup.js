let paramCount = 0;
let pathCount = 0;

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const activeTab = tabs[0];
  const url = new URL(activeTab.url);
  
  // Display protocol and hostname
  displayProtocolAndHost(url.protocol, url.hostname, url.port);
  
  // Display path segments
  const pathSegments = url.pathname.split('/').filter(segment => segment !== '');
  pathSegments.forEach(segment => {
    addPathSegment(segment, 'path');
  });

  // Display hash (fragment) segments (e.g. Gmail uses #inbox/...)
  if (url.hash) {
    const hashPath = url.hash.replace(/^#\/?/, ''); // remove leading # or #/
    if (hashPath) {
      const hashSegments = hashPath.split('/').filter(segment => segment !== '');
      hashSegments.forEach((segment, idx) => {
        addPathSegment(segment, 'hash', idx === 0);
      });
    }
  }

  // Display URL parameters
  const params = Array.from(url.searchParams.entries());
  if (params.length > 0) {
    params.forEach(([key, value]) => {
      addParamField(key, value);
    });
  }
  
  // Add update button
  addUpdateButton();
});

const mainDiv = document.getElementById("main");

function displayProtocolAndHost(protocol, hostname, port) {
  const urlBaseDiv = document.createElement("div");
  urlBaseDiv.setAttribute("class", "url-base");
  urlBaseDiv.setAttribute("id", "url-base");
  
  const protocolSpan = document.createElement("span");
  protocolSpan.setAttribute("class", "protocol");
  protocolSpan.textContent = protocol + "//";
  
  const hostnameInput = document.createElement("input");
  hostnameInput.setAttribute("type", "text");
  hostnameInput.setAttribute("value", hostname);
  hostnameInput.setAttribute("id", "hostname");
  hostnameInput.setAttribute("class", "hostname-input");
  
  urlBaseDiv.appendChild(protocolSpan);
  urlBaseDiv.appendChild(hostnameInput);
  
  if (port) {
    const portSpan = document.createElement("span");
    portSpan.textContent = ":";
    const portInput = document.createElement("input");
    portInput.setAttribute("type", "text");
    portInput.setAttribute("value", port);
    portInput.setAttribute("id", "port");
    portInput.setAttribute("class", "port-input");
    urlBaseDiv.appendChild(portSpan);
    urlBaseDiv.appendChild(portInput);
  }

  // allow Enter on hostname/port to update
  hostnameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') updateUrl(); });
  if (port) portInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') updateUrl(); });
  
  mainDiv.appendChild(urlBaseDiv);
  
  // Path section header + inline Add button
  const pathHeader = document.createElement("div");
  pathHeader.setAttribute("class", "section-header");
  pathHeader.textContent = "Path Segments";

  const addPathBtn = document.createElement("button");
  addPathBtn.setAttribute("class", "add-btn");
  addPathBtn.setAttribute("id", "add-path");
  addPathBtn.innerHTML = '<i class="fa fa-plus"></i> Add field';
  addPathBtn.addEventListener('click', () => addPathSegment("", 'path'));

  const pathRow = document.createElement("div");
  pathRow.setAttribute("class", "section-row");
  pathRow.appendChild(pathHeader);
  pathRow.appendChild(addPathBtn);
  mainDiv.appendChild(pathRow);

  const pathContainer = document.createElement("div");
  pathContainer.setAttribute("id", "path-container");
  pathContainer.setAttribute("class", "segment-container");
  mainDiv.appendChild(pathContainer);
  
  // Params section header + inline Add button
  const paramHeader = document.createElement("div");
  paramHeader.setAttribute("class", "section-header");
  paramHeader.textContent = "URL Parameters";

  const addParamBtn = document.createElement("button");
  addParamBtn.setAttribute("class", "add-btn");
  addParamBtn.setAttribute("id", "add-param");
  addParamBtn.innerHTML = '<i class="fa fa-plus"></i> Add field';
  addParamBtn.addEventListener('click', () => addParamField("", ""));

  const paramRow = document.createElement("div");
  paramRow.setAttribute("class", "section-row");
  paramRow.appendChild(paramHeader);
  paramRow.appendChild(addParamBtn);
  mainDiv.appendChild(paramRow);

  const paramContainer = document.createElement("div");
  paramContainer.setAttribute("id", "param-container");
  paramContainer.setAttribute("class", "segment-container");
  mainDiv.appendChild(paramContainer);
}

function addPathSegment(value, source = 'path', isFirstHash = false) {
  const pathContainer = document.getElementById("path-container");
  const currentId = pathCount++;
  
  const segment = document.createElement("div");
  segment.setAttribute("class", "segment-item");
  segment.setAttribute("id", "path_" + currentId);
  segment.dataset.source = source; // mark origin ('path' or 'hash')
  
  const slashSpan = document.createElement("span");
  slashSpan.setAttribute("class", "slash");
  // always show a slash icon; the first hash will include '#' in the input value instead
  slashSpan.textContent = "/";

  // checkbox to include/exclude this segment when updating (placed before trash)
  const check = document.createElement('input');
  check.setAttribute('type', 'checkbox');
  check.setAttribute('class', 'segment-check');
  check.checked = true;
  check.style.marginLeft = '8px';
  
  const input = document.createElement("input");
  input.setAttribute("type", "text");
  // if this is the first hash segment, show '#' inside the input value (not as separate icon)
  const displayValue = (source === 'hash' && isFirstHash)
    ? (value && value.startsWith('#') ? value : ('#' + value))
    : value;
  input.setAttribute("value", displayValue);
  input.setAttribute("class", "segment-input");

  // Enter key triggers update
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') updateUrl(); });
  
  const removeBtn = document.createElement("button");
  removeBtn.setAttribute("class", "remove-btn");
  removeBtn.innerHTML = '<i class="fa fa-trash-o"></i>';
  removeBtn.addEventListener('click', () => {
    const el = document.getElementById("path_" + currentId);
    if (!el) return;
    removeRowWithShift(el, '#path-container');
  });
  
  // prepare entry animation, insert at top, then trigger it
  segment.classList.add('new');
  segment.appendChild(slashSpan);
  segment.appendChild(input);
  segment.appendChild(check);
  segment.appendChild(removeBtn);
  pathContainer.insertBefore(segment, pathContainer.firstChild);
  // trigger the animation by removing the class
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { segment.classList.remove('new'); });
  });
}

function addParamField(key, value) {
  const paramContainer = document.getElementById("param-container");
  const currentId = paramCount++;
  
  const paramItem = document.createElement("div");
  paramItem.setAttribute("class", "param-item");
  paramItem.setAttribute("id", "param_" + currentId);
  
  const keyInput = document.createElement("input");
  keyInput.setAttribute("type", "text");
  keyInput.setAttribute("value", key);
  keyInput.setAttribute("placeholder", "key");
  keyInput.setAttribute("class", "param-key");
  keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') updateUrl(); });
  
  const equalsSpan = document.createElement("span");
  equalsSpan.setAttribute("class", "equals");
  equalsSpan.textContent = "=";
  
  const valueInput = document.createElement("input");
  valueInput.setAttribute("type", "text");
  valueInput.setAttribute("value", value);
  valueInput.setAttribute("placeholder", "value");
  valueInput.setAttribute("class", "param-value");
  valueInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') updateUrl(); });

  // checkbox to include/exclude this parameter when updating (placed before trash)
  const check = document.createElement('input');
  check.setAttribute('type', 'checkbox');
  check.setAttribute('class', 'param-check');
  check.checked = true;
  check.style.marginLeft = '8px';
  
  const removeBtn = document.createElement("button");
  removeBtn.setAttribute("class", "remove-btn");
  removeBtn.innerHTML = '<i class="fa fa-trash-o"></i>';
  removeBtn.addEventListener('click', () => {
    const el = document.getElementById("param_" + currentId);
    if (!el) return;
    removeRowWithShift(el, '#param-container');
  });
  
  // prepare entry animation, insert at top, then trigger it
  paramItem.classList.add('new');
  paramItem.appendChild(keyInput);
  paramItem.appendChild(equalsSpan);
  paramItem.appendChild(valueInput);
  paramItem.appendChild(check);
  paramItem.appendChild(removeBtn);
  paramContainer.insertBefore(paramItem, paramContainer.firstChild);
  // trigger the animation by removing the class
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { paramItem.classList.remove('new'); });
  });
}

function updateUrl() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    const currentUrl = new URL(activeTab.url);
    
    // Build new URL
    let newUrl = currentUrl.protocol + "//";
    
    // Add hostname
    const hostname = document.getElementById("hostname").value;
    newUrl += hostname;
    
    // Add port if exists
    const portInput = document.getElementById("port");
    if (portInput && portInput.value) {
      newUrl += ":" + portInput.value;
    }
    
    // Add path segments (only those marked as 'path') and collect hash segments
    const allPathItems = Array.from(document.querySelectorAll("#path-container .segment-item"));
    const pathParts = [];
    const hashParts = [];
    allPathItems.forEach(item => {
      const checkbox = item.querySelector('.segment-check');
      if (checkbox && !checkbox.checked) return; // skip unchecked
      const input = item.querySelector('.segment-input');
      const source = (item.dataset && item.dataset.source) || 'path';
      let val = input.value.trim();
      if (val === '') return;
      if (source === 'hash') val = val.replace(/^#/, '');
      if (val === '') return;
      if (source === 'path') pathParts.push(val);
      else if (source === 'hash') hashParts.push(val);
    });
    pathParts.forEach(p => { newUrl += '/' + p; });
    
    // Add parameters (only those with checkbox checked)
    const paramItems = Array.from(document.querySelectorAll("#param-container .param-item"));
    const params = [];
    paramItems.forEach(item => {
      const checkbox = item.querySelector('.param-check');
      if (checkbox && !checkbox.checked) return;
      const keyInput = item.querySelector(".param-key");
      const valueInput = item.querySelector(".param-value");
      if (keyInput.value.trim() !== "") {
        params.push(keyInput.value.trim() + "=" + encodeURIComponent(valueInput.value));
      }
    });
    
    if (params.length > 0) {
      newUrl += "?" + params.join("&");
    }
    
    // Rebuild hash from hash-origin segments, or preserve existing hash
    if (hashParts.length > 0) {
      newUrl += '#' + hashParts.join('/');
    } else if (currentUrl.hash) {
      newUrl += currentUrl.hash;
    }
    
    chrome.tabs.update(undefined, { url: newUrl });
  });
}

// FLIP-style remove: animate removed row, then shift siblings smoothly into place
function removeRowWithShift(el, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container || !el) {
    if (el) el.remove();
    return;
  }

  // capture initial positions of all items in the container
  const items = Array.from(container.children);
  const initialRects = new Map();
  items.forEach(item => {
    initialRects.set(item.id, item.getBoundingClientRect());
  });

  // play remove animation on the target
  el.classList.add('removing');

  // wait for the remove animation to finish (match CSS: 180-200ms)
  const REMOVE_MS = 200;
  setTimeout(() => {
    // remove element from DOM
    el.remove();

    // capture new positions
    const newItems = Array.from(container.children);
    const newRects = new Map();
    newItems.forEach(item => {
      newRects.set(item.id, item.getBoundingClientRect());
    });

    // apply inverse transform to each remaining item to keep visual position
    newItems.forEach(item => {
      const id = item.id;
      const before = initialRects.get(id);
      const after = newRects.get(id);
      if (!before || !after) return;
      const deltaY = before.top - after.top;
      if (deltaY === 0) return;
      // temporarily disable transitions and set transform
      item.style.transition = 'none';
      item.style.transform = `translateY(${deltaY}px)`;
      // force reflow
      void item.offsetWidth;
      // animate to new position
      item.style.transition = 'transform 220ms ease';
      item.style.transform = '';
      // cleanup after transition
      const onEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        item.style.transition = '';
        item.style.transform = '';
        item.removeEventListener('transitionend', onEnd);
      };
      item.addEventListener('transitionend', onEnd);
    });
  }, REMOVE_MS);
}

function addUpdateButton() {
  const updateBtn = document.createElement("button");
  updateBtn.setAttribute("id", "update-btn");
  updateBtn.setAttribute("class", "update-btn");
  updateBtn.innerHTML = '<i class="fa fa-refresh"></i> Update';
  
  updateBtn.addEventListener('click', () => {
    updateUrl();
  });
  
  mainDiv.appendChild(updateBtn);
}