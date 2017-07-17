(function () {
'use strict';

if(typeof window !== "undefined") { var global = window; }

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var Util = function Util() {
  classCallCheck(this, Util);
};

var FOO = "lorem ipsum";
var BAR = "dolor sit amet";

console.log("~~ " + Util + " ~~ " + FOO + " ~~ " + BAR + " ~~");

}());
