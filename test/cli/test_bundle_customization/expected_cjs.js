'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

var index = _ => {
	console.log("lipsum");
};

module.exports = index;
