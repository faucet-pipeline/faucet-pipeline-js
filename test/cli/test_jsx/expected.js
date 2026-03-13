// src/component.js
var MyComponent = class {
};

// src/index.jsx
var el = createElement(MyComponent, { type: "dummy" }, createElement("my-element", null, "lorem ipsum", createElement(Fragment, null, createElement("mark", null, "666"), "dolor sit amet")));
console.log(el);
