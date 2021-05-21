// src/component.js
var MyComponent = class {
};
var component_default = MyComponent;

// src/index.jsx
var el = /* @__PURE__ */ createElement(component_default, {
  type: "dummy"
}, /* @__PURE__ */ createElement("my-element", null, "lorem ipsum", /* @__PURE__ */ createElement(Fragment, null, /* @__PURE__ */ createElement("mark", null, "666"), "dolor sit amet")));
console.log(el);
