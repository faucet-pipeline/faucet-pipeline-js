(function () {
'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var MyComponent = function MyComponent() {
  _classCallCheck(this, MyComponent);
};

var el = createElement(MyComponent, {
  type: "dummy"
}, createElement("my-element", null, "lorem ipsum", createElement(Fragment, null, createElement("mark", null, "666"), "dolor sit amet")));
console.log(el);

}());
