function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
var MyComponent = function MyComponent() {
    _classCallCheck(this, MyComponent);
};

var el = /*#__PURE__*/ createElement(MyComponent, {
    type: "dummy"
}, /*#__PURE__*/ createElement("my-element", null, "lorem ipsum", /*#__PURE__*/ createElement(Fragment, null, /*#__PURE__*/ createElement("mark", null, "666"), "dolor sit amet")));
console.log(el);
