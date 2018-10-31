"use strict";

let path = require("path");

let PREFIX = "diskless:";

// Rollup plugin for virtual modules
// `referenceDir` is used for relative imports from diskless modules
// `resolver` is the Rollup plugin responsible for import paths
// `modules` maps file names to source code
module.exports = (referenceDir, resolver, modules = new Map(), prefix = PREFIX) => ({
	name: "diskless",
	resolveId(importee, importer) {
		if(importer && importer.startsWith(prefix)) {
			let virtual = path.resolve(referenceDir, importer);
			// this is pretty hacky, but necessary because Rollup doesn't
			// support combining different plugins' `#resolveId`
			return resolver.resolveId(importee, virtual);
		}
		return importee.startsWith(prefix) ? importee : null;
	},
	load(id) {
		if(!id.startsWith(prefix)) {
			return null;
		}

		let filename = id.substr(prefix.length);
		let source = modules.get(filename);
		if(source === undefined) {
			throw new Error(`missing diskless module: ${filename}`);
		}
		return source;
	},
	register(filename, source) {
		modules.set(filename, source);
	},
	deregister(filename) {
		return modules.delete(filename);
	},
	get prefix() {
		return prefix;
	}
});
