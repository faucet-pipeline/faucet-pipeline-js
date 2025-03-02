function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _createClass(e, r, t) {
  return Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}

var MyComponent = /*#__PURE__*/_createClass(function MyComponent() {
  _classCallCheck(this, MyComponent);
});

var el = createElement(MyComponent, {
  type: "dummy"
}, createElement("my-element", null, "lorem ipsum", createElement(Fragment, null, createElement("mark", null, "666"), "dolor sit amet")));
console.log(el);
