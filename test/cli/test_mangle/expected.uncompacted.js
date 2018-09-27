(function () {
'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

// dolor sit amet
var util = "UTIL";

// lorem ipsum
function info() {
	console.log(`[…] ${util}`);
}

// dolor sit amet
function help() {
	info();
}

help();

}());
