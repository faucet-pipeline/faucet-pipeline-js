(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
typeof define === 'function' && define.amd ? define(factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MYLIB = factory());
})(this, (function () { 'use strict';

var index = _ => {
	console.log("lipsum");
};

return index;

}));
