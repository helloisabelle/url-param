

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
entries = urlParams.entries();



let button = document.getElementById("add");

button.addEventListener('click', () => {
  for (const entry of entries) {
    addField(entry[0], entry[1]);
  }

});

function addField(key, value){
  console.log("hello");
  let div = document.getElementById("main");
  // Creating the input element.
  let key_field = document.createElement("input");
  key_field.setAttribute("type", "text");
  key_field.setAttribute("name", "notes[]");
  key_field.setAttribute("placeholder", key);

  let equal = document.createElement("span");
  equal.innerHTML = " = ";

  let value_field = document.createElement("input");
  value_field.setAttribute("type", "text");
  value_field.setAttribute("name", "notes[]");
  value_field.setAttribute("placeholder", value);

  div.appendChild(key_field);
  div.appendChild(equal);
  div.appendChild(value_field);
}