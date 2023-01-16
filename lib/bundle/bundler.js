let rollup = require("rollup");

let SMPREFIX = "//# sourceMappingURL=";

module.exports = function generateBundle(entryPoint, config, cache) {
	let { readConfig, writeConfig } = config;
	let options = Object.assign({}, readConfig, {
		input: entryPoint,
		cache
	});
	return rollup.rollup(options).
		then(bundle => {
			cache = bundle;
			return bundle.generate(writeConfig);
		}).
		then(({ output }) => {
			output = output.filter(item => item.type !== "asset"); // XXX: simplistic?
			if(output.length !== 1) { // just to be safe
				throw new Error("unexpected chunking");
			}

			let { code, map, modules } = output[0];
			return {
				code: map ? `${code}\n${SMPREFIX}${map.toUrl()}\n` : code,
				modules: collectModulePaths(modules),
				cache
			};
		});
};

function collectModulePaths(modules) {
	return Object.keys(modules).reduce((memo, id) => {
		// skip plugin helper modules (`"\0"` prefix is a Rollup convention)
		return /\0/.test(id) ? memo : memo.add(id);
	}, new Set());
}
