(function () {
'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

var util = "UTIL";

console.log(`[FOO] ${util}`);

}());
