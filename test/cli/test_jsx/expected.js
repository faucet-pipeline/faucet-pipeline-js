(function () {
'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var MyComponent = function MyComponent() {
  classCallCheck(this, MyComponent);
};

var el = createElement(
	MyComponent,
	{ type: "dummy" },
	createElement(
		"my-element",
		null,
		"lorem ipsum",
		createElement(
			"mark",
			null,
			"666"
		),
		"dolor sit amet"
	)
);

}());
