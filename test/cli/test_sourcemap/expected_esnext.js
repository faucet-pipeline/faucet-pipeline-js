(function () {
'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Util = function Util() {
  _classCallCheck(this, Util);
};
var FOO = "lorem ipsum";
var BAR = "dolor sit amet";

console.log("~~ ".concat(Util, " ~~ ").concat(FOO, " ~~ ").concat(BAR, " ~~"));

}());

