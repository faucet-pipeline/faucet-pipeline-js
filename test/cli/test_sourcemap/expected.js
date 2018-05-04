(function () {
'use strict';

if(typeof global === "undefined" && typeof window !== "undefined") {
	window.global = window;
}

class Util {}

const FOO = "lorem ipsum";
const BAR = "dolor sit amet";

console.log(`~~ ${Util} ~~ ${FOO} ~~ ${BAR} ~~`);

}());

