(function () {
'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

var UTIL = "UTIL";

var MYLIB = "MY-LIB";

console.log(UTIL + MYLIB);

}());
