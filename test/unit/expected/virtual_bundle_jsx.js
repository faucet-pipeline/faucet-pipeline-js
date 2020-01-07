'use strict';

var UTIL = "UTIL";

var MYLIB = "MY-LIB";

function createElement(tag, params, ...children) {
  return `<${tag} ${JSON.stringify(params)}>${JSON.stringify(children)}</${tag}>`;
}

function Button({
  type,
  label
}) {
  return createElement("button", {
    type: type
  }, label);
}
function List(_, ...children) {
  return createElement("ul", null, children.map(item => createElement("li", null, item)));
}

console.log(createElement(List, null, createElement(Button, {
  label: UTIL
}), createElement(Fragment, null, createElement(Button, {
  type: "reset",
  label: MYLIB
}))));
