"use strict";

let BasicBundle = require("./basic");
let diskless = require("./diskless");
let crypto = require("crypto");

exports.VirtualBundle = class VirtualBundle extends BasicBundle {
	constructor(referenceDir, config, { browsers }) {
		super(config, { browsers });
		// inject diskless plugin, initializing it with existing resolver
		// this is pretty convoluted, but necessary due to Rollup limitations
		// (see diskless internals for details)
		let { plugins } = this._config.readConfig;
		let resolver = plugins.find(plugin => plugin.name === "node-resolve");
		let plugin = diskless(referenceDir, resolver);
		plugins.unshift(plugin);
		this.diskless = plugin;
	}

	compile(source) {
		let { diskless } = this;
		// NB: unique-ish ID avoids potential race condition for concurrent
		//     access with identical sources
		// TODO: does file extension matter?
		let id = generateHash(new Date().getTime() + source);
		let filename = `entry_point_${id}.js`;

		diskless.register(filename, source);
		let cleanup = () => void diskless.deregister(filename);

		return super.compile(diskless.prefix + filename).
			then(res => {
				cleanup();
				return res;
			}).
			catch(err => {
				cleanup();
				throw err;
			});
	}
};

// XXX: duplicates private faucet-core's fingerprinting
function generateHash(str) {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
}
